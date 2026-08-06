package api

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/eyerinerror/eunomia/internal/nodes"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type ApiNode struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Type      string  `json:"type"`
	ParentID  *string `json:"parentId"`
	CreatedAt string  `json:"createdAt"`
	UpdatedAt string  `json:"updatedAt"`
}

type NodeListResponse struct {
	Nodes       []ApiNode          `json:"nodes"`
	Breadcrumbs []nodes.Breadcrumb `json:"breadcrumbs"`
}

type CreateFolderRequest struct {
	Name     string `json:"name"`
	ParentID string `json:"parentId"`
}

type UpdateNodeRequest struct {
	Name     *string `json:"name,omitempty"`
	ParentID *string `json:"parentId,omitempty"`
}

// ListNodesHandler lists child nodes of a parent folder.
func ListNodesHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		parentID := r.URL.Query().Get("parent_id")

		if parentID == "" || parentID == "root" {
			err := db.QueryRowContext(r.Context(), "SELECT id FROM nodes WHERE user_id = ? AND parent_id IS NULL AND name = 'ROOT'", userID).Scan(&parentID)
			if err != nil {
				WriteInternalError(w, err)
				return
			}
		}

		// Verify ownership of the parent folder
		var owner string
		var isDeleted sql.NullString
		err := db.QueryRowContext(r.Context(), "SELECT user_id, deleted_at FROM nodes WHERE id = ?", parentID).Scan(&owner, &isDeleted)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				WriteNotFound(w, "Folder not found")
				return
			}
			WriteInternalError(w, err)
			return
		}
		if owner != userID {
			WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
			return
		}
		if isDeleted.Valid {
			WriteNotFound(w, "Folder is deleted")
			return
		}

		// Get children (only folders for Phase 1, but we can query all undeleted)
		rows, err := db.QueryContext(r.Context(),
			"SELECT id, name, type, parent_id, created_at, updated_at FROM nodes WHERE parent_id = ? AND user_id = ? AND deleted_at IS NULL ORDER BY type DESC, name ASC",
			parentID, userID)
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		defer rows.Close()

		var childNodes []ApiNode
		for rows.Next() {
			var n ApiNode
			var pID sql.NullString
			if err := rows.Scan(&n.ID, &n.Name, &n.Type, &pID, &n.CreatedAt, &n.UpdatedAt); err != nil {
				WriteInternalError(w, err)
				return
			}
			if pID.Valid {
				n.ParentID = &pID.String
			}
			childNodes = append(childNodes, n)
		}
		if err := rows.Err(); err != nil {
			WriteInternalError(w, err)
			return
		}

		// Get breadcrumbs
		breadcrumbs, err := nodes.BuildBreadcrumbs(r.Context(), db, parentID, userID)
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		if childNodes == nil {
			childNodes = []ApiNode{}
		}

		WriteJSON(w, http.StatusOK, NodeListResponse{
			Nodes:       childNodes,
			Breadcrumbs: breadcrumbs,
		})
	}
}

// CreateFolderHandler creates a new folder node.
func CreateFolderHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())

		var req CreateFolderRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "Invalid JSON body")
			return
		}

		req.Name = strings.TrimSpace(req.Name)
		if req.Name == "" || req.ParentID == "" {
			WriteValidationError(w, "Validation failed", map[string]interface{}{
				"fields": "name and parentId are required",
			})
			return
		}

		if req.ParentID == "root" {
			err := db.QueryRowContext(r.Context(), "SELECT id FROM nodes WHERE user_id = ? AND parent_id IS NULL AND name = 'ROOT'", userID).Scan(&req.ParentID)
			if err != nil {
				WriteInternalError(w, err)
				return
			}
		}

		// Verify parent ownership
		var owner string
		var parentType string
		var isDeleted sql.NullString
		err := db.QueryRowContext(r.Context(), "SELECT user_id, type, deleted_at FROM nodes WHERE id = ?", req.ParentID).Scan(&owner, &parentType, &isDeleted)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				WriteNotFound(w, "Parent folder not found")
				return
			}
			WriteInternalError(w, err)
			return
		}
		if owner != userID {
			WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
			return
		}
		if parentType != "folder" {
			WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "Parent must be a folder")
			return
		}
		if isDeleted.Valid {
			WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "Parent folder is deleted")
			return
		}

		id := uuid.New().String()
		now := time.Now().UTC().Format(time.RFC3339)

		_, err = db.ExecContext(r.Context(),
			"INSERT INTO nodes (id, user_id, parent_id, name, type, created_at, updated_at) VALUES (?, ?, ?, ?, 'folder', ?, ?)",
			id, userID, req.ParentID, req.Name, now, now)
		if err != nil {
			if strings.Contains(err.Error(), "UNIQUE constraint failed") {
				WriteError(w, http.StatusConflict, ErrCodeConflict, "A folder with this name already exists here")
				return
			}
			WriteInternalError(w, err)
			return
		}

		WriteJSON(w, http.StatusCreated, ApiNode{
			ID:        id,
			Name:      req.Name,
			Type:      "folder",
			ParentID:  &req.ParentID,
			CreatedAt: now,
			UpdatedAt: now,
		})
	}
}

