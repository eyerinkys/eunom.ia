# IVWS Core MVP Tech Stack

## Purpose

This stack is for the first complete, end-to-end version of IVWS.

The goal is to ship a reliable self-hosted file-management system with:

- authentication;
- nested folders;
- file upload and download;
- content-addressed storage;
- version history;
- cryptographic authorship provenance;
- storage visualisation;
- a structural file graph;
- offline fallback;
- Google Drive import;
- optional Groq-powered summaries.

The MVP must be architected so the later decentralised features can be added without rewriting the core.

---

## Frontend Stack

| Area | Technology | Purpose |
|---|---|---|
| Framework | React 19 + TypeScript | Main application framework with strict type safety |
| Build Tool | Vite | Fast development server and production builds |
| Routing | TanStack Router | Fully typed nested routes and route parameters |
| Server State | TanStack Query | File listings, version history, uploads, imports, summaries and cache invalidation |
| Local UI State | Zustand | Selection state, panels, graph filters, view modes and transfer queues |
| Styling | CSS Modules + Modern CSS | Full visual control without runtime styling overhead |
| UI Primitives | Radix UI | Accessible dialogs, menus, tooltips, popovers and controls |
| Icons | Lucide React | Consistent iconography |
| Layout Motion | Motion for React | Route transitions, shared layouts, panels, cards and gestures |
| Cinematic Motion | Anime.js | Provenance playback, graph reveals, staged sequences and advanced timelines |
| Drag and Drop | dnd-kit | Uploading, moving files and reorganising folders |
| Virtualisation | TanStack Virtual | Efficient rendering for folders with large numbers of files |
| Graph Visualisation | Vis Network | Interactive file, folder, version and relationship graphs |
| Local Metadata Cache | Dexie + IndexedDB | Cached folder data, pending operations and persistent transfer queues |
| Local File Cache | Origin Private File System (OPFS) | Offline file contents, previews and partial transfers |
| Service Worker | Workbox | Offline app shell, caching strategies and retry behaviour |
| Background Processing | Web Workers + Comlink | Hashing, diffing, graph preprocessing and provenance verification |

---

## Frontend Motion Responsibilities

### Motion for React

Use Motion for animation directly tied to React state or layout:

- route transitions;
- file-card movement;
- grid/list switching;
- side panels;
- modals;
- drag interactions;
- shared-element transitions;
- hover and tap feedback;
- collapsing folder trees;
- selection changes.

### Anime.js

Use Anime.js for deliberately orchestrated sequences:

- landing and onboarding sequences;
- provenance-chain verification;
- SHA-256 character assembly;
- graph-node reveals;
- file-tree stagger animations;
- storage-visualiser reveals;
- version-timeline playback;
- SVG line drawing;
- import progress sequences.

### CSS

Use CSS for simple interactions:

- basic hover states;
- colour transitions;
- focus states;
- small transform effects;
- reduced-motion fallbacks.

### Vis Network

Let Vis Network control:

- graph physics;
- node positioning;
- zoom;
- pan;
- node dragging;
- clustering;
- graph-camera movement.

Do not let Motion and Anime.js animate the same property on the same element.

---

## Backend Stack

| Area | Technology | Purpose |
|---|---|---|
| Language | Go | Streaming, hashing, concurrency and single-binary deployment |
| HTTP Router | net/http + Chi | Lightweight REST API and middleware |
| Database | SQLite in WAL mode | Users, sessions, metadata, versions, jobs and summaries |
| Query Layer | sqlc | Generate type-safe Go code from handwritten SQL |
| Migrations | Goose | Database schema migrations |
| API Contract | OpenAPI 3.1 | Shared contract between Go and TypeScript |
| Go API Generation | oapi-codegen | Typed Go request models and handlers |
| TypeScript API Generation | openapi-typescript | Typed frontend API definitions |
| Authentication | Secure cookie sessions + Argon2id | Local accounts without paid authentication services |
| Blob Storage | SHA-256 filesystem CAS | Immutable, deduplicated file storage |
| Uploads | Chunked upload flow | Large-file upload without loading entire files into memory |
| Google Drive Import | Google Drive API v3 | OAuth-based folder and file migration |
| AI Summaries | Groq SDK | Optional lazy summaries cached by content hash |
| PDF Reports | Structured HTML to PDF | Exportable provenance reports |
| Logging | Go slog | Structured local application logs |
| Background Jobs | SQLite-backed job table | Drive imports, summaries and report generation |

---

## Storage Architecture

```text
/data/
├── ivws.db
├── blobs/
│   └── sha256/
│       └── ab/
│           └── cd/
│               └── abcdef...
├── temp/
├── previews/
└── exports/
```

### SQLite Stores

- users;
- sessions;
- logical files and folders;
- file versions;
- blob references;
- provenance events;
- tags;
- summaries;
- import jobs;
- upload sessions;
- pending operations;
- audit metadata.

### Filesystem CAS Stores

- immutable file contents;
- deduplicated blobs;
- version payloads;
- imported Drive files;
- cached preview assets.

Large files should never be stored directly inside SQLite.

---

## Core Data Model

```text
users
sessions
nodes
blobs
file_versions
version_parents
provenance_events
tags
node_tags
summaries
upload_sessions
import_jobs
pending_operations
```

### Key Separation

```text
nodes
→ mutable logical file and folder identities

file_versions
→ immutable version records

blobs
→ immutable content-addressed file bytes

provenance_events
→ hash-chained authorship history
```

Moving or renaming a file updates metadata only. It does not move the physical blob.

---

## Core MVP Features

## 1. Authentication

Build:

- account registration;
- login;
- logout;
- secure HTTP-only session cookies;
- password hashing with Argon2id;
- account-owned file trees;
- optional demo account.

