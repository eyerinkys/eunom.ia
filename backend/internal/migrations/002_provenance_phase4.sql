-- +goose Up
-- Phase 4: Extend provenance_events for full lifecycle tracking.
-- Add payload_hash and metadata columns.
-- Relax version_id to nullable (metadata-only events have no version).
-- Expand event_type to include file_created and metadata_updated.

-- SQLite does not support ALTER COLUMN. We must recreate the table.

-- 1. Create new table with relaxed constraints.
CREATE TABLE provenance_events_new (
    id                  TEXT PRIMARY KEY NOT NULL,
    node_id             TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    version_id          TEXT REFERENCES file_versions(id) ON DELETE SET NULL,
    blob_hash           TEXT NOT NULL DEFAULT '',
    previous_event_hash TEXT,
    event_hash          TEXT NOT NULL,
    event_type          TEXT NOT NULL DEFAULT 'version_created'
        CHECK (event_type IN ('file_created', 'version_created', 'version_restored', 'metadata_updated')),
    actor_id            TEXT NOT NULL REFERENCES users(id),
    payload_hash        TEXT NOT NULL DEFAULT '',
    metadata            TEXT NOT NULL DEFAULT '{}',
    created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- 2. Copy existing data (map old event_type values to new).
INSERT INTO provenance_events_new (id, node_id, version_id, blob_hash, previous_event_hash, event_hash, event_type, actor_id, payload_hash, metadata, created_at)
SELECT
    id, node_id, version_id, blob_hash, previous_event_hash, event_hash,
    CASE
        WHEN event_type = 'verification_run' THEN 'version_created'
        ELSE event_type
    END,
    actor_id,
    blob_hash,  -- Use blob_hash as initial payload_hash for existing events
    '{}',
    created_at
FROM provenance_events;

-- 3. Drop old table and rename.
DROP TABLE provenance_events;
ALTER TABLE provenance_events_new RENAME TO provenance_events;

-- 4. Recreate indexes.
CREATE INDEX idx_provenance_events_node_id ON provenance_events(node_id);
CREATE INDEX idx_provenance_events_version_id ON provenance_events(version_id);
CREATE INDEX idx_provenance_events_event_hash ON provenance_events(event_hash);

-- +goose Down
-- Revert to original schema (lossy — metadata_updated events are dropped).
CREATE TABLE provenance_events_old (
    id                  TEXT PRIMARY KEY NOT NULL,
    node_id             TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    version_id          TEXT NOT NULL REFERENCES file_versions(id) ON DELETE CASCADE,
    blob_hash           TEXT NOT NULL REFERENCES blobs(sha256),
    previous_event_hash TEXT,
    event_hash          TEXT NOT NULL,
    event_type          TEXT NOT NULL DEFAULT 'version_created' CHECK (event_type IN ('version_created', 'version_restored', 'verification_run')),
    actor_id            TEXT NOT NULL REFERENCES users(id),
    created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

INSERT INTO provenance_events_old (id, node_id, version_id, blob_hash, previous_event_hash, event_hash, event_type, actor_id, created_at)
SELECT id, node_id, version_id, blob_hash, previous_event_hash, event_hash,
    CASE WHEN event_type IN ('version_created', 'version_restored') THEN event_type ELSE 'version_created' END,
    actor_id, created_at
FROM provenance_events
WHERE version_id IS NOT NULL;

DROP TABLE provenance_events;
ALTER TABLE provenance_events_old RENAME TO provenance_events;

CREATE INDEX idx_provenance_events_node_id ON provenance_events(node_id);
CREATE INDEX idx_provenance_events_version_id ON provenance_events(version_id);
CREATE INDEX idx_provenance_events_event_hash ON provenance_events(event_hash);
