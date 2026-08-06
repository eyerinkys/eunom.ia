# Eunomia (`eunom.ia`) — Implementation Status

**Status Date:** August 6, 2026  
**Primary Plan:** `docs/CONSOLIDATED_PROJECT_PLAN.md`  
**Current Readiness:** Tier 1A Visual Shell Complete | Backend Technical Foundation Complete | Phase 1 Auth Ready  

---

## 1. Executive Summary

Eunomia is a local-first Content-Addressable Storage (CAS) file management & cryptographic provenance archive UI. The repository contains:

1. **Complete Visual Shell** — React 19 + TypeScript + Vite 8 frontend with the **Mineral Archival** design system, all primary screens navigable in-browser.
2. **Go Backend Foundation** — Go 1.26 modular monolith with Chi router, SQLite in WAL mode, Goose migrations (8 Tier 1A tables), structured logging, CORS, and a verified health endpoint.

The frontend data layer still operates on in-memory mock state ([`src/data/mockData.ts`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/data/mockData.ts)). No authentication, file upload, or CAS blob ingestion endpoints exist yet. The backend foundation is ready for Phase 1 (Auth & Folder Navigation) implementation.

---

## 2. Preserved Visual Source-of-Truth Assets

The current frontend layout is the **visual source of truth** for all future implementation phases. The following design and visual elements are strictly preserved:

1. **Application Shell Layout**: Fixed-fluid-fixed hybrid layout — 280px left sidebar (`Sidebar.tsx`), fluid workspace, 64px top bar (`TopBar.tsx`), top breadcrumb bar (`BreadcrumbBar.tsx`), and fixed 360px stationary right drawer (`InspectorPanel.tsx`).
2. **Mineral Archival Color System**:
   - Level 0 Base Canvas: `#F8F9FF` / `#F7F5F0` (`--bg-canvas`)
   - Level 1 Panel Substrate: `#E1E2E9` / `#E6E2D8` (`--bg-panel`)
   - Level 2 Global Navigation: `#191C21` (`--bg-sidebar`)
   - Level 3 Dialog Modals: `#FFFFFF` (`--bg-modal`)
   - Accents: Burnished Bronze (`#82510E`), Oxidised Copper (`#32675C`), Muted Plum (`#6F536A`), Muted Olive (`#556B2F`), Clay Red (`#BA1A1A`).
3. **Signature 1.5px Rule Line Motif**: Bounding boxes, dividers, and selection markers (`border-left: 3px solid #82510E` + `#E6E2D8` background fill).
4. **Three-Axial Typography Hierarchy**:
   - `Playfair Display` (`.font-serif`) — Display branding, section headers.
   - `Source Sans 3` (`.font-sans`) — Main UI labels, file names, form copy.
   - `JetBrains Mono` (`.font-mono` + `.tabular-nums`) — Hashes, timestamps, sizes, code snippets.
5. **Dedicated 3-Tab File Inspector**: Panel tabs (`DETAILS`, `VERSIONS`, `PROVENANCE`) with vertical line-axis timelines.
6. **Storage Visualiser Treemap & Analytics**: Metric callout strip and 4-block mineral treemap presentation.
7. **2D Orthogonal File Graph**: Right-angled connector lines and rectangular archival node styling.

---

## 3. Backend Foundation — Files Created

The following files were created as part of the Phase 0B backend technical foundation:

| File | Purpose |
|---|---|
| [`backend/go.mod`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/go.mod) | Go module `github.com/eyerinerror/eunomia` (Go 1.26) |
| [`backend/go.sum`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/go.sum) | Dependency checksums |
| [`backend/cmd/server/main.go`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/cmd/server/main.go) | Server entrypoint: config → DB → migrations → HTTP with graceful shutdown |
| [`backend/internal/config/config.go`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/internal/config/config.go) | Environment variable configuration (`PORT`, `DATABASE_PATH`, `DATA_DIR`, `CORS_ORIGIN`, `LOG_LEVEL`) |
| [`backend/internal/database/database.go`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/internal/database/database.go) | SQLite connection with WAL mode, `busy_timeout=5000`, `foreign_keys=ON` |
| [`backend/internal/database/migrate.go`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/internal/database/migrate.go) | Goose migration runner (library mode, embedded SQL) |
| [`backend/internal/migrations/001_initial_schema.sql`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/internal/migrations/001_initial_schema.sql) | Tier 1A schema: 8 tables with indexes and constraints |
| [`backend/internal/migrations/embed.go`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/internal/migrations/embed.go) | Embeds SQL migration files via `embed.FS` |
| [`backend/internal/api/router.go`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/internal/api/router.go) | Chi router with CORS, request ID, logging, recovery middleware |
| [`backend/internal/api/health.go`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/internal/api/health.go) | `GET /api/health` — returns status, version, timestamp with DB ping |
| [`backend/internal/api/errors.go`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/internal/api/errors.go) | Structured JSON error response format with typed error codes |
| [`backend/internal/api/middleware.go`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/internal/api/middleware.go) | Request logging (slog) and request ID generation |
| [`backend/sqlc.yaml`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/sqlc.yaml) | sqlc configuration scaffold (queries directory placeholder) |
| [`backend/README.md`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/backend/README.md) | Development environment documentation |
| [`docs/openapi.yaml`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/docs/openapi.yaml) | OpenAPI 3.1.0 base specification (health endpoint + error schemas) |

### Modified Files

| File | Change |
|---|---|
| [`vite.config.ts`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/vite.config.ts) | Added `/api` dev proxy → `http://localhost:8080` |
| [`.gitignore`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/.gitignore) | Added `backend/data/`, `*.db`, `*.db-wal`, `*.db-shm`, `backend/eunomia` |

---

## 4. Backend Foundation — Verification Results

### Commands Run

| Command | Result |
|---|---|
| `gofmt -l .` | ✅ Clean — no formatting issues |
| `go build ./...` | ✅ Compiles without errors (CGO for go-sqlite3) |
| `go run ./cmd/server` | ✅ Server starts, migrations run, listens on `:8080` |
| `curl http://localhost:8080/api/health` | ✅ Returns `{"status":"ok","version":"0.1.0","timestamp":"..."}` (HTTP 200) |
| `sqlite3 data/eunomia.db "PRAGMA journal_mode;"` | ✅ Returns `wal` |
| `sqlite3 data/eunomia.db ".tables"` | ✅ 8 tables + `goose_db_version` present |

### SQLite Tables Verified

```
blobs              nodes              upload_sessions
file_versions      provenance_events  users
goose_db_version   sessions           version_parents
```

### Backend Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| `github.com/go-chi/chi/v5` | v5.3.1 | HTTP router |
| `github.com/go-chi/cors` | v1.2.2 | CORS middleware |
| `github.com/mattn/go-sqlite3` | v1.14.49 | SQLite driver (CGO) |
| `github.com/pressly/goose/v3` | v3.27.3 | Migration runner |
| `github.com/sethvargo/go-envconfig` | v1.4.3 | Environment config |

---

## 5. Phase Implementation Status Matrix