// UpdateNodeHandler renames or moves a node.
func UpdateNodeHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		nodeID := chi.URLParam(r, "id")

		var req UpdateNodeRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "Invalid JSON body")
			return
		}

		// Verify node ownership
		var owner string
		err := db.QueryRowContext(r.Context(), "SELECT user_id FROM nodes WHERE id = ?", nodeID).Scan(&owner)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				WriteNotFound(w, "Node not found")
				return
			}
			WriteInternalError(w, err)
			return
		}
		if owner != userID {
			WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
			return
		}

		if req.Name != nil {
			name := strings.TrimSpace(*req.Name)
			if name == "" {
				WriteValidationError(w, "Validation failed", map[string]interface{}{"name": "cannot be empty"})
				return
			}
			// Update name
			now := time.Now().UTC().Format(time.RFC3339)
			_, err = db.ExecContext(r.Context(), "UPDATE nodes SET name = ?, updated_at = ? WHERE id = ?", name, now, nodeID)
			if err != nil {
				if strings.Contains(err.Error(), "UNIQUE constraint failed") {
					WriteError(w, http.StatusConflict, ErrCodeConflict, "A file or folder with this name already exists here")
					return
				}
				WriteInternalError(w, err)
				return
			}
		}

		if req.ParentID != nil {
			parentID := strings.TrimSpace(*req.ParentID)
			if parentID == "" {
				WriteValidationError(w, "Validation failed", map[string]interface{}{"parentId": "cannot be empty"})
				return
			}
			
			if parentID == "root" {
				err := db.QueryRowContext(r.Context(), "SELECT id FROM nodes WHERE user_id = ? AND parent_id IS NULL AND name = 'ROOT'", userID).Scan(&parentID)
				if err != nil {
					WriteInternalError(w, err)
					return
				}
			}

			// Verify new parent ownership
			var pOwner string
			var pType string
			var pDeleted sql.NullString
			err := db.QueryRowContext(r.Context(), "SELECT user_id, type, deleted_at FROM nodes WHERE id = ?", parentID).Scan(&pOwner, &pType, &pDeleted)
			if err != nil {
				WriteNotFound(w, "New parent folder not found")
				return
			}
			if pOwner != userID || pType != "folder" || pDeleted.Valid {
				WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "Invalid new parent folder")
				return
			}

			// Update parent
			now := time.Now().UTC().Format(time.RFC3339)
			_, err = db.ExecContext(r.Context(), "UPDATE nodes SET parent_id = ?, updated_at = ? WHERE id = ?", parentID, now, nodeID)
			if err != nil {
				if strings.Contains(err.Error(), "UNIQUE constraint failed") {
					WriteError(w, http.StatusConflict, ErrCodeConflict, "A file or folder with this name already exists in the destination")
					return
				}
				WriteInternalError(w, err)
				return
			}
		}

		WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	}
}

// DeleteNodeHandler soft-deletes a node (and its descendants).
func DeleteNodeHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		nodeID := chi.URLParam(r, "id")

		// Verify node ownership
		var owner string
		var name string
		err := db.QueryRowContext(r.Context(), "SELECT user_id, name FROM nodes WHERE id = ?", nodeID).Scan(&owner, &name)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				WriteNotFound(w, "Node not found")
				return
			}
			WriteInternalError(w, err)
			return
		}
		if owner != userID {
			WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
			return
		}
		if name == "ROOT" {
			WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Cannot delete root folder")
			return
		}

		now := time.Now().UTC().Format(time.RFC3339)

		// Recursive CTE to find all descendant node IDs
		query := `
		WITH RECURSIVE descendant_nodes(id) AS (
			SELECT id FROM nodes WHERE id = ?
			UNION ALL
			SELECT n.id FROM nodes n
			JOIN descendant_nodes d ON n.parent_id = d.id
		)
		UPDATE nodes SET deleted_at = ?, updated_at = ?
		WHERE id IN (SELECT id FROM descendant_nodes)
		`
		_, err = db.ExecContext(r.Context(), query, nodeID, now, now)
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	}
}
