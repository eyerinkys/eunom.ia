// Package provenance provides hash-chained authorship provenance tracking
// and cryptographic chain verification for Eunomia file lifecycle events.
package provenance

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// EventType enumerates the lifecycle actions that produce provenance events.
type EventType string

const (
	EventFileCreated     EventType = "file_created"
	EventVersionCreated  EventType = "version_created"
	EventVersionRestored EventType = "version_restored"
	EventMetadataUpdated EventType = "metadata_updated"
)

// Event represents a single hash-chained provenance record.
type Event struct {
	ID                string    `json:"id"`
	NodeID            string    `json:"nodeId"`
	VersionID         string    `json:"versionId,omitempty"`
	ActorID           string    `json:"actorId"`
	ActorName         string    `json:"actorName,omitempty"`
	Action            EventType `json:"action"`
	Timestamp         string    `json:"timestamp"`
	PayloadHash       string    `json:"payloadHash"`
	PreviousEventHash string    `json:"previousEventHash"`
	EventHash         string    `json:"eventHash"`
	BlobHash          string    `json:"blobHash,omitempty"`
	Metadata          string    `json:"metadata,omitempty"`
}

// RecordEventParams contains the input parameters for recording a provenance event.
type RecordEventParams struct {
	NodeID      string
	VersionID   string // Empty for metadata-only events
	ActorID     string
	Action      EventType
	PayloadHash string // SHA-256 of the event-specific payload
	BlobHash    string // Content blob hash (empty for metadata events)
	Metadata    string // JSON metadata string
}

// VerificationResult holds the outcome of a chain verification.
type VerificationResult struct {
	Status        string `json:"status"` // "VALID" or "TAMPERED"
	IsValid       bool   `json:"isValid"`
	FailedEventID string `json:"failedEventId,omitempty"`
	Reason        string `json:"reason,omitempty"`
	EventsCount   int    `json:"eventsCount"`
	HeadHash      string `json:"headHash,omitempty"`
	VerifiedAt    string `json:"verifiedAt"`
}

// ComputeEventHash produces a deterministic SHA-256 hash for a provenance event.
// The hash covers all chain-critical fields in a canonical order:
//
//	SHA256(nodeID + ":" + versionID + ":" + actorID + ":" + action + ":" + timestamp + ":" + payloadHash + ":" + previousEventHash)
func ComputeEventHash(nodeID, versionID, actorID string, action EventType, timestamp, payloadHash, previousEventHash string) string {
	payload := fmt.Sprintf("%s:%s:%s:%s:%s:%s:%s",
		nodeID, versionID, actorID, string(action), timestamp, payloadHash, previousEventHash)
	sum := sha256.Sum256([]byte(payload))
	return hex.EncodeToString(sum[:])
}

// ComputePayloadHash produces a SHA-256 hash of arbitrary payload data.
// For version events this is the blob hash; for metadata events it hashes the change description.
func ComputePayloadHash(data string) string {
	sum := sha256.Sum256([]byte(data))
	return hex.EncodeToString(sum[:])
}

