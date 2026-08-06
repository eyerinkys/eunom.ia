package provenance

import (
	"context"
	"database/sql"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	_ "modernc.org/sqlite"
)

// setupTestDB creates an in-memory SQLite database with the required schema.
func setupTestDB(t *testing.T) *sql.DB {
	t.Helper()

	db, err := sql.Open("sqlite", ":memory:?_foreign_keys=ON")
	if err != nil {
		t.Fatalf("opening test db: %v", err)
	}

	// Create minimal schema required for provenance testing.
	schema := `
	CREATE TABLE users (
		id TEXT PRIMARY KEY NOT NULL,
		email TEXT NOT NULL UNIQUE,
		password_hash TEXT NOT NULL,
		display_name TEXT NOT NULL DEFAULT '',
		created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
		updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
	);

	CREATE TABLE nodes (
		id TEXT PRIMARY KEY NOT NULL,
		user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		parent_id TEXT REFERENCES nodes(id) ON DELETE CASCADE,
		name TEXT NOT NULL,
		type TEXT NOT NULL CHECK (type IN ('file', 'folder')),
		mime_type TEXT NOT NULL DEFAULT '',
		created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
		updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
		deleted_at TEXT
	);

	CREATE TABLE blobs (
		sha256 TEXT PRIMARY KEY NOT NULL,
		size_bytes INTEGER NOT NULL,
		storage_path TEXT NOT NULL,
		ref_count INTEGER NOT NULL DEFAULT 1,
		created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
	);

	CREATE TABLE file_versions (
		id TEXT PRIMARY KEY NOT NULL,
		node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
		blob_hash TEXT NOT NULL REFERENCES blobs(sha256),
		version_number INTEGER NOT NULL,
		size_bytes INTEGER NOT NULL,
		commit_note TEXT NOT NULL DEFAULT '',
		author_id TEXT NOT NULL REFERENCES users(id),
		created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
		UNIQUE(node_id, version_number)
	);

	CREATE TABLE provenance_events (
		id TEXT PRIMARY KEY NOT NULL,
		node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
		version_id TEXT REFERENCES file_versions(id) ON DELETE SET NULL,
		blob_hash TEXT NOT NULL DEFAULT '',
		previous_event_hash TEXT,
		event_hash TEXT NOT NULL,
		event_type TEXT NOT NULL DEFAULT 'version_created'
			CHECK (event_type IN ('file_created', 'version_created', 'version_restored', 'metadata_updated')),
		actor_id TEXT NOT NULL REFERENCES users(id),
		payload_hash TEXT NOT NULL DEFAULT '',
		metadata TEXT NOT NULL DEFAULT '{}',
		created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
	);

	CREATE INDEX idx_provenance_events_node_id ON provenance_events(node_id);
	CREATE INDEX idx_provenance_events_event_hash ON provenance_events(event_hash);
	`

	if _, err := db.Exec(schema); err != nil {
		t.Fatalf("creating test schema: %v", err)
	}

	return db
}

