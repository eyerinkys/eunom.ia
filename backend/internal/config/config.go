// Package config loads application configuration from environment variables.
package config

import (
	"context"
	"fmt"

	"github.com/sethvargo/go-envconfig"
)

// Config holds all application configuration values.
// Fields are populated from environment variables via envconfig tags.
type Config struct {
	// Port is the HTTP server listen port.
	Port int `env:"PORT, default=8080"`

	// DatabasePath is the path to the SQLite database file.
	DatabasePath string `env:"DATABASE_PATH, default=./data/eunomia.db"`

	// DataDir is the root directory for all runtime data (blobs, temp, exports).
	DataDir string `env:"DATA_DIR, default=./data"`

	// CORSOrigin is the allowed origin for CORS requests (frontend dev server).
	CORSOrigin string `env:"CORS_ORIGIN, default=http://localhost:5173"`

	// LogLevel controls the minimum log severity (debug, info, warn, error).
	LogLevel string `env:"LOG_LEVEL, default=info"`
}

// Addr returns the formatted listen address string for net/http.
func (c *Config) Addr() string {
	return fmt.Sprintf(":%d", c.Port)
}

// Load reads configuration from environment variables.
// Missing variables fall back to their default values.
func Load(ctx context.Context) (*Config, error) {
	var cfg Config
	if err := envconfig.Process(ctx, &cfg); err != nil {
		return nil, fmt.Errorf("loading config: %w", err)
	}
	return &cfg, nil
}
