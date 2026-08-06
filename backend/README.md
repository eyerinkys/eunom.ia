# Eunomia Backend

Go modular monolith backend for the Eunomia content-addressed file management system.

## Prerequisites

- **Go 1.26+** — [Install Go](https://go.dev/dl/)
- **GCC / C compiler** — Required for `go-sqlite3` CGO compilation
  - macOS: `xcode-select --install` (Command Line Tools)
  - Linux: `apt install build-essential` or equivalent

## Quick Start

```bash
# From the backend/ directory:

# 1. Install dependencies
go mod tidy

# 2. Run the server (migrations run automatically on startup)
go run ./cmd/server

# The server starts on http://localhost:8080
# Health check: http://localhost:8080/api/health
```

## Development Tools (Optional)

These CLI tools are used for development but are **not required at runtime** — migrations run in library mode.

```bash
# Install goose (migration CLI for manual migration management)
go install github.com/pressly/goose/v3/cmd/goose@latest

# Install sqlc (type-safe SQL query generator)
go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest
```

## Environment Variables

All configuration is loaded from environment variables with sensible defaults:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | HTTP server listen port |
| `DATABASE_PATH` | `./data/eunomia.db` | Path to SQLite database file |
| `DATA_DIR` | `./data` | Root directory for runtime data (blobs, temp, exports) |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin (Vite dev server) |
| `LOG_LEVEL` | `info` | Log level: `debug`, `info`, `warn`, `error` |

Override any variable by setting it before running the server:

```bash
PORT=9090 LOG_LEVEL=debug go run ./cmd/server
```

## Project Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go                  # Entrypoint: config → DB → migrations → HTTP
├── internal/
│   ├── config/
│   │   └── config.go                # Environment variable configuration
│   ├── database/
│   │   ├── database.go              # SQLite connection (WAL, busy_timeout, foreign_keys)
│   │   └── migrate.go               # Goose migration runner (embedded SQL)
│   ├── api/
│   │   ├── router.go                # Chi router, CORS, middleware chain
│   │   ├── health.go                # GET /api/health
│   │   ├── errors.go                # Structured JSON error format
│   │   └── middleware.go            # Request logging, request ID
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # Tier 1A tables (8 tables)
│   └── queries/                     # Future: sqlc-generated query code
├── data/                            # Runtime data (gitignored)
│   ├── eunomia.db                   # SQLite database (created on first run)
│   └── blobs/sha256/                # CAS blob storage (future)
├── sqlc.yaml                        # sqlc configuration
├── tools.go                         # Tool dependency pins
└── go.mod                           # Go module definition
```

## Database

- **Engine:** SQLite in WAL (Write-Ahead Logging) mode
- **Busy timeout:** 5000ms (avoids SQLITE_BUSY under concurrent reads)
- **Foreign keys:** Enforced
- **Migrations:** Embedded in the binary via `embed.FS`, run automatically on startup via Goose library mode

### Manual Migration Commands

```bash
# Check current migration version
goose -dir internal/migrations sqlite3 ./data/eunomia.db status

# Run pending migrations
goose -dir internal/migrations sqlite3 ./data/eunomia.db up

# Roll back the last migration
goose -dir internal/migrations sqlite3 ./data/eunomia.db down

# Inspect database tables
sqlite3 data/eunomia.db ".tables"
sqlite3 data/eunomia.db "PRAGMA journal_mode;"
```

## API

- **Base URL:** `http://localhost:8080/api`
- **Specification:** [`docs/openapi.yaml`](../docs/openapi.yaml)
- **Error format:** All errors return `{ "error": { "code": "...", "message": "..." } }`

### Endpoints

| Method | Path | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Health check + DB ping | No |

## Running with the Frontend

The Vite frontend dev server proxies `/api` requests to the Go backend:

```bash
# Terminal 1: Start the backend
cd backend && go run ./cmd/server

# Terminal 2: Start the frontend
cd .. && npm run dev

# Frontend: http://localhost:5173
# API (direct): http://localhost:8080/api/health
# API (proxied): http://localhost:5173/api/health
```
