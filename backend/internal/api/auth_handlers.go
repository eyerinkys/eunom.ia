package api

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/eyerinerror/eunomia/internal/auth"
	"github.com/google/uuid"
)

type RegisterRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	DisplayName string `json:"displayName"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserResponse struct {
	ID          string `json:"id"`
	Email       string `json:"email"`
	DisplayName string `json:"displayName"`
}

// RegisterHandler handles user registration.
func RegisterHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req RegisterRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "Invalid JSON body")
			return
		}

		req.Email = strings.TrimSpace(req.Email)
		if req.Email == "" || req.Password == "" || req.DisplayName == "" {
			WriteValidationError(w, "Validation failed", map[string]interface{}{
				"fields": "email, password, and displayName are required",
			})
			return
		}

		// Hash password
		hash, err := auth.HashPassword(req.Password)
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		userID := uuid.New().String()
		now := time.Now().UTC().Format(time.RFC3339)

		// Start a transaction for user + root folder creation
		tx, err := db.BeginTx(r.Context(), nil)
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		defer tx.Rollback()

		_, err = tx.ExecContext(r.Context(),
			"INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
			userID, req.Email, hash, req.DisplayName, now, now)
		if err != nil {
			// Basic conflict check
			if strings.Contains(err.Error(), "UNIQUE constraint failed") {
				WriteError(w, http.StatusConflict, ErrCodeConflict, "User with this email already exists")
				return
			}
			WriteInternalError(w, err)
			return
		}

		// Create root folder for the user
		rootID := uuid.New().String()
		_, err = tx.ExecContext(r.Context(),
			"INSERT INTO nodes (id, user_id, parent_id, name, type, created_at, updated_at) VALUES (?, ?, NULL, 'ROOT', 'folder', ?, ?)",
			rootID, userID, now, now)
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		if err := tx.Commit(); err != nil {
			WriteInternalError(w, err)
			return
		}

		// Create session
		token, err := auth.GenerateSessionToken()
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		sessionID := uuid.New().String()
		expiresAt := time.Now().UTC().Add(24 * 7 * time.Hour) // 7 days

		_, err = db.ExecContext(r.Context(),
			"INSERT INTO sessions (id, user_id, token, ip_address, user_agent, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
			sessionID, userID, token, r.RemoteAddr, r.UserAgent(), expiresAt.Format(time.RFC3339), now)
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		http.SetCookie(w, auth.NewSessionCookie(token, 24*7*3600))

		WriteJSON(w, http.StatusCreated, UserResponse{
			ID:          userID,
			Email:       req.Email,
			DisplayName: req.DisplayName,
		})
	}
}

// LoginHandler handles user login.
func LoginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			WriteError(w, http.StatusBadRequest, ErrCodeBadRequest, "Invalid JSON body")
			return
		}

		var id, hash, displayName string
		err := db.QueryRowContext(r.Context(), "SELECT id, password_hash, display_name FROM users WHERE email = ?", req.Email).Scan(&id, &hash, &displayName)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				WriteUnauthorized(w, "Invalid email or password")
				return
			}
			WriteInternalError(w, err)
			return
		}

		match, err := auth.VerifyPassword(hash, req.Password)
		if err != nil {
			WriteInternalError(w, err)
			return
		}
		if !match {
			WriteUnauthorized(w, "Invalid email or password")
			return
		}

		token, err := auth.GenerateSessionToken()
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		sessionID := uuid.New().String()
		expiresAt := time.Now().UTC().Add(24 * 7 * time.Hour)
		now := time.Now().UTC().Format(time.RFC3339)

		_, err = db.ExecContext(r.Context(),
			"INSERT INTO sessions (id, user_id, token, ip_address, user_agent, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
			sessionID, id, token, r.RemoteAddr, r.UserAgent(), expiresAt.Format(time.RFC3339), now)
		if err != nil {
			WriteInternalError(w, err)
			return
		}

		http.SetCookie(w, auth.NewSessionCookie(token, 24*7*3600))

		WriteJSON(w, http.StatusOK, UserResponse{
			ID:          id,
			Email:       req.Email,
			DisplayName: displayName,
		})
	}
}

// LogoutHandler handles user logout.
func LogoutHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("eunomia_session")
		if err == nil {
			_, _ = db.ExecContext(r.Context(), "DELETE FROM sessions WHERE token = ?", cookie.Value)
		}

		clearCookie := auth.NewSessionCookie("", -1)
		http.SetCookie(w, clearCookie)

		WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	}
}

// MeHandler returns the current authenticated user.
func MeHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		if userID == "" {
			WriteUnauthorized(w, "Not authenticated")
			return
		}

		var resp UserResponse
		resp.ID = userID
		err := db.QueryRowContext(r.Context(), "SELECT email, display_name FROM users WHERE id = ?", userID).Scan(&resp.Email, &resp.DisplayName)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				WriteUnauthorized(w, "User not found")
				return
			}
			WriteInternalError(w, err)
			return
		}

		WriteJSON(w, http.StatusOK, resp)
	}
}
