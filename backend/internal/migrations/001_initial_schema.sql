-- +goose Up
-- Tier 1A initial schema for Eunomia.
-- 8 core tables: users, sessions, nodes, blobs, file_versions, version_parents, provenance_events, upload_sessions.
-- File blob contents are stored on the filesystem, NOT in SQLite.

-- User accounts.
CREATE TABLE users (
    id          TEXT PRIMARY KEY NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_users_email ON users(email);

-- HTTP session cookies.
CREATE TABLE sessions (
    id          TEXT PRIMARY KEY NOT NULL,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    ip_address  TEXT NOT NULL DEFAULT '',
    user_agent  TEXT NOT NULL DEFAULT '',
    expires_at  TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Logical files and folders (unified node tree).
-- type: 'file' or 'folder'
-- deleted_at: soft-delete timestamp (NULL = active)
CREATE TABLE nodes (
    id          TEXT PRIMARY KEY NOT NULL,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id   TEXT REFERENCES nodes(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL CHECK (type IN ('file', 'folder')),
    mime_type   TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    deleted_at  TEXT,
    UNIQUE(user_id, parent_id, name) -- prevent duplicate names in same folder
);

CREATE INDEX idx_nodes_user_id ON nodes(user_id);
CREATE INDEX idx_nodes_parent_id ON nodes(parent_id);
CREATE INDEX idx_nodes_type ON nodes(type);
CREATE INDEX idx_nodes_deleted_at ON nodes(deleted_at);

-- Content-addressed blob metadata.
-- Blobs are stored on the filesystem at data/blobs/sha256/{first2}/{next2}/{full_hash}.
-- Multiple file_versions can reference the same blob (deduplication).
CREATE TABLE blobs (
    sha256      TEXT PRIMARY KEY NOT NULL,
    size_bytes  INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    ref_count   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- Immutable version records.
-- Each version is a snapshot of a file node at a point in time.
CREATE TABLE file_versions (
    id              TEXT PRIMARY KEY NOT NULL,
    node_id         TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    blob_hash       TEXT NOT NULL REFERENCES blobs(sha256),
    version_number  INTEGER NOT NULL,
    size_bytes      INTEGER NOT NULL,
    commit_note     TEXT NOT NULL DEFAULT '',
    author_id       TEXT NOT NULL REFERENCES users(id),
    created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE(node_id, version_number)
);

CREATE INDEX idx_file_versions_node_id ON file_versions(node_id);
CREATE INDEX idx_file_versions_blob_hash ON file_versions(blob_hash);

-- DAG parent links between versions.
-- Supports branching version history (a version can have multiple parents for merges).
CREATE TABLE version_parents (
    version_id        TEXT NOT NULL REFERENCES file_versions(id) ON DELETE CASCADE,
    parent_version_id TEXT NOT NULL REFERENCES file_versions(id) ON DELETE CASCADE,
    PRIMARY KEY (version_id, parent_version_id)
);

-- Hash-chained authorship provenance events.
-- Each event's event_hash covers (node_id, version_id, blob_hash, previous_event_hash, created_at).
-- Inserting a fake early event breaks the chain — tamper detection is structural.
CREATE TABLE provenance_events (
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

CREATE INDEX idx_provenance_events_node_id ON provenance_events(node_id);
CREATE INDEX idx_provenance_events_version_id ON provenance_events(version_id);
CREATE INDEX idx_provenance_events_event_hash ON provenance_events(event_hash);

-- Chunked upload session tracking.
-- Tracks in-progress multi-part uploads so they can be resumed.
CREATE TABLE upload_sessions (
    id            TEXT PRIMARY KEY NOT NULL,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    node_id       TEXT REFERENCES nodes(id) ON DELETE SET NULL,
    filename      TEXT NOT NULL,
    mime_type     TEXT NOT NULL DEFAULT '',
    total_size    INTEGER NOT NULL DEFAULT 0,
    uploaded_size INTEGER NOT NULL DEFAULT 0,
    chunk_count   INTEGER NOT NULL DEFAULT 0,
    status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'processing', 'complete', 'failed', 'cancelled')),
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    expires_at    TEXT NOT NULL
);

CREATE INDEX idx_upload_sessions_user_id ON upload_sessions(user_id);
CREATE INDEX idx_upload_sessions_status ON upload_sessions(status);

-- +goose Down
DROP TABLE IF EXISTS upload_sessions;
DROP TABLE IF EXISTS provenance_events;
DROP TABLE IF EXISTS version_parents;
DROP TABLE IF EXISTS file_versions;
DROP TABLE IF EXISTS blobs;
DROP TABLE IF EXISTS nodes;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