// seedTestData inserts a user, root folder, file node, blob, and version for testing.
func seedTestData(t *testing.T, db *sql.DB) (userID, nodeID, versionID, blobHash string) {
	t.Helper()

	userID = uuid.New().String()
	nodeID = uuid.New().String()
	versionID = uuid.New().String()
	rootID := uuid.New().String()
	blobHash = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
	now := time.Now().UTC().Format(time.RFC3339)

	_, err := db.Exec("INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		userID, "test@example.com", "hash123", "Test User", now, now)
	if err != nil {
		t.Fatalf("inserting user: %v", err)
	}

	_, err = db.Exec("INSERT INTO nodes (id, user_id, parent_id, name, type, created_at, updated_at) VALUES (?, ?, NULL, 'ROOT', 'folder', ?, ?)",
		rootID, userID, now, now)
	if err != nil {
		t.Fatalf("inserting root folder: %v", err)
	}

	_, err = db.Exec("INSERT INTO nodes (id, user_id, parent_id, name, type, mime_type, created_at, updated_at) VALUES (?, ?, ?, 'thesis.docx', 'file', 'application/docx', ?, ?)",
		nodeID, userID, rootID, now, now)
	if err != nil {
		t.Fatalf("inserting file node: %v", err)
	}

	_, err = db.Exec("INSERT INTO blobs (sha256, size_bytes, storage_path, ref_count, created_at) VALUES (?, ?, ?, 1, ?)",
		blobHash, 1024, "/tmp/test", now)
	if err != nil {
		t.Fatalf("inserting blob: %v", err)
	}

	_, err = db.Exec("INSERT INTO file_versions (id, node_id, blob_hash, version_number, size_bytes, author_id, created_at) VALUES (?, ?, ?, 1, 1024, ?, ?)",
		versionID, nodeID, blobHash, userID, now)
	if err != nil {
		t.Fatalf("inserting file version: %v", err)
	}

	return
}

// recordTestEvent is a helper that records a provenance event and returns it.
func recordTestEvent(t *testing.T, db *sql.DB, params RecordEventParams) *Event {
	t.Helper()
	tx, err := db.Begin()
	if err != nil {
		t.Fatalf("beginning tx: %v", err)
	}
	evt, err := RecordEvent(context.Background(), tx, params)
	if err != nil {
		tx.Rollback()
		t.Fatalf("recording event: %v", err)
	}
	if err := tx.Commit(); err != nil {
		t.Fatalf("committing tx: %v", err)
	}
	return evt
}

// TestValidChain_FullLifecycle verifies that a complete lifecycle produces a valid chain:
// file_created -> version_created -> metadata_updated -> version_restored
func TestValidChain_FullLifecycle(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	userID, nodeID, versionID, blobHash := seedTestData(t, db)
	ctx := context.Background()

	// Event 1: file_created
	evt1 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   versionID,
		ActorID:     userID,
		Action:      EventFileCreated,
		PayloadHash: blobHash,
		BlobHash:    blobHash,
	})
	if evt1.PreviousEventHash != "" {
		t.Errorf("genesis event should have empty previous_event_hash, got %q", evt1.PreviousEventHash)
	}

	// Small delay to ensure different timestamps
	time.Sleep(10 * time.Millisecond)

	// Event 2: version_created (new version v2)
	v2ID := uuid.New().String()
	blob2 := "b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2"
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := db.Exec("INSERT INTO blobs (sha256, size_bytes, storage_path, ref_count, created_at) VALUES (?, 2048, '/tmp/test2', 1, ?)", blob2, now)
	if err != nil {
		t.Fatalf("inserting blob2: %v", err)
	}
	_, err = db.Exec("INSERT INTO file_versions (id, node_id, blob_hash, version_number, size_bytes, author_id, created_at) VALUES (?, ?, ?, 2, 2048, ?, ?)",
		v2ID, nodeID, blob2, userID, now)
	if err != nil {
		t.Fatalf("inserting version 2: %v", err)
	}

	evt2 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   v2ID,
		ActorID:     userID,
		Action:      EventVersionCreated,
		PayloadHash: blob2,
		BlobHash:    blob2,
	})
	if evt2.PreviousEventHash != evt1.EventHash {
		t.Errorf("event 2 previous_event_hash should match event 1 hash: want %s, got %s", evt1.EventHash, evt2.PreviousEventHash)
	}

	time.Sleep(10 * time.Millisecond)

	// Event 3: metadata_updated (rename)
	renamePayload := ComputePayloadHash("rename:thesis.docx->thesis_final.docx")
	evt3 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   "",
		ActorID:     userID,
		Action:      EventMetadataUpdated,
		PayloadHash: renamePayload,
		BlobHash:    "",
		Metadata:    `{"action":"rename","from":"thesis.docx","to":"thesis_final.docx"}`,
	})
	if evt3.PreviousEventHash != evt2.EventHash {
		t.Errorf("event 3 previous_event_hash should match event 2 hash")
	}

	time.Sleep(10 * time.Millisecond)

	// Event 4: version_restored (restore v1)
	v3ID := uuid.New().String()
	now = time.Now().UTC().Format(time.RFC3339)
	_, err = db.Exec("INSERT INTO file_versions (id, node_id, blob_hash, version_number, size_bytes, author_id, commit_note, created_at) VALUES (?, ?, ?, 3, 1024, ?, 'Restored from v1', ?)",
		v3ID, nodeID, blobHash, userID, now)
	if err != nil {
		t.Fatalf("inserting version 3 (restore): %v", err)
	}

	evt4 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   v3ID,
		ActorID:     userID,
		Action:      EventVersionRestored,
		PayloadHash: blobHash,
		BlobHash:    blobHash,
		Metadata:    `{"restoredFrom":"v1"}`,
	})
	if evt4.PreviousEventHash != evt3.EventHash {
		t.Errorf("event 4 previous_event_hash should match event 3 hash")
	}

	// Verify chain — should be VALID
	result, err := VerifyChain(ctx, db, nodeID, userID)
	if err != nil {
		t.Fatalf("verify chain: %v", err)
	}
	if !result.IsValid {
		t.Errorf("expected valid chain, got TAMPERED: %s", result.Reason)
	}
	if result.EventsCount != 4 {
		t.Errorf("expected 4 events, got %d", result.EventsCount)
	}
	if result.HeadHash != evt4.EventHash {
		t.Errorf("head hash mismatch: want %s, got %s", evt4.EventHash, result.HeadHash)
	}
}