// RecordEvent creates a new provenance event within the given transaction,
// automatically chaining it to the most recent event for the same node.
func RecordEvent(ctx context.Context, tx *sql.Tx, params RecordEventParams) (*Event, error) {
	// Get the previous event hash for this node (head of chain).
	var prevEventHash sql.NullString
	err := tx.QueryRowContext(ctx,
		"SELECT event_hash FROM provenance_events WHERE node_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1",
		params.NodeID,
	).Scan(&prevEventHash)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("querying previous event hash: %w", err)
	}

	prevHashStr := ""
	if prevEventHash.Valid {
		prevHashStr = prevEventHash.String
	}

	now := time.Now().UTC().Format(time.RFC3339)
	eventID := uuid.New().String()

	eventHash := ComputeEventHash(
		params.NodeID,
		params.VersionID,
		params.ActorID,
		params.Action,
		now,
		params.PayloadHash,
		prevHashStr,
	)

	metadata := params.Metadata
	if metadata == "" {
		metadata = "{}"
	}

	// Use sql.NullString for version_id to handle empty values
	var versionIDParam interface{}
	if params.VersionID == "" {
		versionIDParam = nil
	} else {
		versionIDParam = params.VersionID
	}

	_, err = tx.ExecContext(ctx,
		`INSERT INTO provenance_events 
		(id, node_id, version_id, blob_hash, previous_event_hash, event_hash, event_type, actor_id, payload_hash, metadata, created_at) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		eventID,
		params.NodeID,
		versionIDParam,
		params.BlobHash,
		prevEventHash, // sql.NullString: NULL for genesis, string for chain
		eventHash,
		string(params.Action),
		params.ActorID,
		params.PayloadHash,
		metadata,
		now,
	)
	if err != nil {
		return nil, fmt.Errorf("inserting provenance event: %w", err)
	}

	return &Event{
		ID:                eventID,
		NodeID:            params.NodeID,
		VersionID:         params.VersionID,
		ActorID:           params.ActorID,
		Action:            params.Action,
		Timestamp:         now,
		PayloadHash:       params.PayloadHash,
		PreviousEventHash: prevHashStr,
		EventHash:         eventHash,
		BlobHash:          params.BlobHash,
		Metadata:          metadata,
	}, nil
}

// VerifyChain traverses all provenance events for a node in chronological order
// and verifies:
//  1. Each event's previous_event_hash matches the prior event's event_hash.
//  2. Each event's event_hash can be recomputed deterministically from its fields.
//
// Returns a VerificationResult indicating VALID or TAMPERED with diagnostics.
func VerifyChain(ctx context.Context, db *sql.DB, nodeID, userID string) (*VerificationResult, error) {
	now := time.Now().UTC().Format(time.RFC3339)

	// Verify ownership
	var owner string
	err := db.QueryRowContext(ctx, "SELECT user_id FROM nodes WHERE id = ?", nodeID).Scan(&owner)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("node not found")
		}
		return nil, fmt.Errorf("checking node ownership: %w", err)
	}
	if owner != userID {
		return nil, fmt.Errorf("access denied")
	}

	// Fetch all events in chronological order (created_at ASC, rowid ASC for determinism).
	rows, err := db.QueryContext(ctx,
		`SELECT id, node_id, COALESCE(version_id, ''), actor_id, event_type, created_at, 
		        COALESCE(payload_hash, ''), COALESCE(previous_event_hash, ''), event_hash, COALESCE(blob_hash, ''), COALESCE(metadata, '{}')
		FROM provenance_events 
		WHERE node_id = ? 
		ORDER BY created_at ASC, rowid ASC`,
		nodeID,
	)
	if err != nil {
		return nil, fmt.Errorf("querying provenance events: %w", err)
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		var e Event
		var actionStr string
		if err := rows.Scan(
			&e.ID, &e.NodeID, &e.VersionID, &e.ActorID, &actionStr,
			&e.Timestamp, &e.PayloadHash, &e.PreviousEventHash, &e.EventHash,
			&e.BlobHash, &e.Metadata,
		); err != nil {
			return nil, fmt.Errorf("scanning event row: %w", err)
		}
		e.Action = EventType(actionStr)
		events = append(events, e)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating event rows: %w", err)
	}

	if len(events) == 0 {
		return &VerificationResult{
			Status:      "VALID",
			IsValid:     true,
			EventsCount: 0,
			VerifiedAt:  now,
			Reason:      "No provenance events recorded for this file.",
		}, nil
	}

	// Walk the chain and verify each link.
	var lastEventHash string
	for i, evt := range events {
		// Check 1: Previous event hash continuity.
		if i == 0 {
			// Genesis event must have empty previous_event_hash.
			if evt.PreviousEventHash != "" {
				return &VerificationResult{
					Status:        "TAMPERED",
					IsValid:       false,
					FailedEventID: evt.ID,
					EventsCount:   len(events),
					VerifiedAt:    now,
					Reason:        fmt.Sprintf("Genesis event %s has non-empty previous_event_hash (expected empty, got %s).", evt.ID, evt.PreviousEventHash[:min(16, len(evt.PreviousEventHash))]),
				}, nil
			}
		} else {
			if evt.PreviousEventHash != lastEventHash {
				return &VerificationResult{
					Status:        "TAMPERED",
					IsValid:       false,
					FailedEventID: evt.ID,
					EventsCount:   len(events),
					VerifiedAt:    now,
					Reason:        fmt.Sprintf("Event %d (%s) previous_event_hash mismatch: expected %s, got %s.", i+1, evt.ID, truncHash(lastEventHash), truncHash(evt.PreviousEventHash)),
				}, nil
			}
		}

		// Check 2: Recompute event hash and verify integrity.
		recomputed := ComputeEventHash(
			evt.NodeID,
			evt.VersionID,
			evt.ActorID,
			evt.Action,
			evt.Timestamp,
			evt.PayloadHash,
			evt.PreviousEventHash,
		)
		if recomputed != evt.EventHash {
			return &VerificationResult{
				Status:        "TAMPERED",
				IsValid:       false,
				FailedEventID: evt.ID,
				EventsCount:   len(events),
				VerifiedAt:    now,
				Reason:        fmt.Sprintf("Event %d (%s) hash integrity failure: stored %s, recomputed %s.", i+1, evt.ID, truncHash(evt.EventHash), truncHash(recomputed)),
			}, nil
		}

		lastEventHash = evt.EventHash
	}

	return &VerificationResult{
		Status:      "VALID",
		IsValid:     true,
		EventsCount: len(events),
		HeadHash:    lastEventHash,
		VerifiedAt:  now,
	}, nil
}

// ListEvents returns all provenance events for a node in chronological order,
// enriched with actor display names.
func ListEvents(ctx context.Context, db *sql.DB, nodeID, userID string) ([]Event, error) {
	// Verify ownership
	var owner string
	err := db.QueryRowContext(ctx, "SELECT user_id FROM nodes WHERE id = ?", nodeID).Scan(&owner)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("node not found")
		}
		return nil, fmt.Errorf("checking node ownership: %w", err)
	}
	if owner != userID {
		return nil, fmt.Errorf("access denied")
	}

	rows, err := db.QueryContext(ctx,
		`SELECT pe.id, pe.node_id, COALESCE(pe.version_id, ''), pe.actor_id, COALESCE(u.display_name, ''),
		        pe.event_type, pe.created_at, COALESCE(pe.payload_hash, ''), 
		        COALESCE(pe.previous_event_hash, ''), pe.event_hash, COALESCE(pe.blob_hash, ''), COALESCE(pe.metadata, '{}')
		FROM provenance_events pe
		LEFT JOIN users u ON pe.actor_id = u.id
		WHERE pe.node_id = ? 
		ORDER BY pe.created_at ASC, pe.rowid ASC`,
		nodeID,
	)
	if err != nil {
		return nil, fmt.Errorf("querying provenance events: %w", err)
	}
	defer rows.Close()

	var events []Event
	for rows.Next() {
		var e Event
		var actionStr string
		if err := rows.Scan(
			&e.ID, &e.NodeID, &e.VersionID, &e.ActorID, &e.ActorName,
			&actionStr, &e.Timestamp, &e.PayloadHash,
			&e.PreviousEventHash, &e.EventHash, &e.BlobHash, &e.Metadata,
		); err != nil {
			return nil, fmt.Errorf("scanning event row: %w", err)
		}
		e.Action = EventType(actionStr)
		events = append(events, e)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterating event rows: %w", err)
	}

	if events == nil {
		events = []Event{}
	}

	return events, nil
}

// truncHash returns the first 16 characters of a hash for diagnostic messages.
func truncHash(h string) string {
	if len(h) > 16 {
		return h[:16] + "..."
	}
	return h
}