Progress evaluated against the 16 phases defined in [`docs/CONSOLIDATED_PROJECT_PLAN.md`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/docs/CONSOLIDATED_PROJECT_PLAN.md#L495-L811):

| Phase | Phase Name | Target Scope | Current Status | Gaps / Outstanding Requirements |
|---|---|---|---|---|
| **Phase 0A** | Product & Interface Definition | Design system, wireframes, component tokens, motion spec | **COMPLETE** | `DESIGN.md` & visual shell implemented in React components. |
| **Phase 0B** | Technical Foundation | Go backend module, Vite+React frontend, `openapi.yaml`, SQLite migrations | **COMPLETE** | Go module, Chi router, SQLite WAL, Goose migrations, health endpoint, OpenAPI spec, Vite proxy all verified. |
| **Phase 1** | Auth & Folder Navigation | Argon2id auth, HTTP session cookies, nested folder CRUD, My Files list view | **INCOMPLETE** | Frontend UI shell & mock folder CRUD complete. Backend auth, session cookies, DB trees missing. |
| **Phase 2** | Chunked Upload & CAS Storage | `/data/blobs/sha256/` CAS engine, SHA-256 streaming, collision modal | **INCOMPLETE** | UI modal exists. Real chunk streaming, CAS filesystem, collision prompt modal missing. |
| **Phase 3** | Version History | `file_versions` table, re-upload detection, Inspector Versions tab, restore API | **INCOMPLETE** | UI tab & timeline complete. Backend version tree & restore endpoints missing. Schema created. |
| **Phase 4** | Provenance Chain & Verification | Hash-chained `provenance_events`, verification API, Inspector Provenance tab | **INCOMPLETE** | UI tab & stepper complete. Real SHA-256 event chaining & verify API missing. Schema created. |
| **Phase 5** | PDF Export & Core Animations | Server-side Go PDF generator (`gopdf`/`maroto`), Anime.js core motion integration | **INCOMPLETE** | UI export trigger pops `alert()`. Go PDF generator & Anime.js integration missing. |
| **GATE 1** | **Core Proof Review Gate** | **Tier 1A End-to-End Core Proof Walkthrough** | **BLOCKED** | Requires completion of backend Phases 1 through 5. |
| **Phase 6** | Core UI Completion | Grid view, search bar, home screen, upload queue, recent files, loading skeletons | **PARTIAL** | Grid view, search input, home view built. Upload queue panel & skeletons missing. |
| **Phase 7** | Text & Markdown Diff | Web Worker diff calculator, side-by-side & inline text diff UI | **PARTIAL** | `DiffModal.tsx` built with mock strings. Web Worker diff calculation engine missing. |
| **Phase 8** | Storage Visualisation | Storage analytics backend API, SVG/D3 treemap component, storage reveal | **PARTIAL** | `StorageVisualizerView.tsx` built with static grid. Real CAS aggregation API missing. |
| **Phase 9** | Vis Network Structural Graph | Vis Network graph view (hierarchical mode, physics off, zoom/pan/select) | **PARTIAL** | Custom SVG graph built. Vis Network library integration missing. |
| **Phase 10** | Google Drive Import | OAuth2 importer service, `import_jobs` migration, resumable import wizard | **PARTIAL** | `DriveImportView.tsx` built with timer mockup. Backend OAuth & Drive API engine missing. |
| **GATE 2** | **Complete Demo Review Gate** | **Tier 1B Essential Uninterrupted Walkthrough** | **BLOCKED** | Requires passing Gate 1 and completing Phases 6 through 10. |
| **Phase 11** | Offline Mode (Optional) | Workbox service worker, Dexie/IndexedDB metadata, OPFS cache, sync queue | **DEFERRED** | Tier 1B Optional feature. |
| **Phase 12** | Complete Demo Polish | Tablet responsive overlays, 17-point quality audit | **DEFERRED** | Tier 1B Optional feature. |
| **Phase 13+** | Link Sharing, Groq, Swarm Sync | Tier 2 & Tier 3 features (Share links, Groq summaries, WebRTC swarm sync) | **DEFERRED** | Tier 2 & 3 features. Shared route remains hidden per Rule 18. |

---

## 6. Review Gate Readiness

### Core Proof Review Gate Status: **NOT READY (BLOCKED)**

To pass the **Core Proof Review Gate**, the following criteria must be satisfied end-to-end:
1. [ ] User registration, Argon2id password hashing, and HTTP-only session cookie management.
2. [ ] Nested folder CRUD logic backed by SQLite `nodes` table.
3. [ ] Chunked file upload streaming directly into Content-Addressed Storage (`/data/blobs/sha256/xx/yy/hash`).
4. [ ] Upload collision modal prompt (*"Replace existing (vN)"*, *"Keep both"*, *"Cancel"*).
5. [ ] Version creation and version restoration rollback.
6. [ ] Interactive provenance verification backed by SHA-256 event chaining.
7. [ ] Tamper detection flagging modified or corrupted hashes.
8. [ ] Server-side Go PDF provenance report export.
9. [ ] Zero visual regressions on the existing frontend shell.

---

## 7. Remaining Blockers for Phase 1

The backend foundation is complete. To begin Phase 1 (Auth & Folder Navigation):

1. **Auth endpoints**: Implement `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` with Argon2id password hashing and HTTP-only session cookies.
2. **Folder/file CRUD**: Implement `GET /api/nodes`, `POST /api/nodes`, `PATCH /api/nodes/:id`, `DELETE /api/nodes/:id` backed by the `nodes` table.
3. **sqlc queries**: Write SQL queries for auth and node operations, generate typed Go code via `sqlc generate`.
4. **Frontend integration**: Install TanStack Query, create API client, begin replacing `mockData.ts` reads with typed API calls.
5. **OpenAPI expansion**: Add auth and node endpoint specifications to [`docs/openapi.yaml`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/docs/openapi.yaml).
