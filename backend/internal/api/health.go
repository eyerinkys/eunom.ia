package api

import (
	"database/sql"
	"net/http"
	"time"
)

// HealthResponse is the JSON response body for the health endpoint.
type HealthResponse struct {
	Status    string `json:"status"`
	Version   string `json:"version"`
	Timestamp string `json:"timestamp"`
}

// HealthHandler returns an http.HandlerFunc that reports service health.
// It pings the database to verify connectivity.
func HealthHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Check database connectivity.
		if err := db.PingContext(r.Context()); err != nil {
			WriteError(w, http.StatusServiceUnavailable, ErrCodeServiceUnavail, "database unreachable")
			return
		}

		WriteJSON(w, http.StatusOK, HealthResponse{
			Status:    "ok",
			Version:   "0.1.0",
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		})
	}
}