// TestTamperDetection_ModifiedPayload verifies that modifying a payload_hash in the DB is detected.
func TestTamperDetection_ModifiedPayload(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	userID, nodeID, versionID, blobHash := seedTestData(t, db)
	ctx := context.Background()

	// Create a valid chain.
	evt1 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   versionID,
		ActorID:     userID,
		Action:      EventFileCreated,
		PayloadHash: blobHash,
		BlobHash:    blobHash,
	})
	_ = evt1

	// Tamper: modify the payload_hash in the database.
	_, err := db.Exec("UPDATE provenance_events SET payload_hash = 'deadbeef00000000000000000000000000000000000000000000000000000000' WHERE id = ?", evt1.ID)
	if err != nil {
		t.Fatalf("tampering payload_hash: %v", err)
	}

	result, err := VerifyChain(ctx, db, nodeID, userID)
	if err != nil {
		t.Fatalf("verify chain: %v", err)
	}
	if result.IsValid {
		t.Error("expected TAMPERED after payload modification, got VALID")
	}
	if result.Status != "TAMPERED" {
		t.Errorf("expected status TAMPERED, got %s", result.Status)
	}
	if result.FailedEventID != evt1.ID {
		t.Errorf("expected failed event %s, got %s", evt1.ID, result.FailedEventID)
	}
	t.Logf("Tamper reason: %s", result.Reason)
}

// TestTamperDetection_ModifiedPreviousHash verifies that modifying previous_event_hash is detected.
func TestTamperDetection_ModifiedPreviousHash(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	userID, nodeID, versionID, blobHash := seedTestData(t, db)
	ctx := context.Background()

	evt1 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   versionID,
		ActorID:     userID,
		Action:      EventFileCreated,
		PayloadHash: blobHash,
		BlobHash:    blobHash,
	})

	time.Sleep(10 * time.Millisecond)

	// Create version 2
	v2ID := uuid.New().String()
	blob2 := "c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3"
	now := time.Now().UTC().Format(time.RFC3339)
	_, _ = db.Exec("INSERT INTO blobs (sha256, size_bytes, storage_path, ref_count, created_at) VALUES (?, 512, '/tmp/test3', 1, ?)", blob2, now)
	_, _ = db.Exec("INSERT INTO file_versions (id, node_id, blob_hash, version_number, size_bytes, author_id, created_at) VALUES (?, ?, ?, 2, 512, ?, ?)", v2ID, nodeID, blob2, userID, now)

	evt2 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   v2ID,
		ActorID:     userID,
		Action:      EventVersionCreated,
		PayloadHash: blob2,
		BlobHash:    blob2,
	})
	_ = evt1

	// Tamper: modify previous_event_hash of event 2
	_, err := db.Exec("UPDATE provenance_events SET previous_event_hash = 'aaaa0000000000000000000000000000000000000000000000000000aaaa0000' WHERE id = ?", evt2.ID)
	if err != nil {
		t.Fatalf("tampering previous_event_hash: %v", err)
	}

	result, err := VerifyChain(ctx, db, nodeID, userID)
	if err != nil {
		t.Fatalf("verify chain: %v", err)
	}
	if result.IsValid {
		t.Error("expected TAMPERED after previous_event_hash modification, got VALID")
	}
	if result.FailedEventID != evt2.ID {
		t.Errorf("expected failed event %s, got %s", evt2.ID, result.FailedEventID)
	}
	t.Logf("Tamper reason: %s", result.Reason)
}

