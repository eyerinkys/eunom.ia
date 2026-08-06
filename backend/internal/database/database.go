// Package database provides SQLite connection setup with WAL mode and Goose migrations.
package database

import (
	"database/sql"
	"fmt"
	"log/slog"

	_ "modernc.org/sqlite"
)

// Open creates a new SQLite database connection with WAL mode, busy timeout,
// and foreign key enforcement enabled. The connection is verified with a ping.
func Open(dbPath string, logger *slog.Logger) (*sql.DB, error) {
	// SQLite connection string with pragmas:
	// - _journal_mode=WAL: Write-Ahead Logging for concurrent reads during writes
	// - _busy_timeout=5000: Wait up to 5 seconds on locked database before returning SQLITE_BUSY
	// - _foreign_keys=ON: Enforce foreign key constraints
	dsn := fmt.Sprintf("file:%s?_journal_mode=WAL&_busy_timeout=5000&_foreign_keys=ON", dbPath)

	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("opening database: %w", err)
	}

	// Verify the connection is alive.
	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("pinging database: %w", err)
	}

	// Verify WAL mode was actually applied (sqlite3 silently falls back in some edge cases).
	var journalMode string
	if err := db.QueryRow("PRAGMA journal_mode;").Scan(&journalMode); err != nil {
		db.Close()
		return nil, fmt.Errorf("checking journal mode: %w", err)
	}

	logger.Info("database connection established",
		"path", dbPath,
		"journal_mode", journalMode,
	)

	if journalMode != "wal" {
		logger.Warn("expected WAL journal mode, got different mode",
			"journal_mode", journalMode,
		)
	}

	// Set connection pool size. SQLite is single-writer, so limit accordingly.
	// Multiple readers are fine under WAL mode.
	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)

	return db, nil
}
