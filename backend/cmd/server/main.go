// Package main is the entrypoint for the Eunomia backend server.
package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/eyerinerror/eunomia/internal/api"
	"github.com/eyerinerror/eunomia/internal/config"
	"github.com/eyerinerror/eunomia/internal/database"
)

func main() {
	if err := run(); err != nil {
		slog.Error("fatal error", "error", err)
		os.Exit(1)
	}
}

func run() error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// --- Load configuration ---
	cfg, err := config.Load(ctx)
	if err != nil {
		return fmt.Errorf("loading config: %w", err)
	}

	// --- Set up structured logger ---
	logLevel := parseLogLevel(cfg.LogLevel)
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: logLevel,
	}))
	slog.SetDefault(logger)

	logger.Info("starting eunomia backend",
		"port", cfg.Port,
		"database", cfg.DatabasePath,
		"data_dir", cfg.DataDir,
		"cors_origin", cfg.CORSOrigin,
		"log_level", cfg.LogLevel,
	)

	// --- Create data directories ---
	dirs := []string{
		cfg.DataDir,
		filepath.Join(cfg.DataDir, "blobs", "sha256"),
		filepath.Join(cfg.DataDir, "temp"),
		filepath.Join(cfg.DataDir, "exports"),
	}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return fmt.Errorf("creating directory %s: %w", dir, err)
		}
	}

	// --- Open SQLite database ---
	db, err := database.Open(cfg.DatabasePath, logger)
	if err != nil {
		return fmt.Errorf("opening database: %w", err)
	}
	defer db.Close()

	// --- Run migrations ---
	if err := database.RunMigrations(db, logger); err != nil {
		return fmt.Errorf("running migrations: %w", err)
	}

	// --- Build HTTP router ---
	router := api.NewRouter(db, cfg.CORSOrigin, logger)

	// --- Start HTTP server ---
	srv := &http.Server{
		Addr:              cfg.Addr(),
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       60 * time.Second,
		WriteTimeout:      60 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	// --- Graceful shutdown ---
	errCh := make(chan error, 1)
	go func() {
		logger.Info("http server listening", "addr", cfg.Addr())
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errCh <- err
		}
		close(errCh)
	}()

	// Wait for interrupt signal.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-quit:
		logger.Info("received shutdown signal", "signal", sig)
	case err := <-errCh:
		return fmt.Errorf("server error: %w", err)
	}

	// Graceful shutdown with timeout.
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("shutting down server: %w", err)
	}

	logger.Info("server stopped gracefully")
	return nil
}

// parseLogLevel converts a string log level to slog.Level.
func parseLogLevel(level string) slog.Level {
	switch level {
	case "debug":
		return slog.LevelDebug
	case "warn":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