// TestTamperDetection_RemovedEvent verifies that removing an intermediate event breaks the chain.
func TestTamperDetection_RemovedEvent(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	userID, nodeID, versionID, blobHash := seedTestData(t, db)
	ctx := context.Background()

	evt1 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   versionID,
		ActorID:     userID,
		Action:      EventFileCreated,
		PayloadHash: blobHash,
		BlobHash:    blobHash,
	})

	time.Sleep(10 * time.Millisecond)

	// Event 2
	v2ID := uuid.New().String()
	blob2 := "d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4"
	now := time.Now().UTC().Format(time.RFC3339)
	_, _ = db.Exec("INSERT INTO blobs (sha256, size_bytes, storage_path, ref_count, created_at) VALUES (?, 768, '/tmp/test4', 1, ?)", blob2, now)
	_, _ = db.Exec("INSERT INTO file_versions (id, node_id, blob_hash, version_number, size_bytes, author_id, created_at) VALUES (?, ?, ?, 2, 768, ?, ?)", v2ID, nodeID, blob2, userID, now)
	evt2 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   v2ID,
		ActorID:     userID,
		Action:      EventVersionCreated,
		PayloadHash: blob2,
		BlobHash:    blob2,
	})

	time.Sleep(10 * time.Millisecond)

	// Event 3
	v3ID := uuid.New().String()
	blob3 := "e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5"
	now = time.Now().UTC().Format(time.RFC3339)
	_, _ = db.Exec("INSERT INTO blobs (sha256, size_bytes, storage_path, ref_count, created_at) VALUES (?, 512, '/tmp/test5', 1, ?)", blob3, now)
	_, _ = db.Exec("INSERT INTO file_versions (id, node_id, blob_hash, version_number, size_bytes, author_id, created_at) VALUES (?, ?, ?, 3, 512, ?, ?)", v3ID, nodeID, blob3, userID, now)
	recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   v3ID,
		ActorID:     userID,
		Action:      EventVersionCreated,
		PayloadHash: blob3,
		BlobHash:    blob3,
	})

	_ = evt1

	// Tamper: remove event 2 from the chain
	_, err := db.Exec("DELETE FROM provenance_events WHERE id = ?", evt2.ID)
	if err != nil {
		t.Fatalf("deleting event 2: %v", err)
	}

	result, err := VerifyChain(ctx, db, nodeID, userID)
	if err != nil {
		t.Fatalf("verify chain: %v", err)
	}
	if result.IsValid {
		t.Error("expected TAMPERED after event removal, got VALID")
	}
	t.Logf("Tamper reason: %s", result.Reason)
}

