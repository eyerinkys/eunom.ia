package api

import (
	"database/sql"
	"net/http"

	"github.com/eyerinerror/eunomia/internal/provenance"
	"github.com/go-chi/chi/v5"
)

// ListProvenanceHandler returns all provenance events for a node.
// GET /api/provenance/{nodeId}
func ListProvenanceHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		nodeID := chi.URLParam(r, "nodeId")

		events, err := provenance.ListEvents(r.Context(), db, nodeID, userID)
		if err != nil {
			if err.Error() == "access denied" {
				WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
				return
			}
			if err.Error() == "node not found" {
				WriteNotFound(w, "Node not found")
				return
			}
			WriteInternalError(w, err)
			return
		}

		// Also run a quick verification to return current status
		result, verifyErr := provenance.VerifyChain(r.Context(), db, nodeID, userID)
		if verifyErr != nil {
			// If verification fails, still return events but with UNVERIFIED status
			WriteJSON(w, http.StatusOK, map[string]interface{}{
				"events": events,
				"status": "UNVERIFIED",
			})
			return
		}

		WriteJSON(w, http.StatusOK, map[string]interface{}{
			"events":       events,
			"status":       result.Status,
			"isValid":      result.IsValid,
			"eventsCount":  result.EventsCount,
			"headHash":     result.HeadHash,
			"verifiedAt":   result.VerifiedAt,
		})
	}
}

// VerifyProvenanceHandler runs a full chain verification for a node.
// POST /api/provenance/{nodeId}/verify
func VerifyProvenanceHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := GetUserID(r.Context())
		nodeID := chi.URLParam(r, "nodeId")

		result, err := provenance.VerifyChain(r.Context(), db, nodeID, userID)
		if err != nil {
			if err.Error() == "access denied" {
				WriteError(w, http.StatusForbidden, ErrCodeForbidden, "Access denied")
				return
			}
			if err.Error() == "node not found" {
				WriteNotFound(w, "Node not found")
				return
			}
			WriteInternalError(w, err)
			return
		}

		WriteJSON(w, http.StatusOK, result)
	}
}
