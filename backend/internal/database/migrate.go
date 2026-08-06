package database

import (
	"database/sql"
	"fmt"
	"log/slog"

	"github.com/eyerinerror/eunomia/internal/migrations"
	"github.com/pressly/goose/v3"
)

// RunMigrations executes all pending Goose migrations embedded in the binary.
// This runs in library mode — no goose CLI dependency at runtime.
func RunMigrations(db *sql.DB, logger *slog.Logger) error {
	goose.SetBaseFS(migrations.FS)

	if err := goose.SetDialect("sqlite3"); err != nil {
		return fmt.Errorf("setting goose dialect: %w", err)
	}

	logger.Info("running database migrations")

	if err := goose.Up(db, "."); err != nil {
		return fmt.Errorf("running migrations: %w", err)
	}

	version, err := goose.GetDBVersion(db)
	if err != nil {
		return fmt.Errorf("getting migration version: %w", err)
	}

	logger.Info("migrations complete", "version", version)
	return nil
}