// TestTamperDetection_ReorderedEvents verifies that swapping event order is detected.
// We simulate reordering by deleting both events and re-inserting them in swapped order
// (evt2 row first with evt1's timestamp, evt1 row second with evt2's timestamp).
// This ensures the rowid tiebreaker places them in the wrong order.
func TestTamperDetection_ReorderedEvents(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	userID, nodeID, versionID, blobHash := seedTestData(t, db)
	ctx := context.Background()

	evt1 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   versionID,
		ActorID:     userID,
		Action:      EventFileCreated,
		PayloadHash: blobHash,
		BlobHash:    blobHash,
	})

	time.Sleep(10 * time.Millisecond)

	v2ID := uuid.New().String()
	blob2 := "f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6f6"
	now := time.Now().UTC().Format(time.RFC3339)
	_, _ = db.Exec("INSERT INTO blobs (sha256, size_bytes, storage_path, ref_count, created_at) VALUES (?, 256, '/tmp/test6', 1, ?)", blob2, now)
	_, _ = db.Exec("INSERT INTO file_versions (id, node_id, blob_hash, version_number, size_bytes, author_id, created_at) VALUES (?, ?, ?, 2, 256, ?, ?)", v2ID, nodeID, blob2, userID, now)
	evt2 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   v2ID,
		ActorID:     userID,
		Action:      EventVersionCreated,
		PayloadHash: blob2,
		BlobHash:    blob2,
	})

	// Tamper: delete both events and re-insert in swapped order.
	// Insert evt2 row first (with evt1's timestamp) so it gets a lower rowid,
	// then insert evt1 row second (with evt2's timestamp).
	_, _ = db.Exec("DELETE FROM provenance_events WHERE node_id = ?", nodeID)

	// evt2 data goes in first (gets lower rowid), using evt1's timestamp
	_, err := db.Exec(
		`INSERT INTO provenance_events (id, node_id, version_id, blob_hash, previous_event_hash, event_hash, event_type, actor_id, payload_hash, metadata, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', ?)`,
		evt2.ID, evt2.NodeID, evt2.VersionID, evt2.BlobHash, evt2.PreviousEventHash, evt2.EventHash, string(evt2.Action), evt2.ActorID, evt2.PayloadHash, evt1.Timestamp,
	)
	if err != nil {
		t.Fatalf("reinserting evt2: %v", err)
	}

	// evt1 data goes in second (gets higher rowid), using evt2's timestamp
	_, err = db.Exec(
		`INSERT INTO provenance_events (id, node_id, version_id, blob_hash, previous_event_hash, event_hash, event_type, actor_id, payload_hash, metadata, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', ?)`,
		evt1.ID, evt1.NodeID, evt1.VersionID, evt1.BlobHash, nil, evt1.EventHash, string(evt1.Action), evt1.ActorID, evt1.PayloadHash, evt2.Timestamp,
	)
	if err != nil {
		t.Fatalf("reinserting evt1: %v", err)
	}

	result, err := VerifyChain(ctx, db, nodeID, userID)
	if err != nil {
		t.Fatalf("verify chain: %v", err)
	}
	if result.IsValid {
		t.Error("expected TAMPERED after event reordering, got VALID")
	}
	t.Logf("Tamper reason: %s", result.Reason)
}

// TestOwnershipVerification verifies that a different user cannot verify another user's chain.
func TestOwnershipVerification(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	userID, nodeID, versionID, blobHash := seedTestData(t, db)
	ctx := context.Background()

	// Create a valid chain for user 1
	recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   versionID,
		ActorID:     userID,
		Action:      EventFileCreated,
		PayloadHash: blobHash,
		BlobHash:    blobHash,
	})

	// Create a different user
	otherUserID := uuid.New().String()
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := db.Exec("INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
		otherUserID, "other@example.com", "hash456", "Other User", now, now)
	if err != nil {
		t.Fatalf("inserting other user: %v", err)
	}

	// Attempt to verify with the wrong user
	_, err = VerifyChain(ctx, db, nodeID, otherUserID)
	if err == nil {
		t.Error("expected access denied error, got nil")
	} else if err.Error() != "access denied" {
		t.Errorf("expected 'access denied' error, got: %v", err)
	}

	// Attempt to list events with the wrong user
	_, err = ListEvents(ctx, db, nodeID, otherUserID)
	if err == nil {
		t.Error("expected access denied error for ListEvents, got nil")
	}
}

// TestListEvents verifies the event listing returns correct events in order.
func TestListEvents(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	userID, nodeID, versionID, blobHash := seedTestData(t, db)
	ctx := context.Background()

	recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   versionID,
		ActorID:     userID,
		Action:      EventFileCreated,
		PayloadHash: blobHash,
		BlobHash:    blobHash,
	})

	time.Sleep(10 * time.Millisecond)

	renamePayload := ComputePayloadHash("rename:thesis.docx->thesis_v2.docx")
	recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   "",
		ActorID:     userID,
		Action:      EventMetadataUpdated,
		PayloadHash: renamePayload,
		Metadata:    `{"action":"rename","from":"thesis.docx","to":"thesis_v2.docx"}`,
	})

	events, err := ListEvents(ctx, db, nodeID, userID)
	if err != nil {
		t.Fatalf("listing events: %v", err)
	}
	if len(events) != 2 {
		t.Fatalf("expected 2 events, got %d", len(events))
	}
	if events[0].Action != EventFileCreated {
		t.Errorf("first event action: want file_created, got %s", events[0].Action)
	}
	if events[1].Action != EventMetadataUpdated {
		t.Errorf("second event action: want metadata_updated, got %s", events[1].Action)
	}
	if events[0].ActorName != "Test User" {
		t.Errorf("expected actor name 'Test User', got %q", events[0].ActorName)
	}
}

