package api

import (
	"archive/zip"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type CreateUploadRequest struct {
	Filename string `json:"filename"`
	MimeType string `json:"mimeType"`
	TotalSize int64 `json:"totalSize"`
}

func ensureDir(path string) error {
	return os.MkdirAll(path, 0755)
}

func getTmpDir() string {
	dir := filepath.Join("data", "tmp")
	ensureDir(dir)
	return dir
}

// CreateUploadSessionHandler
func CreateUploadSessionHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		
		var req CreateUploadRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "Invalid request body")
			return
		}
		
		req.Filename = strings.TrimSpace(req.Filename)
		if req.Filename == "" {
			WriteValidationError(w, "Validation failed", map[string]interface{}{"filename": "required"})
			return
		}
		
		sessionID := uuid.New().String()
		now := time.Now().UTC()
		expiresAt := now.Add(24 * time.Hour).Format(time.RFC3339)
		createdAt := now.Format(time.RFC3339)

		tmpFile, err := os.Create(filepath.Join(getTmpDir(), sessionID))
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		tmpFile.Close()

		_, err = db.ExecContext(r.Context(),
			"INSERT INTO upload_sessions (id, user_id, filename, mime_type, total_size, expires_at, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')",
			sessionID, userID, req.Filename, req.MimeType, req.TotalSize, expiresAt, createdAt)
			
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		
		WriteJSON(w, http.StatusCreated, map[string]string{"sessionId": sessionID})
	}
}

func UploadChunkHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		sessionID := chi.URLParam(r, "sessionId")
		
		var owner string
		err := db.QueryRowContext(r.Context(), "SELECT user_id FROM upload_sessions WHERE id = ?", sessionID).Scan(&owner)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				WriteNotFound(w, "Upload session not found")
				return
			}
			WriteInternalError(w, err)
			return
		}
		if owner != userID {
			WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
			return
		}
		
		path := filepath.Join(getTmpDir(), sessionID)
		f, err := os.OpenFile(path, os.O_APPEND|os.O_WRONLY, 0644)
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		defer f.Close()
		
		n, err := io.Copy(f, r.Body)
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		
		_, err = db.ExecContext(r.Context(), "UPDATE upload_sessions SET uploaded_size = uploaded_size + ?, chunk_count = chunk_count + 1, status = 'uploading' WHERE id = ?", n, sessionID)
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		
		WriteJSON(w, http.StatusOK, map[string]interface{}{"bytesWritten": n})
	}
}

type CompleteUploadRequest struct {
	FolderID string `json:"folderId"`
	Action   string `json:"action"` // "replace", "keep_both", "cancel"
	NodeID   string `json:"nodeId,omitempty"` // For explicit version upload
}

func CompleteUploadHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		sessionID := chi.URLParam(r, "sessionId")
		
		var req CompleteUploadRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "Invalid JSON body")
			return
		}
		
		if req.FolderID == "root" {
			err := db.QueryRowContext(r.Context(), "SELECT id FROM nodes WHERE user_id = ? AND parent_id IS NULL AND name = 'ROOT'", userID).Scan(&req.FolderID)
			if err != nil {
				WriteInternalError(w, err)
				return
			}
		}

		// 1. Verify Session
		var owner, filename, mimeType string
		var totalSize int64
		err := db.QueryRowContext(r.Context(), "SELECT user_id, filename, mime_type, total_size FROM upload_sessions WHERE id = ?", sessionID).Scan(&owner, &filename, &mimeType, &totalSize)
		if err != nil {
			WriteNotFound(w, "Upload session not found")
			return
		}
		if owner != userID {
			WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
			return
		}
		if req.Action == "cancel" {
			db.ExecContext(r.Context(), "UPDATE upload_sessions SET status = 'cancelled' WHERE id = ?", sessionID)
			os.Remove(filepath.Join(getTmpDir(), sessionID))
			WriteJSON(w, http.StatusOK, map[string]string{"status": "cancelled"})
			return
		}

		// 2. Compute Hash
		tmpPath := filepath.Join(getTmpDir(), sessionID)
		f, err := os.Open(tmpPath)
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		
		hash := sha256.New()
		actualSize, err := io.Copy(hash, f)
		f.Close()
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		
		fullHash := hex.EncodeToString(hash.Sum(nil))
		
		// 3. Check for Collisions and Unchanged Content
		var existingNodeID string
		var existingType string

		if req.NodeID != "" {
			// Explicit version upload for an existing node
			existingNodeID = req.NodeID
			var existingName string
			err = db.QueryRowContext(r.Context(), "SELECT name, type FROM nodes WHERE id = ? AND user_id = ? AND deleted_at IS NULL", existingNodeID, userID).Scan(&existingName, &existingType)
			if err != nil {
				WriteNotFound(w, "Node not found")
				return
			}
			if existingType != "file" {
				WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "Cannot upload a version to a folder")
				return
			}

			// Validate file extension match to prevent file corruption
			existingExt := strings.ToLower(filepath.Ext(existingName))
			newExt := strings.ToLower(filepath.Ext(filename))
			if existingExt != "" && existingExt != newExt {
				WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, fmt.Sprintf("File extension mismatch: cannot upload %s to %s file", newExt, existingExt))
				return
			}

			req.Action = "replace"
		} else {
			err = db.QueryRowContext(r.Context(), "SELECT id, type FROM nodes WHERE parent_id = ? AND user_id = ? AND name = ? AND deleted_at IS NULL", req.FolderID, userID, filename).Scan(&existingNodeID, &existingType)
			
			isCollision := err == nil
			if isCollision {
				if existingType == "folder" {
					WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "A folder with this name already exists")
					return
				}
				if req.Action == "" {
					WriteError(w, http.StatusConflict, ErrCodeConflict, "Filename collision detected")
					return
				}
				
				if req.Action == "keep_both" {
					ext := filepath.Ext(filename)
					base := strings.TrimSuffix(filename, ext)
					filename = fmt.Sprintf("%s (1)%s", base, ext)
					existingNodeID = ""
				} else if req.Action != "replace" {
					WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "Invalid action")
					return
				}
			}
		}

		// Unchanged-content detection
		if existingNodeID != "" && req.Action == "replace" {
			var latestBlobHash sql.NullString
			err = db.QueryRowContext(r.Context(), "SELECT blob_hash FROM file_versions WHERE node_id = ? ORDER BY version_number DESC LIMIT 1", existingNodeID).Scan(&latestBlobHash)
			if err == nil && latestBlobHash.Valid && latestBlobHash.String == fullHash {
				os.Remove(tmpPath)
				db.ExecContext(r.Context(), "UPDATE upload_sessions SET status = 'complete', node_id = ? WHERE id = ?", existingNodeID, sessionID)
				WriteJSON(w, http.StatusOK, map[string]interface{}{
					"status": "unchanged",
					"nodeId": existingNodeID,
					"hash": fullHash,
				})
				return
			}
		}

		// 4. Move to CAS
		firstTwo := fullHash[:2]
		nextTwo := fullHash[2:4]
		casDir := filepath.Join("data", "blobs", "sha256", firstTwo, nextTwo)
		ensureDir(casDir)
		casPath := filepath.Join(casDir, fullHash)
		
		var blobExists bool
		err = db.QueryRowContext(r.Context(), "SELECT 1 FROM blobs WHERE sha256 = ?", fullHash).Scan(&blobExists)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			WriteInternalError(w, err)
			return
		}
		
		now := time.Now().UTC().Format(time.RFC3339)
		tx, err := db.BeginTx(r.Context(), nil)
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		defer tx.Rollback()

		if !blobExists {
			err = os.Rename(tmpPath, casPath)
			if err != nil {
				WriteInternalError(w, err)
				return
			}
			_, err = tx.Exec("INSERT INTO blobs (sha256, size_bytes, storage_path, ref_count, created_at) VALUES (?, ?, ?, 1, ?)", fullHash, actualSize, casPath, now)
			if err != nil {
				WriteInternalError(w, err)
				return
			}
		} else {
			_, err = tx.Exec("UPDATE blobs SET ref_count = ref_count + 1 WHERE sha256 = ?", fullHash)
			if err != nil {
				WriteInternalError(w, err)
				return
			}
			os.Remove(tmpPath)
		}

		// 5. Node Creation/Update
		var nodeID string
		var versionNumber int = 1
		var prevEventHash sql.NullString
		
		if existingNodeID != "" && req.Action == "replace" {
			nodeID = existingNodeID
			err = tx.QueryRow("SELECT COALESCE(MAX(version_number), 0) FROM file_versions WHERE node_id = ?", nodeID).Scan(&versionNumber)
			if err != nil {
				WriteInternalError(w, err)
				return
			}
			versionNumber++
			_, err = tx.Exec("UPDATE nodes SET updated_at = ?, mime_type = ? WHERE id = ?", now, mimeType, nodeID)
			if err != nil {
				WriteInternalError(w, err)
				return
			}
			
			err = tx.QueryRow("SELECT event_hash FROM provenance_events WHERE node_id = ? ORDER BY created_at DESC LIMIT 1", nodeID).Scan(&prevEventHash)
			if err != nil && !errors.Is(err, sql.ErrNoRows) {
				WriteInternalError(w, err)
				return
			}
		} else {
			nodeID = uuid.New().String()
			_, err = tx.Exec("INSERT INTO nodes (id, user_id, parent_id, name, type, mime_type, created_at, updated_at) VALUES (?, ?, ?, ?, 'file', ?, ?, ?)",
				nodeID, userID, req.FolderID, filename, mimeType, now, now)
			if err != nil {
				WriteInternalError(w, err)
				return
			}
		}

		// 6. Version and Provenance
		versionID := uuid.New().String()
		_, err = tx.Exec("INSERT INTO file_versions (id, node_id, blob_hash, version_number, size_bytes, author_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
			versionID, nodeID, fullHash, versionNumber, actualSize, userID, now)
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		
		prevHashStr := ""
		if prevEventHash.Valid {
			prevHashStr = prevEventHash.String
		}
		eventPayload := fmt.Sprintf("%s:%s:%s:%s:%s", nodeID, versionID, fullHash, prevHashStr, now)
		eventHashBytes := sha256.Sum256([]byte(eventPayload))
		eventHash := hex.EncodeToString(eventHashBytes[:])
		
		eventID := uuid.New().String()
		_, err = tx.Exec("INSERT INTO provenance_events (id, node_id, version_id, blob_hash, previous_event_hash, event_hash, event_type, actor_id, created_at) VALUES (?, ?, ?, ?, ?, ?, 'version_created', ?, ?)",
			eventID, nodeID, versionID, fullHash, prevEventHash, eventHash, userID, now)
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		
		_, err = tx.Exec("UPDATE upload_sessions SET status = 'complete', node_id = ? WHERE id = ?", nodeID, sessionID)
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		if err = tx.Commit(); err != nil {
			WriteInternalError(w, err)
			return
		}

		WriteJSON(w, http.StatusOK, map[string]interface{}{
			"status": "success",
			"nodeId": nodeID,
			"hash": fullHash,
		})
	}
}

func CancelUploadHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		sessionID := chi.URLParam(r, "sessionId")
		
		var owner string
		err := db.QueryRowContext(r.Context(), "SELECT user_id FROM upload_sessions WHERE id = ?", sessionID).Scan(&owner)
		if err != nil {
			WriteNotFound(w, "Upload session not found")
			return
		}
		if owner != userID {
			WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
			return
		}
		
		db.ExecContext(r.Context(), "UPDATE upload_sessions SET status = 'cancelled' WHERE id = ?", sessionID)
		os.Remove(filepath.Join(getTmpDir(), sessionID))
		
		WriteJSON(w, http.StatusOK, map[string]string{"status": "cancelled"})
	}
}

func DownloadFileHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		nodeID := chi.URLParam(r, "nodeId")
		
		var owner, name, blobHash, storagePath string
		
		query := `
		SELECT n.user_id, n.name, fv.blob_hash, b.storage_path
		FROM nodes n
		JOIN file_versions fv ON fv.node_id = n.id
		JOIN blobs b ON b.sha256 = fv.blob_hash
		WHERE n.id = ? AND n.deleted_at IS NULL
		ORDER BY fv.version_number DESC LIMIT 1
		`
		err := db.QueryRowContext(r.Context(), query, nodeID).Scan(&owner, &name, &blobHash, &storagePath)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				WriteNotFound(w, "File not found")
				return
			}
			WriteInternalError(w, err)
			return
		}
		
		if owner != userID {
			WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
			return
		}
		
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", name))
		http.ServeFile(w, r, storagePath)
	}
}

