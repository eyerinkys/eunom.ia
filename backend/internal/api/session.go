package api

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"time"
)

type contextKey string

const userIDKey contextKey = "userID"

// RequireAuth middleware verifies the session cookie and injects the userID into the context.
func RequireAuth(db *sql.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie("eunomia_session")
			if err != nil {
				WriteUnauthorized(w, "Authentication required")
				return
			}

			token := cookie.Value
			if token == "" {
				WriteUnauthorized(w, "Authentication required")
				return
			}

			var userID, expiresAtStr string
			err = db.QueryRowContext(r.Context(), "SELECT user_id, expires_at FROM sessions WHERE token = ?", token).Scan(&userID, &expiresAtStr)
			if err != nil {
				if errors.Is(err, sql.ErrNoRows) {
					WriteUnauthorized(w, "Invalid or expired session")
					return
				}
				WriteInternalError(w, err)
				return
			}

			expiresAt, err := time.Parse(time.RFC3339, expiresAtStr)
			if err != nil || time.Now().UTC().After(expiresAt) {
				// Clean up expired session if possible, though not strictly required inline
				_, _ = db.ExecContext(r.Context(), "DELETE FROM sessions WHERE token = ?", token)
				WriteUnauthorized(w, "Session expired")
				return
			}

			ctx := context.WithValue(r.Context(), userIDKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetUserID retrieves the authenticated user's ID from the request context.
// Returns an empty string if not found.
func GetUserID(ctx context.Context) string {
	if val, ok := ctx.Value(userIDKey).(string); ok {
		return val
	}
	return ""
}