// TestComputeEventHash_Deterministic verifies the hash function is deterministic.
func TestComputeEventHash_Deterministic(t *testing.T) {
	hash1 := ComputeEventHash("node-1", "ver-1", "user-1", EventFileCreated, "2026-01-01T00:00:00Z", "abc123", "")
	hash2 := ComputeEventHash("node-1", "ver-1", "user-1", EventFileCreated, "2026-01-01T00:00:00Z", "abc123", "")

	if hash1 != hash2 {
		t.Errorf("expected deterministic hash, got %s and %s", hash1, hash2)
	}

	// Different input should produce different hash
	hash3 := ComputeEventHash("node-1", "ver-1", "user-1", EventFileCreated, "2026-01-01T00:00:01Z", "abc123", "")
	if hash1 == hash3 {
		t.Error("different timestamps should produce different hashes")
	}
}

// TestEmptyChain verifies that an empty chain reports VALID.
func TestEmptyChain(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	userID, nodeID, _, _ := seedTestData(t, db)
	ctx := context.Background()

	result, err := VerifyChain(ctx, db, nodeID, userID)
	if err != nil {
		t.Fatalf("verify empty chain: %v", err)
	}
	if !result.IsValid {
		t.Errorf("expected valid (empty chain), got TAMPERED: %s", result.Reason)
	}
	if result.EventsCount != 0 {
		t.Errorf("expected 0 events, got %d", result.EventsCount)
	}
}

// TestTamperDetection_ModifiedEventHash verifies that directly modifying event_hash is detected.
func TestTamperDetection_ModifiedEventHash(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	userID, nodeID, versionID, blobHash := seedTestData(t, db)
	ctx := context.Background()

	evt1 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   versionID,
		ActorID:     userID,
		Action:      EventFileCreated,
		PayloadHash: blobHash,
		BlobHash:    blobHash,
	})

	// Tamper: modify the event_hash directly
	_, err := db.Exec("UPDATE provenance_events SET event_hash = 'tampered_hash_00000000000000000000000000000000000000000000000000' WHERE id = ?", evt1.ID)
	if err != nil {
		t.Fatalf("tampering event_hash: %v", err)
	}

	result, err := VerifyChain(ctx, db, nodeID, userID)
	if err != nil {
		t.Fatalf("verify chain: %v", err)
	}
	if result.IsValid {
		t.Error("expected TAMPERED after event_hash modification, got VALID")
	}
	t.Logf("Tamper reason: %s", result.Reason)
}

// TestTamperDetection_GenesisWithPrevHash verifies that a genesis event with a non-empty previous hash is detected.
func TestTamperDetection_GenesisWithPrevHash(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()
	userID, nodeID, versionID, blobHash := seedTestData(t, db)
	ctx := context.Background()

	evt1 := recordTestEvent(t, db, RecordEventParams{
		NodeID:      nodeID,
		VersionID:   versionID,
		ActorID:     userID,
		Action:      EventFileCreated,
		PayloadHash: blobHash,
		BlobHash:    blobHash,
	})

	// Tamper: set a previous_event_hash on the genesis event
	fakeHash := fmt.Sprintf("%064x", 42)
	_, err := db.Exec("UPDATE provenance_events SET previous_event_hash = ? WHERE id = ?", fakeHash, evt1.ID)
	if err != nil {
		t.Fatalf("tampering genesis previous_event_hash: %v", err)
	}

	result, err := VerifyChain(ctx, db, nodeID, userID)
	if err != nil {
		t.Fatalf("verify chain: %v", err)
	}
	if result.IsValid {
		t.Error("expected TAMPERED for genesis with non-empty previous hash, got VALID")
	}
	t.Logf("Tamper reason: %s", result.Reason)
}