type DownloadZipRequest struct {
	NodeIDs []string `json:"nodeIds"`
}

func DownloadZipHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		
		var req DownloadZipRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || len(req.NodeIDs) == 0 {
			WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "Invalid request body or empty nodeIds")
			return
		}

		w.Header().Set("Content-Type", "application/zip")
		w.Header().Set("Content-Disposition", "attachment; filename=\"eunomia_archive.zip\"")

		zw := zip.NewWriter(w)
		defer zw.Close()

		query := `
		SELECT n.id, n.user_id, n.name, b.storage_path
		FROM nodes n
		JOIN file_versions fv ON fv.node_id = n.id
		JOIN blobs b ON b.sha256 = fv.blob_hash
		WHERE n.id = ? AND n.deleted_at IS NULL
		ORDER BY fv.version_number DESC LIMIT 1
		`

		usedNames := make(map[string]int)

		for _, id := range req.NodeIDs {
			var nodeID, owner, name, storagePath string
			err := db.QueryRowContext(r.Context(), query, id).Scan(&nodeID, &owner, &name, &storagePath)
			if err != nil || owner != userID {
				continue
			}

			fileNameInZip := name
			if count, exists := usedNames[name]; exists {
				usedNames[name] = count + 1
				ext := filepath.Ext(name)
				base := strings.TrimSuffix(name, ext)
				fileNameInZip = fmt.Sprintf("%s (%d)%s", base, count, ext)
			} else {
				usedNames[name] = 1
			}

			f, err := os.Open(storagePath)
			if err != nil {
				continue
			}

			wInZip, err := zw.Create(fileNameInZip)
			if err != nil {
				f.Close()
				continue
			}

			_, _ = io.Copy(wInZip, f)
			f.Close()
		}
	}
}

type ApiFileVersion struct {
	ID             string `json:"id"`
	Version        string `json:"version"` // e.g. "v1"
	Timestamp      string `json:"timestamp"`
	SizeBytes      int64  `json:"sizeBytes"`
	SizeFormatted  string `json:"sizeFormatted"`
	Author         string `json:"author"`
	CommitNote     string `json:"commitNote"`
	Hash           string `json:"hash"`
	ParentHash     string `json:"parentHash"`
}

func ListVersionsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		nodeID := chi.URLParam(r, "nodeId")

		// Verify ownership
		var owner string
		err := db.QueryRowContext(r.Context(), "SELECT user_id FROM nodes WHERE id = ?", nodeID).Scan(&owner)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				WriteJSON(w, http.StatusOK, map[string]interface{}{
					"versions": []ApiFileVersion{},
				})
				return
			}
			WriteInternalError(w, err)
			return
		}
		if owner != userID {
			WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
			return
		}

		query := `
		SELECT fv.id, fv.version_number, fv.created_at, fv.size_bytes, COALESCE(u.display_name, ''), fv.commit_note, fv.blob_hash
		FROM file_versions fv
		LEFT JOIN users u ON fv.author_id = u.id
		WHERE fv.node_id = ?
		ORDER BY fv.version_number DESC
		`
		rows, err := db.QueryContext(r.Context(), query, nodeID)
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		defer rows.Close()

		var versions []ApiFileVersion
		for rows.Next() {
			var v ApiFileVersion
			var vNum int
			if err := rows.Scan(&v.ID, &vNum, &v.Timestamp, &v.SizeBytes, &v.Author, &v.CommitNote, &v.Hash); err != nil {
				WriteInternalError(w, err)
				return
			}
			v.Version = fmt.Sprintf("v%d", vNum)
			versions = append(versions, v)
		}

		if versions == nil {
			versions = []ApiFileVersion{}
		}
		
		for i := 0; i < len(versions)-1; i++ {
			versions[i].ParentHash = versions[i+1].Hash
		}

		WriteJSON(w, http.StatusOK, map[string]interface{}{
			"versions": versions,
		})
	}
}

func RestoreVersionHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		nodeID := chi.URLParam(r, "nodeId")
		versionID := chi.URLParam(r, "versionId")

		var owner string
		err := db.QueryRowContext(r.Context(), "SELECT user_id FROM nodes WHERE id = ?", nodeID).Scan(&owner)
		if err != nil || owner != userID {
			WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
			return
		}

		var blobHash string
		var sizeBytes int64
		var restoredVersionNum int
		err = db.QueryRowContext(r.Context(), "SELECT blob_hash, size_bytes, version_number FROM file_versions WHERE id = ? AND node_id = ?", versionID, nodeID).Scan(&blobHash, &sizeBytes, &restoredVersionNum)
		if err != nil {
			WriteNotFound(w, "Version not found")
			return
		}

		tx, err := db.BeginTx(r.Context(), nil)
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		defer tx.Rollback()

		var nextVersionNum int
		err = tx.QueryRow("SELECT COALESCE(MAX(version_number), 0) + 1 FROM file_versions WHERE node_id = ?", nodeID).Scan(&nextVersionNum)
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		newVersionID := uuid.New().String()
		now := time.Now().UTC().Format(time.RFC3339)
		commitNote := fmt.Sprintf("Restored from v%d", restoredVersionNum)

		_, err = tx.Exec("INSERT INTO file_versions (id, node_id, blob_hash, version_number, size_bytes, author_id, commit_note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			newVersionID, nodeID, blobHash, nextVersionNum, sizeBytes, userID, commitNote, now)
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		_, err = tx.Exec("UPDATE nodes SET updated_at = ? WHERE id = ?", now, nodeID)
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		var prevEventHash sql.NullString
		err = tx.QueryRow("SELECT event_hash FROM provenance_events WHERE node_id = ? ORDER BY created_at DESC LIMIT 1", nodeID).Scan(&prevEventHash)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			WriteInternalError(w, err)
			return
		}

		prevHashStr := ""
		if prevEventHash.Valid {
			prevHashStr = prevEventHash.String
		}
		eventPayload := fmt.Sprintf("%s:%s:%s:%s:%s", nodeID, newVersionID, blobHash, prevHashStr, now)
		eventHashBytes := sha256.Sum256([]byte(eventPayload))
		eventHash := hex.EncodeToString(eventHashBytes[:])

		eventID := uuid.New().String()
		_, err = tx.Exec("INSERT INTO provenance_events (id, node_id, version_id, blob_hash, previous_event_hash, event_hash, event_type, actor_id, created_at) VALUES (?, ?, ?, ?, ?, ?, 'version_restored', ?, ?)",
			eventID, nodeID, newVersionID, blobHash, prevEventHash, eventHash, userID, now)
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		if err = tx.Commit(); err != nil {
			WriteInternalError(w, err)
			return
		}

		WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	}
}

func DownloadSpecificVersionHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		nodeID := chi.URLParam(r, "nodeId")
		versionID := chi.URLParam(r, "versionId")
		
		var owner, name, storagePath string
		
		query := `
		SELECT n.user_id, n.name, b.storage_path
		FROM nodes n
		JOIN file_versions fv ON fv.node_id = n.id
		JOIN blobs b ON b.sha256 = fv.blob_hash
		WHERE n.id = ? AND fv.id = ? AND n.deleted_at IS NULL
		`
		err := db.QueryRowContext(r.Context(), query, nodeID, versionID).Scan(&owner, &name, &storagePath)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				WriteNotFound(w, "File or version not found")
				return
			}
			WriteInternalError(w, err)
			return
		}
		
		if owner != userID {
			WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
			return
		}
		
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", name))
		http.ServeFile(w, r, storagePath)
	}
}