Do not build yet:

- organisations;
- SSO;
- paid identity providers;
- complex role hierarchies.

---

## 2. Folder and File Management

Build:

- nested folders;
- breadcrumb navigation;
- grid and list views;
- file upload;
- file download;
- rename;
- move;
- delete;
- restore;
- search by filename;
- metadata inspector;
- file selection;
- keyboard navigation.

---

## 3. Content-Addressed Storage

Upload flow:

```text
Client uploads chunks
→ backend writes temporary file
→ SHA-256 computed while streaming
→ size and hash verified
→ existing blob reused if identical
→ blob moved atomically into CAS
→ version record created
→ provenance chain updated
```

Requirements:

- no full-file buffering in memory;
- automatic deduplication;
- immutable blob storage;
- atomic writes;
- hash verification;
- skipped duplicate storage;
- logical filenames separated from physical blob paths.

---

## 4. Version History

Build:

- v1, v2, v3 timeline;
- timestamps;
- content hashes;
- file-size changes;
- restore previous version;
- skip unchanged versions;
- version notes;
- text diff for supported formats;
- version download;
- current-version marker.

---

## 5. Authorship Provenance

Build:

- hash-chained version events;
- previous-version hash;
- per-version SHA-256;
- chain verification;
- visual provenance timeline;
- verification status;
- one-click PDF export;
- report hash;
- tamper detection.

Suggested provenance event:

```json
{
  "fileId": "uuid",
  "versionId": "uuid",
  "blobHash": "sha256",
  "previousEventHash": "sha256-or-null",
  "createdAt": "timestamp",
  "eventHash": "sha256"
}
```

---

## 6. Storage Visualiser

Build:

- total storage usage;
- storage by file type;
- storage by folder;
- largest files;
- version-history storage cost;
- deduplication savings;
- recently added storage;
- interactive treemap or hierarchy view.

Recommended implementation:

- SVG and CSS for ordinary charts;
- D3 hierarchy utilities for treemaps;
- Motion for interaction;
- Anime.js for staged reveals.

---

## 7. Structural File Graph

Use Vis Network.

### Node Types

- folder;
- file;
- version;
- tag;
- imported collection.

### Edge Types

- contained in folder;
- previous version;
- linked by tag;
- imported together;
- manually linked;
- derived from file.

### MVP Controls

- zoom;
- pan;
- selection;
- neighbour highlighting;
- file-type filters;
- folder collapsing;
- open selected file;
- open metadata panel;
- reset graph;
- fit graph to viewport.

Do not add AI-generated semantic links in the MVP. Structural edges are deterministic and explainable.

---

## 8. Offline Fallback

Build:

- offline app shell;
- cached folder listings;
- user-selected offline files;
- OPFS storage for cached file contents;
- IndexedDB metadata cache;
- persistent upload queue;
- pending metadata-operation queue;
- retry after reconnect;
- offline status indicator;
- graceful stale-data messaging.

Do not build full multi-peer conflict resolution yet.

---

## 9. Google Drive Import

Build:

- Google OAuth flow;
- folder selection;
- recursive hierarchy import;
- folder recreation;
- streamed file import into CAS;
- progress display;
- retry failed items;
- resumable import jobs;
- preserved filenames;
- preserved timestamps where available;
- import summary.

---

## 10. Groq Summaries

Build:

- explicit opt-in;
- generate-summary button;
- support for text-extractable formats;
- sampled or truncated content only;
- cache by SHA-256;
- no repeated call for unchanged blobs;
- clear failure state;
- no dependency on Groq for core file access.

Groq is an optional enhancement, not part of the storage or API architecture.

---

## API Design

Use OpenAPI 3.1 as the source of truth.

```text
openapi.yaml
├── generated Go types and handlers
└── generated TypeScript API types
```

Suggested API groups:

```text
/api/auth
/api/nodes
/api/files
/api/uploads
/api/versions
/api/provenance
/api/storage
/api/graph
/api/imports
/api/summaries
/api/offline
```

---

## Core Architecture

```text
┌──────────────────────────────────────┐
│ React 19 Frontend                    │
│                                      │
│ TanStack Router + Query              │
│ Zustand                              │
│ Motion + Anime.js                    │
│ Vis Network                          │
│ Dexie / IndexedDB + OPFS             │
│ Workbox + Web Workers                │
└──────────────────┬───────────────────┘
                   │ REST / OpenAPI
                   │
┌──────────────────▼───────────────────┐
│ Go Modular Monolith                  │
│                                      │
│ Auth Service                         │
│ File Service                         │
│ Version Service                      │
│ Provenance Service                   │
│ Graph Service                        │
│ Drive Importer                       │
│ Groq Summariser                      │
│ Background Job Runner                │
└───────────────┬──────────────┬───────┘
                │              │
        ┌───────▼───────┐ ┌────▼────────────┐
        │ SQLite       │ │ Filesystem CAS  │
        │ Metadata     │ │ Immutable Blobs │
        └──────────────┘ └─────────────────┘
```

---

## Deployment

Initial deployment:

```text
Docker Compose
├── ivws frontend
├── ivws Go backend
└── persistent data volume
```

The production goal should eventually be:

```text
single Go binary
+ static frontend assets
+ data directory
```

No paid infrastructure is required for the core system.

---

## MVP Non-Negotiables

- Build a modular monolith.
- Do not introduce microservices.
- Do not store file blobs inside SQLite.
- Do not depend on Groq for core functionality.
- Do not replicate SQLite database files.
- Do not build CRDT sync before the local workflow works.
- Do not build real-time editing in the MVP.
- Do not compromise provenance integrity for flashy visuals.
- Keep all animations compatible with reduced-motion preferences.
- Every core workflow must work end-to-end before expansion begins.
