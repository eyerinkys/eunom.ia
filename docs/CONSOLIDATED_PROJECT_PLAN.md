# Eunomia — Consolidated Project Plan

---

## 1. Project Goal and Core Concept

Build **Eunomia** — a self-hosted, content-addressed web file-management system designed so students are never locked out of critical files by provider outages, storage paywalls, or institutional account termination.

The product is functionally comparable to Google Drive — browse, upload, download, organise, search, share — but distinguished by three headline features:

1. **Authorship Provenance Trail** — hash-chained version history that lets a student cryptographically prove a file was built incrementally, exportable as a PDF report.
2. **Peer Swarm Sync** — LAN auto-discovery + WebRTC peer replication backed by CRDTs, so the system survives the death of any single server, including its own.
3. **One-Click Google Drive Import** — OAuth-based migration that recreates folder hierarchies, targeting students forced off institutional Google Workspace plans.

The interface is themed around the concept of **Eunomia** (good order, lawful structure, balance) — expressed through visual discipline, spatial rhythm, and structural motifs rather than literal Greek decoration.

### Hackathon Execution Priorities

1. Core Proof must work end-to-end.
2. Core Proof must look polished and demonstrate provenance clearly.
3. Tier 1B Essential features follow to complete the primary product path.
4. Optional features (Tier 1B Optional) are attempted only after the full demo path is reliable.
5. Tier 2 and Tier 3 remain strictly deferred.

### Uninterrupted Demo-Path Requirement

The final stage demo must support one uninterrupted walkthrough from login to upload, new version creation, provenance verification sequence, PDF export, storage visualisation, structural graph view, and Google Drive import. If any optional feature threatens the stability of this primary walkthrough path, it must be deferred.

---

## 2. Confirmed Requirements

### 2.1 Core Functional Requirements

| Category | Requirement |
|---|---|
| Navigation | Nested folders, breadcrumb navigation |
| File Operations | File upload (chunked), download |
| Storage | Content-addressed storage (SHA-256 CAS, deduplication) |
| Versioning | Version history — v1/v2/v3 timeline, timestamps, hashes, diffs, restore, version notes |
| Provenance | Authorship Provenance Trail — hash-chained events, visual verification, one-click PDF export |
| Analytics | Storage visualiser — usage by type/folder, largest files, dedup savings, treemap |
| Visualization | Structural file graph — folder/file/version nodes, structural edges |
| Offline | Offline fallback — service worker app shell, IndexedDB metadata, OPFS file cache, pending queues (Optional for Hackathon) |
| Integration | One-Click Google Drive Import — OAuth, recursive hierarchy, resumable jobs |
| Intelligence | Groq-powered file summaries — opt-in, lazy, cached by content hash |
| Access Control | Authentication — registration, login, logout, Argon2id, HTTP-only session cookies |
| Discovery | Search by filename |
| File Lifecycle | Rename, move, delete, restore from trash |
| View Modes | List and grid views |
| Metadata | Dedicated file inspector (Details, Versions, Provenance tabs) |
| Interaction | Multi-select, keyboard navigation |

### 2.2 UI/UX Design Requirements

| Feature / Area | Specification |
|---|---|
| Visual Concept | "The Ordered Archive" — archival, editorial, civic; not temple/fantasy |
| Signature Motif | "The Rule Line" — structural line motif across selection, breadcrumbs, dividers, progress |
| Colour Palette | Mineral/archival — warm paper/stone, dark ink, muted bronze, olive, clay-red |
| Typography | Three typeface system — clean sans (interface), restrained serif (display/wordmark), monospace (hashes/IDs) |
| Geometry | Restrained radii, nearly-square rows, lightly-rounded buttons |
| Spatial Layout | Compact density, productive spacing, balanced desktop productivity |
| Motion System | Motion = elements finding correct place; reserved signature moments; no bounce/spring/elastic |
| Identity | Geometric/abstract logo from E + three lines + axis; no goddess, column, wreath |
| Responsive Layout | Full responsive behavior: desktop (persistent sidebar + inspector), tablet (collapsible), mobile (navigation sheet, bottom sheet details) |
| Accessibility | Contrast, keyboard navigation, focus states, screen reader support, scalable text, touch targets, non-colour-only status indicators |
| Target Screens | 12 screens designed: Login, Home, My Files, Folder View, Search Results, Shared, Recent, Offline, Trash, Settings, Dedicated File Inspector, Upload Queue |
| UI Components | 7 component sets: File Row states, Grid Card states, Sidebar, Inspector, Upload Queue, Empty States, Mobile |
| Design Constraints | Explicit anti-pattern list: no generic AI dashboard, SaaS template, purple gradients, glassmorphism, bouncing, mythology costume |

---

## 3. Architectural Decisions

These are confirmed engineering choices that define the system's structure.

| System Area | Decision / Detail |
|---|---|
| Backend language | Go — single-binary deployment, streaming, concurrency |
| Database | SQLite in WAL mode |
| API contract | OpenAPI 3.1, code-generated Go + TypeScript types |
| Frontend framework | React 19 + TypeScript + Vite |
| Routing | TanStack Router |
| Server state | TanStack Query |
| Local state | Zustand |
| Styling | CSS Modules + Modern CSS |
| UI primitives | Radix UI |
| Animation (JS) | Anime.js — sole JavaScript animation framework |
| Animation (CSS) | CSS transitions for routine hover, focus, colour, border, opacity, rule-line effects |
| Drag and drop | dnd-kit |
| Virtualisation | TanStack Virtual |
| Graph Engine | Vis Network (hierarchical mode, physics disabled, custom node/edge styling) |
| Offline metadata | Dexie + IndexedDB |
| Offline files | OPFS |
| Service worker | Workbox |
| Background processing | Web Workers + Comlink |
| Blob storage | SHA-256 filesystem CAS |
| PDF reports | Pure Go PDF library (e.g. `gopdf` or `maroto`) |
| Deployment | Docker Compose → eventual single Go binary + static assets |
| Architecture style | Modular monolith — no microservices |

### Modular Monolith Services

Internal service boundaries within a single Go binary:

- Auth Service
- File Service
- Version Service
- Provenance Service
- Graph Service
- Drive Importer
- Groq Summariser (deferred)
- Background Job Runner

### Upload Pipeline

```text
Client chunks → backend temp file → SHA-256 streamed → size+hash verified
→ collision check (prompt if name exists) → existing blob reused if match
→ atomic CAS move → version record → provenance chain updated
```

No full-file buffering in memory.

### Storage Architecture

```text
/data/
├── eunomia.db
├── blobs/
│   └── sha256/
│       └── ab/
│           └── cd/
│               └── abcdef...
├── temp/
├── previews/
└── exports/
```

### Core Architecture

```text
┌──────────────────────────────────────┐
│ React 19 Frontend                    │
│                                      │
│ TanStack Router + Query              │
│ Zustand                              │
│ Anime.js + CSS Transitions           │
│ Vis Network                          │
│ Dexie / IndexedDB + OPFS            │
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
        │ SQLite        │ │ Filesystem CAS  │
        │ Metadata      │ │ Immutable Blobs │
        └───────────────┘ └─────────────────┘
```

### Deployment

Initial:

```text
Docker Compose
├── Eunomia frontend
├── Eunomia Go backend
└── persistent data volume
```

Production goal:

```text
single Go binary
+ static frontend assets
+ data directory
```

No paid infrastructure required for the core system.

---

## 4. Product Decisions

These are confirmed choices about what the product is and how it behaves.

| Decision | Detail |
|---|---|
| Product name | **Eunomia** — wordmark: *Eunomia*, subtitle: *The Ordered Archive* |
| Headline feature | Authorship Provenance Trail — cryptographic proof of incremental authorship |
| Upload collision behaviour | Explicit inline prompt: *"Replace existing file (create vN)"*, *"Keep both (auto-rename)"*, or *"Cancel"*. No silent overwrite or silent version creation. Auto-versioning occurs only via the explicit "Upload New Version" action in the Inspector. |
| Default file view | List view |
| Multi-user from day one | Argon2id, secure HTTP-only session cookies, account-owned file trees. Required for authorship provenance and Google Drive import ownership. |
| Graph style | Hierarchical 2D structural layout using Vis Network, physics disabled, custom node/edge styling |
| Sharing | Designed in Phase 0A, not implemented until Tier 2. The Shared navigation item must not appear as a functioning route until sharing exists. |
| Text diff | Basic side-by-side and inline text diff (plaintext/markdown) included in Tier 1B Essential |
| Tags | Tables added to schema only when tag management UI is introduced (Tier 3) |

---

## 5. Design Defaults

These are initial visual and interaction defaults. They may be refined after mock-ups and user testing.

| Default | Value |
|---|---|
| Background colour | Warm paper `#F7F5F0` |
| Primary text | Dark ink `#1A1918` (ratio >12:1 on background) |
| Accent | Muted bronze `#8C6D3B` |
| Success/positive | Muted olive `#556B2F` |
| Destructive | Clay red `#9E3B3B` |
| Rules and dividers | Subtle grey-beige |
| Control radius | 4px |
| Row selection indicator | 2px |
| Panel radius | 6px |
| Pill radius | Reserved for filter tags and status badges only |
| Default table row height | 36px (compact desktop productivity) |
| Density toggle in Settings | Compact (32px) / Standard (40px) |
| Inspector width | Fixed; does not cause table column reflow |
| Selected row treatment | Distinct background tint + 3px solid ink rule on left margin |
| Typography | Sans (interface), Serif (display/wordmark), Monospace (hashes/IDs), `font-variant-numeric: tabular-nums` for sizes/dates |
| Type scale | Display Serif 24/1.2, UI Heading Sans 16/1.3, UI Body Sans 14/1.4, UI Caption Sans 12/1.4, Mono Code 12/1.5 |

---

## 6. Animation System

### Sole JavaScript Animation Framework: Anime.js

Anime.js is the only JavaScript animation library in the project. CSS transitions handle simple state changes. There is no second JS animation engine.

The animation quality takes inspiration from the official Anime.js website: precise choreography, geometric assembly, typography movement, line drawing, SVG animation, and layered transitions. This quality is translated into Eunomia's themes of order, hierarchy, architectural geometry, archival structure, and balance — not copied as visual identity or exact sequences.

### Motion Levels

#### Level 1 — Routine

Hover, selection, menus, standard dialogs, upload progress bars, list/grid switching, focus states.

- **Scope & Behavior:** For normal file browsing, search, settings, folder navigation, and repeated interactions:
  - File rows must appear immediately (in a single frame).
  - No per-row entrance stagger.
  - Hashes display immediately in monospace formatting.
  - No decorative choreography.
  - Animation must remain fast, crisp, and non-blocking (durations 100–200ms).
- **Technology:** Primary reliance on CSS transitions. Anime.js used only if multi-element timing synchronization is required.

#### Level 2 — Structural

Folder navigation transitions, file inspector open/close, version timeline expansion, graph node expand/collapse, route changes, upload state changes.

- **Scope & Behavior:** Coordinated structural movement that clarifies UI state changes. Elements move into position with architectural precision. Durations 200–400ms. Must never block user input or cause non-responsive UI states. Included in Tier 1A for core inspector and version interactions.
- **Technology:** Anime.js timelines for coordinated multi-element sequences. CSS transitions for individual property changes.

#### Level 3 — Signature

App entry and login logo assembly, provenance chain verification playback sequence, verification result state transitions, PDF export completion feedback, first archive reveal, storage visualiser treemap reveal, Google Drive import completion summary.

- **Scope & Behavior:** Controlled stagger, hash assembly, line drawing, SVG animation, and layered timelines are explicitly allowed for these key moments.
  - **Hash Assembly Rule:** Character assembly animation is strictly limited to the provenance verification sequence and must never obscure or delay the final readable hash.
  - **File-Tree Stagger Rule:** File-tree stagger animation may be used only for rare first-entry or import sequences, never during ordinary folder browsing.
  - Durations range from 600ms to 1500ms.
- **Technology:** Rich Anime.js choreography with multi-stage timelines, staggered geometric reveals, SVG path drawing, and layered transitions.

### CSS Transition Responsibilities

- Row hover tints
- Focus ring appearance
- Colour transitions (button states, link states)
- Border and opacity changes
- Rule line width reveals

### Motion Anti-Patterns (Banned)

- Bounce easing, elastic, or spring motion anywhere in the interface.
- Perpetual animation or infinite loops.
- Glowing pulse effects or glowing nodes.
- Excessive hover scaling.
- Entrance stagger animation on ordinary file browsing or repeated folder views.
- Scroll-jacking inside the file manager.
- Motion that blocks user interaction.
- Animated gradient backgrounds.
- Floating card levitation.
- SHA-256 character assembly during routine file browsing or inspector viewing (hashes must display immediately; assembly is permitted strictly during the signature provenance verification sequence).

---

## 7. Tier 1A — Core Proof

The minimum viable demonstration of Eunomia's core value proposition, incorporating both functional core features and headline signature animations.

| # | Feature | Notes |
|---|---|---|
| 1 | Authentication | Multi-user registration/login/logout, Argon2id, session cookies |
| 2 | Nested folders | Create, rename, move, delete folders; breadcrumb navigation |
| 3 | Basic file management | List view, upload, download, rename, move, delete, restore |
| 4 | Upload/download with CAS | Chunked upload, SHA-256, deduplication, atomic writes, collision prompts |
| 5 | Version history | v1/v2/v3 timeline, timestamps, hashes, size changes, restore, version notes, version download |
| 6 | Hash-chained provenance | Hash-chained authorship events, chain verification endpoint |
| 7 | Chain verification sequence | Interactive visual provenance timeline, verification status, tamper detection |
| 8 | Provenance PDF export | Structured PDF generated with pure Go PDF library + export completion feedback |
| 9 | Default list view | Core file browser with sorting and column alignment |
| 10 | Dedicated File Inspector | Multi-tab side panel with three distinct tabs: **Details**, **Versions**, and **Provenance** |
| 11 | Core Animation System | App entry/login transition, inspector open/close slide, version timeline expansion, provenance verification playback sequence, verification result state reveal, PDF export feedback |

### Dedicated File Inspector Structure (Tier 1A)

The File Inspector is a persistent, non-reflowing side panel structured into three primary tabs:

1. **Details Tab:** Filename, MIME type, storage location, last modified date, size, owner, content hash.
2. **Versions Tab:** Version timeline (v1, v2, v3...), parent links, timestamps, version notes, restore action, version download action.
3. **Provenance Tab:** Cryptographic chain status badge, interactive "Verify Provenance" trigger, step-by-step event timeline with hash links, tamper detection indicators, and "Export Provenance PDF" action.

### Exit Criterion (Core Proof Review Gate)

> A user can register, log in, create folders, upload a file, upload revised versions, inspect file details, view versions, run the interactive provenance verification animation, detect tampering, and export a provenance PDF report with smooth animation feedback.

**Nothing beyond Tier 1A begins before this works end-to-end and passes review.**

---

## 8. Tier 1B Essential — Complete Demo

Fills out the core demo experience around the proven Tier 1A foundation. Passing the Complete Demo Review Gate requires Tier 1B Essential only.

| # | Feature | Notes |
|---|---|---|
| 12 | Grid view | Card layout with file previews, list/grid toggle |
| 13 | Filename search | Search bar with dedicated results view |
| 14 | Plaintext/Markdown diff | Side-by-side and inline text diff viewer between file versions |
| 15 | Storage visualiser | Usage by type/folder, largest files, dedup savings, treemap reveal sequence |
| 16 | Structural file graph | Vis Network implementation (hierarchical mode, physics disabled, custom node/edge styling, folders and files only, optional version lineage, zoom/pan/select/collapse/expand/open item) |
| 17 | Google Drive import | OAuth consent, folder selection, recursive traversal, streaming, rate-limit retry, resumable jobs, progress, import completion summary animation |
| 18 | Home screen | Continue working section, recent activity, key locations, storage overview |
| 19 | Upload queue | Active/paused/complete/failed/retrying queue panel |
| 20 | Recent files | Chronological file access listing |
| 21 | Core UI states | Line placeholders, skeleton loaders, empty states, and contextual error states across all primary views |
| 22 | Desktop & Basic Tablet Polish | Desktop density optimisation, tablet collapsible sidebar, overlay inspector, simplified column layouts |
| 23 | Secondary Animations | Storage visualiser treemap reveal, structural graph transitions, Google Drive import completion sequence, page-level polish, advanced layout transitions |

---

## 9. Tier 1B Optional — Time Permitting

Non-essential features deferred until Tier 1B Essential is complete and verified. These features are attempted only if time permits and must never destabilise the primary demo walkthrough.

| # | Feature | Notes |
|---|---|---|
| 24 | Offline Mode | Service worker (Workbox) app shell, Dexie/IndexedDB metadata cache, OPFS file content cache, pending operations queue, stale indicators, reconnect sync retry. Marked strictly optional for hackathon. |
| 25 | Full Settings | Comprehensive settings panel (account management, appearance themes, density toggle, storage allocation, privacy controls) |
| 26 | Comprehensive Trash | Dedicated trash view with deletion dates, individual item restore, permanent deletion, empty trash workflow |
| 27 | Advanced Tablet & Essential Mobile | Extended tablet gesture support, essential mobile responsive views (navigation sheet, mobile bottom sheet details) |
| 28 | Exhaustive Secondary States | Edge-case error handling, offline fallback notices, empty search filters |
| 29 | Additional Animation Polish | Secondary micro-interactions and non-critical motion refinements |

---

## 10. Later Tiers (Tier 2 & Tier 3)

### Tier 2 — Should Ship (After Tier 1 Complete)

| # | Feature | Notes |
|---|---|---|
| 30 | Link Sharing | Unique share link generation, view/edit permission toggle. Shared screen becomes a functioning route. |
| 31 | Peer Swarm Sync — Primary Layer | LAN mDNS peer discovery, WebRTC direct data replication, stateless signaling server |
| 32 | Groq File Summaries | Opt-in, lazy summarisation for text formats, truncated input, cached by content hash |

### Tier 3 — If Time Allows (Post Tier 2)

| # | Feature |
|---|---|
| 33 | Peer Swarm Sync — CRDT Merge |
| 34 | Linux-style RWX permissions |
| 35 | Real-time multi-user collaboration |
| 36 | Binary diff heuristics |
| 37 | Symlink-style virtual file references |
| 38 | Default folder scaffolding templates |
| 39 | Metadata tagging + linked files (tag tables added to schema here) |
| 40 | Expiring / password-protected share links |
| 41 | Audit log per file |
| 42 | Map-reduce document summarisation |

---

## 11. Database Scope

The initial database migration contains exclusively the tables required for Tier 1A Core Proof:

```sql
users
sessions
nodes
blobs
file_versions
version_parents
provenance_events
upload_sessions
```

**Key structural separation:** `nodes` (mutable logical file/folder identity) → `file_versions` (immutable version records) → `blobs` (immutable content-addressed bytes) → `provenance_events` (hash-chained cryptographic event log).

### Deferred Tables

Tables are created in separate migrations only when their corresponding feature phases are implemented:

| Table(s) | Introduced In | Phase |
|---|---|---|
| `import_jobs` | Google Drive Import | Tier 1B Essential |
| `pending_operations` | Offline Mode | Tier 1B Optional |
| `share_links`, `permissions` | Link Sharing | Tier 2 |
| `summaries` | Groq Summaries | Tier 2 |
| `tags`, `node_tags` | Tagging System | Tier 3 |

Large binary files are stored strictly in the content-addressed filesystem (`/data/blobs/sha256/`), never inside SQLite.

---

## 12. Graph Scope

The Tier 1B Essential structural graph is implemented strictly using **Vis Network**.

### Technical Specification

- **Rendering Engine:** Vis Network.
- **Layout Mode:** Hierarchical mode (`layout: { hierarchical: { enabled: true, direction: 'UD', sortMethod: 'directed' } }`).
- **Physics Engine:** Physics strictly disabled (`physics: { enabled: false }`).
- **Styling:** Custom node and edge styling matching "The Ordered Archive" design system (mineral colours, dark ink borders, rectangular node shapes).
- **Node Scope:** Folder nodes and File nodes only.
- **Edge Scope:** Folder containment edges (folder → child file/folder) and optional version lineage edges (file → previous version).
- **Interactions Supported:** Zoom, pan, node select, folder collapse/expand, and open selected item in file manager.

### Excluded from Hackathon Scope

- Force-directed or spring physics.
- Glowing nodes or particle effects.
- Tag nodes, AI relationship edges, peer swarm nodes, or device nodes.

---

## 13. PDF Strategy

**Primary Architecture:** Server-side generation of structured provenance reports using a pure Go PDF library (e.g. `gopdf` or `maroto`). Data is queried directly from `provenance_events`, `file_versions`, and `nodes`, then rendered directly into a PDF containing structured headers, version history tables, monospace SHA-256 hash blocks, and cryptographic verification seals.

**Phase 5 Prototype Task:** Implement a minimal Go PDF export function during Phase 5. Verify that output formatting, monospace hash legibility, and table structures satisfy visual standards without external dependencies.

**Contingency:** A headless browser renderer (e.g., `chromedp`) will be evaluated only if the Go PDF library fails minimum layout or hash legibility standards after a dedicated prototype effort.

---

## 14. Upload Collision Behaviour

When an uploaded file matches the filename of an existing file in the target folder, the upload process pauses and displays an explicit modal prompt:

1. **Replace existing file:** Creates a new version (vN) linked to the existing logical node.
2. **Keep both:** Auto-renames the uploaded file (e.g., `Document (1).pdf`).
3. **Cancel:** Aborts the upload session.

No silent overwrites occur. No silent version creation occurs during standard folder uploads.

The explicit **"Upload New Version"** button in the File Inspector directly triggers version creation without this collision prompt, as user intent is explicit.

---

## 15. Responsive Scope

### Initial Design (Phase 0A)

Design layouts for Desktop (1440px+), Tablet (768px–1023px), and Mobile (375px–767px).

### Implementation Matrix

| Breakpoint | Tier 1A | Tier 1B Essential | Tier 1B Optional |
|---|---|---|---|
| Desktop | Full Implementation | Full Implementation | Polish & Optimization |
| Tablet | Core Layout | Collapsible sidebar, overlay inspector, simplified columns | Advanced touch & layout polish |
| Mobile | Deferred | Deferred | Essential browsing, upload, search, file details |

---

## 16. Phased Build Order

### Phase 0A — Product and Interface Definition
- **Purpose:** Define visual system, layouts, components, and motion specs before code execution.
- **Complexity:** Medium | **Dependencies:** None.
- **Deliverables:** Documented user flows, 12 screen wireframes/layouts, 7 component sets, CSS token specs, Anime.js motion level guidelines.

### Phase 0B — Technical Foundation
- **Purpose:** Project skeleton, OpenAPI contract, database setup, and generated types.
- **Complexity:** Medium | **Dependencies:** Phase 0A.
- **Deliverables:** Go backend module, Vite + React 19 frontend, `openapi.yaml`, SQLite + Goose schema migration (8 core tables), Docker Compose configuration, CSS variable definitions.

### Phase 1 — Authentication and Folder Navigation
- **Purpose:** Multi-user authentication, account session management, and nested folder CRUD.
- **Complexity:** High | **Dependencies:** Phase 0B.
- **Deliverables:** Argon2id auth endpoints, session cookie management, folder tree CRUD logic, Login screen UI, App Shell (sidebar, top bar, breadcrumbs), My Files list view.

### Phase 2 — Upload/Download and Content-Addressed Storage
- **Purpose:** Chunked file upload, SHA-256 CAS storage, deduplication, and collision handling.
- **Complexity:** High | **Dependencies:** Phase 1.
- **Deliverables:** CAS storage engine (`/data/blobs/sha256/`), streamed SHA-256 calculation, explicit upload collision modal, streaming download endpoint, drag-and-drop upload UI with progress indicators.

### Phase 3 — Version History
- **Purpose:** Incremental version creation, version listing, and version restoration.
- **Complexity:** High | **Dependencies:** Phase 2.
- **Deliverables:** `file_versions` and `version_parents` logic, re-upload version detection, explicit "Upload New Version" inspector action, version restoration endpoint, version download action.

### Phase 4 — Provenance Chain and Verification
- **Purpose:** Hash-chained authorship events, verification engine, and visual provenance UI.
- **Complexity:** Critical | **Dependencies:** Phase 3.
- **Deliverables:** `provenance_events` logging, SHA-256 event chaining, verification API endpoint, dedicated File Inspector **Provenance** tab, visual chain status, tamper detection UI.

### Phase 5 — PDF Export and Core Animation Integration
- **Purpose:** Provenance PDF generation and integration of core Tier 1A animations.
- **Complexity:** High | **Dependencies:** Phase 4.
- **Deliverables:** Server-side Go PDF generator (`gopdf`/`maroto`), inspector "Export PDF" trigger, App entry/login transition, inspector open/close animation, version timeline expansion animation, interactive provenance verification playback animation, PDF export completion feedback.

---

### ★ Core Proof Review Gate

**Prerequisite:** Completion of Phases 1 through 5.

**Mandatory Verification Criteria:**
1. A user can register, log in, create nested folders, and upload files into CAS.
2. Uploading a revised file or using "Upload New Version" creates a v2 record with deduplicated content storage.
3. Dedicated File Inspector renders **Details**, **Versions**, and **Provenance** tabs cleanly.
4. Clicking "Verify Provenance" runs the interactive Anime.js verification sequence and reports chain integrity.
5. Tampering with event records triggers clear visual tamper indicators.
6. "Export Provenance PDF" generates a structured PDF containing full hash lineage.
7. All Tier 1A animations execute cleanly without UI blocking.

---

### Phase 6 — Core UI Completion (Tier 1B Essential)
- **Purpose:** Grid view, search, home screen, upload queue, recent files, and primary states.
- **Complexity:** Medium | **Dependencies:** Core Proof Gate Passed.
- **Deliverables:** Grid view toggle, filename search bar and results view, Home screen layout, Recent files list, Upload queue panel, full set of loading skeletons, empty states, and error alerts.

### Phase 7 — Plaintext & Markdown Diff (Tier 1B Essential)
- **Purpose:** Side-by-side and inline text diff comparison between file versions.
- **Complexity:** Medium | **Dependencies:** Phase 3, Phase 6.
- **Deliverables:** Web Worker diff calculation engine, side-by-side diff viewer, inline diff viewer with syntax highlighting for text and Markdown.

### Phase 8 — Storage Visualisation (Tier 1B Essential)
- **Purpose:** Storage breakdown charts, deduplication analytics, and treemap visualization.
- **Complexity:** Medium | **Dependencies:** Phase 2, Phase 6.
- **Deliverables:** Storage analytics backend API, D3 treemap / SVG chart components, Level 3 Anime.js storage reveal sequence.

### Phase 9 — Structural Graph (Tier 1B Essential)
- **Purpose:** Interactive structural graph using Vis Network.
- **Complexity:** High | **Dependencies:** Phase 2, Phase 3, Phase 6.
- **Deliverables:** Graph node/edge API endpoint, Vis Network integration (hierarchical layout, physics disabled, custom archival styling), zoom/pan/select/collapse controls.

### Phase 10 — Google Drive Import (Tier 1B Essential)
- **Purpose:** OAuth Google Drive migration pipeline.
- **Complexity:** High | **Dependencies:** Phase 2, Phase 3, Phase 6.
- **Deliverables:** `import_jobs` migration, Google OAuth2 integration, recursive Drive scanner, resumable chunked importer into CAS, import wizard UI with retry log and summary animation.

---

### ★ Complete Demo Review Gate

**Prerequisite:** Completion of Phases 6 through 10 (Tier 1B Essential).

**Mandatory Verification Criteria:**
1. The full primary stage demo path operates without error: Login → Upload → New Version → Dedicated Inspector → Provenance Verification Animation → PDF Export → Storage Visualisation → Vis Network Structural Graph → Google Drive Import.
2. Storage visualiser renders real CAS storage statistics with signature treemap reveal animation.
3. Vis Network graph renders cleanly in hierarchical mode with physics disabled.
4. Drive import wizard successfully imports folder trees into CAS.
5. All primary UI screens pass visual fidelity checks.
6. No optional Tier 1B feature is present that destabilises the core demo path.

---

### Phase 11 — Offline Mode (Tier 1B Optional)
- **Purpose:** Service worker caching, IndexedDB metadata, OPFS file storage, sync queue.
- **Complexity:** High | **Dependencies:** Complete Demo Gate Passed.
- **Deliverables:** `pending_operations` migration, Workbox service worker, Dexie/IndexedDB metadata storage, OPFS file cache, offline UI indicator badges, reconnect sync retry engine.

### Phase 12 — Complete Demo Polish (Tier 1B Optional)
- **Purpose:** Desktop/tablet responsive refinement, UI GUIDE 17-point quality audit, motion audit.
- **Complexity:** Medium | **Dependencies:** Complete Demo Gate Passed.
- **Deliverables:** Responsive tablet drawer & inspector overlay, full compliance audit against UI GUIDE quality checklist, non-critical animation polish.

### Phase 13 — Link Sharing & Groq Summaries (Tier 2)
- **Purpose:** Read/write share links and opt-in AI file summaries.
- **Complexity:** Medium | **Dependencies:** Complete Demo Gate Passed.
- **Deliverables:** `share_links` and `permissions` migrations, public share link endpoints, Shared navigation route activation, `summaries` migration, Groq API client integration, summary display in Inspector.

### Phase 14 — Peer Swarm Sync — Primary Layer (Tier 2)
- **Purpose:** LAN discovery and WebRTC peer file replication.
- **Complexity:** Critical | **Dependencies:** Phase 11, Phase 13.
- **Deliverables:** mDNS LAN peer discovery, WebRTC signaling server, direct WebRTC data channel replication protocol.

### Phase 15+ — CRDT Merge & Advanced Features (Tier 3)
- **Purpose:** Full multi-peer CRDT state resolution, advanced permissions, and real-time collaboration.
- **Complexity:** Critical | **Dependencies:** Tier 2 complete.
- **Deliverables:** CRDT document state engine, Linux RWX permission model, real-time collab features, binary diffing.

---

## 17. Core Proof Review Gate

### Requirements to Pass

- User registration, authentication, session persistency.
- Nested folder CRUD and navigation.
- Chunked file upload to CAS, SHA-256 hashing, deduplication verification, streaming download.
- Upload collision prompt correctly triggers on name collision.
- Re-upload creates incremental version (v2); version history accessible in Inspector.
- Dedicated File Inspector renders **Details**, **Versions**, and **Provenance** tabs.
- Interactive provenance verification sequence executes with Level 3 Anime.js choreography.
- Tamper detection correctly flags compromised hash links.
- Provenance report exports directly to PDF via Go backend without external headless browser processes.
- Tier 1A core animations (app entry, inspector open/close, version timeline expansion, verification playback, PDF feedback) function smoothly.

---

## 18. Complete Demo Review Gate

### Requirements to Pass

- Tier 1B Essential features fully implemented and verified.
- The end-to-end stage demo path runs without interruption:
  1. Authenticate user.
  2. Upload document into nested folder.
  3. Upload revised version.
  4. Open dedicated Inspector → view Details & Versions.
  5. Select Provenance tab → trigger interactive verification sequence → confirm chain integrity.
  6. Export provenance PDF report.
  7. Open Storage Visualiser → view treemap breakdown.
  8. Open Structural Graph → navigate folder/version nodes in Vis Network.
  9. Run Google Drive Import → view imported folder structure.
- Vis Network graph renders cleanly in hierarchical mode with physics disabled.
- Storage visualiser treemap animates cleanly.
- Google Drive import handles folder recursion and file ingestion into CAS.
- Secondary signature animations are stable across all primary views.
- No unhandled errors or missing loading states on primary routes.
- Optional features (Offline mode, full settings, comprehensive trash) are isolated and have zero negative impact on demo path stability.

---

## 19. Dependencies

```text
Phase 0A: Product & Interface Definition
   └─► Phase 0B: Technical Foundation
          └─► Phase 1: Auth & Folders
                 └─► Phase 2: Upload/Download & CAS
                        └─► Phase 3: Version History
                               └─► Phase 4: Provenance Chain
                                      └─► Phase 5: PDF Export & Core Animations
                                             └─► ★ CORE PROOF REVIEW GATE
                                                    │
                                                    ├─► Phase 6: Core UI Completion
                                                    ├─► Phase 7: Text Diff
                                                    ├─► Phase 8: Storage Visualiser
                                                    ├─► Phase 9: Vis Network Structural Graph
                                                    └─► Phase 10: Google Drive Import
                                                           │
                                                           └─► ★ COMPLETE DEMO REVIEW GATE
                                                                  │
                                                                  ├─► Phase 11: Offline Mode (Tier 1B Optional)
                                                                  ├─► Phase 12: Complete Demo Polish (Tier 1B Optional)
                                                                  ├─► Phase 13: Link Sharing + Groq (Tier 2)
                                                                  └─► Phase 14: Peer Swarm Sync (Tier 2)
                                                                         └─► Phase 15+: Tier 3 Features
```

---

## 20. Complexity Ratings

| Phase | Title | Complexity | Rationale |
|---|---|---|---|
| Phase 0A | Product & Interface Definition | Medium | UI/UX design, component token specs, layout wireframing |
| Phase 0B | Technical Foundation | Medium | Go module setup, Vite + React 19 configuration, OpenAPI definitions, DB schema |
| Phase 1 | Auth & Folders | High | Argon2id security, HTTP-only sessions, recursive folder tree CRUD |
| Phase 2 | Upload/Download & CAS | High | Chunked streaming, inline SHA-256 hashing, atomic CAS placement, collision UI |
| Phase 3 | Version History | High | Immutable version tree, parent pointer resolution, dedup version logic |
| Phase 4 | Provenance Chain | Critical | Hash chain integrity is the primary core promise. Must be cryptographically sound. |
| Phase 5 | PDF Export & Core Animations | High | Server-side Go PDF rendering + Tier 1A Anime.js core animation integration |
| Phase 6 | Core UI Completion | Medium | Standard product views (Grid, Search, Home, Queue, Recent, primary states) |
| Phase 7 | Text Diff | Medium | Line-level text diff algorithm in Web Worker, UI presentation |
| Phase 8 | Storage Visualiser | Medium | Database storage aggregation queries, SVG/D3 treemap rendering |
| Phase 9 | Vis Network Graph | High | Vis Network integration, hierarchical layout configuration, node/edge mapping |
| Phase 10 | Google Drive Import | High | OAuth2 workflow, Google Drive API traversal, rate-limit backoff, resumable jobs |
| Phase 11 | Offline Mode | High | Service worker setup, IndexedDB metadata store, OPFS storage, sync queue |
| Phase 12 | Complete Demo Polish | Medium | Responsive tablet/desktop layout adjustments, 17-point quality checklist audit |
| Phase 13 | Link Sharing + Groq | Medium | Tokenized URL generation, permission checks, Groq API integration |
| Phase 14 | Peer Swarm Sync | Critical | WebRTC data connection negotiation, mDNS discovery, peer replication protocol |

---

## 21. Risks and Likely Failure Points

| Risk Description | Likelihood | Impact | Mitigation Strategy |
|---|---|---|---|
| **Scope creep into optional features before Core Proof gate** | High | Critical | Enforce strict build order. Tier 1B Essential work cannot start until Core Proof Review Gate passes. Optional features deferred to Phase 11+. |
| **Provenance chain verification failure** | Medium | Critical | Implement unit test suite verifying hash chain integrity for multi-version histories prior to UI implementation. |
| **Vis Network visual inconsistency** | Medium | Medium | Configure hierarchical layout with physics disabled from initial setup. Apply custom CSS tokens to node rectangles and edges. *Contingency:* If Vis Network cannot be styled to match the Eunomia visual system after a focused prototype, evaluate a custom SVG renderer. |
| **Go PDF generator layout limitations** | Medium | Medium | Prototype PDF generation in Phase 5 with minimal data. Verify hash table alignment and fonts early. |
| **CAS streaming concurrency bugs** | Medium | High | Perform atomic file moves (`os.Rename`) from temp directory to `/blobs/sha256/xx/yy/` after SHA-256 verification. |
| **Google Drive API rate limiting** | Medium | Medium | Use exponential backoff for API requests. Implement `import_jobs` state table to allow job resume on failure. |
| **Anime.js animation performance drops** | Low | Medium | Restrict Level 3 signature animations to dedicated triggers. Ensure routine file lists render instantly without stagger animation. |
| **Browser incompatibility with OPFS** | Low | Medium | Implement feature detection for OPFS in Phase 11; fall back to IndexedDB blob storage if unavailable. |

---

## 22. Build Now vs. Build Later

### Build Now — Tier 1A (Core Proof)

- Argon2id multi-user authentication & session cookies
- Nested folder management & breadcrumb navigation
- File upload/download with SHA-256 Content-Addressed Storage
- Version history tree with deduplication
- Provenance event logging & hash chain verification
- Dedicated File Inspector (Details, Versions, Provenance tabs)
- Server-side PDF provenance report export
- Core Animation System (Login entry, inspector slide, version expansion, provenance verification playback sequence, PDF export feedback)

### Build Next — Tier 1B Essential (Complete Demo)

- Grid view & Filename search
- Plaintext / Markdown side-by-side & inline text diff
- Storage visualiser treemap & analytics
- Structural file graph using Vis Network (hierarchical mode, physics disabled)
- Google Drive OAuth import pipeline
- Home screen, Recent files, Upload queue panel
- Standard loading skeletons, empty states, and contextual errors
- Secondary signature animations (storage reveal, graph transitions, Drive import summary)

### Build Later — Tier 1B Optional (Time Permitting)

- Service Worker app shell, IndexedDB metadata cache, OPFS storage (Offline Mode)
- Full account & application Settings screen
- Comprehensive Trash management view
- Advanced tablet responsive polish & mobile views

### Defer — Tier 2 & Tier 3

- Link sharing & Groq AI file summaries (Tier 2)
- Peer Swarm Sync via LAN mDNS & WebRTC (Tier 2)
- CRDT multi-peer merging, RWX permissions, real-time collaboration (Tier 3)

---

## 23. Deliverables Per Phase

| Phase | Phase Name | Primary Deliverable | Verification Benchmark |
|---|---|---|---|
| Phase 0A | Product Definition | Complete UI/UX design spec & animation guidelines | Design spec reviewed and signed off |
| Phase 0B | Tech Foundation | Go + React 19 skeleton, OpenAPI spec, SQLite DB migrations | Dev servers run, OpenAPI types generated, DB migrates |
| Phase 1 | Auth & Folders | Auth API endpoints, App shell UI, nested folder browser | User registration, login, folder CRUD operational |
| Phase 2 | Upload & CAS | SHA-256 CAS storage engine, collision modal, file download | Files land in `/blobs/sha256/`, dedup verified, download streams |
| Phase 3 | Version History | Versioning engine, Inspector Versions tab, version restore | Re-upload creates v2, restore action successfully rolls back |
| Phase 4 | Provenance Chain | Provenance logger, verification engine, Inspector Provenance tab | Chain status displays valid integrity, tampering detected |
| Phase 5 | PDF & Core Motion | Pure Go PDF generator + Tier 1A core Anime.js animations | PDF downloads with hash chain; verification playback animates smoothly |
| **Gate 1** | **Core Proof Gate** | **Tier 1A End-to-End Core Proof Pass** | **All Gate 1 criteria verified in continuous test run** |
| Phase 6 | Core UI | Grid view, search, home, queue, recent, core UI states | All primary UI screens navigable with proper empty/loading states |
| Phase 7 | Text Diff | Web Worker diff calculator, side-by-side diff UI | Comparing text versions highlights line additions/deletions |
| Phase 8 | Storage Vis | Storage analytics backend, SVG/D3 treemap component | Storage page displays accurate CAS usage & dedup savings |
| Phase 9 | Vis Network Graph | Structural graph view via Vis Network | Graph renders folder/file nodes in hierarchical layout with physics off |
| Phase 10 | Drive Import | OAuth2 importer service, import wizard UI | Recursive Drive import populates CAS storage and folder tree |
| **Gate 2** | **Complete Demo Gate** | **Tier 1B Essential Complete Demo Pass** | **Full uninterrupted walkthrough executes successfully** |
| Phase 11 | Offline Mode | Service Worker, Dexie cache, OPFS storage, sync queue | Disconnected app loads cached metadata and queues offline actions |
| Phase 12 | Polish | Tablet responsive overlays, 17-point quality audit | UI GUIDE checklist verified across desktop and tablet layouts |
| Phase 13 | Sharing & Groq | Public share links, Groq API document summariser | Unique share link grants file access; AI summary generates |
| Phase 14 | Peer Swarm Sync | mDNS LAN discovery, WebRTC file replication protocol | Two local nodes discover each other and transfer CAS blobs |

---

## 24. Final Execution Order

```text
 1. Phase 0A  — Product and Interface Definition
 2. Phase 0B  — Technical Foundation
 3. Phase 1   — Authentication and Folder Navigation
 4. Phase 2   — Upload/Download and Content-Addressed Storage
 5. Phase 3   — Version History
 6. Phase 4   — Provenance Chain and Verification
 7. Phase 5   — PDF Export and Core Animation Integration
 8. ★ Core Proof Review Gate
 9. Phase 6   — Core UI Completion (Tier 1B Essential)
10. Phase 7   — Plaintext & Markdown Diff (Tier 1B Essential)
11. Phase 8   — Storage Visualisation (Tier 1B Essential)
12. Phase 9   — Structural Graph (Vis Network) (Tier 1B Essential)
13. Phase 10  — Google Drive Import (Tier 1B Essential)
14. ★ Complete Demo Review Gate
15. Phase 11  — Offline Mode (Tier 1B Optional)
16. Phase 12  — Complete Demo Polish (Tier 1B Optional)
17. Phase 13  — Link Sharing & Groq Summaries (Tier 2)
18. Phase 14  — Peer Swarm Sync — Primary Layer (Tier 2)
19. Phase 15+ — CRDT Merge & Advanced Features (Tier 3)
```

---

## 25. Non-Negotiable Rules

1. **Do not touch Tier 2 features until Tier 1 is fully operational end-to-end.** Do not touch Tier 3 unless Tier 2 is complete. A rock-solid Tier 1 demo beats a half-working multi-tier system.
2. **Do not begin Tier 1B Essential work until the Core Proof Review Gate passes.** Provenance verification and PDF export must work before expanding UI scope.
3. **Build a modular monolith.** Do not split the backend into microservices.
4. **Do not store binary file blobs inside SQLite.** Storage must use filesystem SHA-256 Content-Addressed Storage.
5. **Do not depend on Groq for core application functionality.** Groq is strictly an optional enhancement.
6. **Do not replicate SQLite database files across nodes.**
7. **Do not build CRDT synchronization before the local single-node storage pipeline operates reliably.**
8. **Do not build real-time multi-user document editing in the hackathon scope.**
9. **Do not compromise cryptographic provenance integrity for visual presentation.**
10. **Anime.js is the sole JavaScript animation framework.** CSS transitions handle simple state changes. No second JS animation engine is permitted.
11. **No entrance stagger animations on routine file lists.** File tables and folder browser rows render instantly in a single frame. Staggered reveals are permitted strictly during signature sequences (provenance verification, Drive import completion, storage treemap reveal).
12. **No bounce, elastic, or spring easing anywhere in the codebase.**
13. **Routine screen hashes must display immediately.** Hash character assembly animation is restricted exclusively to the interactive provenance verification playback sequence and must never obscure or delay the final readable hash.
14. **Dedicated File Inspector must feature three distinct tabs:** **Details**, **Versions**, and **Provenance**. Provenance features must never be hidden inside the Versions tab.
15. **Vis Network is the mandatory graph library.** It must operate in hierarchical mode with physics disabled.
16. **Offline mode is optional for the hackathon demo.** It belongs to Tier 1B Optional and must not block passing the Complete Demo Review Gate.
17. **Every core workflow must function end-to-end before secondary expansion begins.**
18. **Do not ship dead navigation items.** The Shared navigation item must remain hidden until Phase 13 backend implementation is complete.
19. **Execute the UI GUIDE 17-point quality control checklist at the end of every phase.** Visual fidelity is a blocking requirement.
20. **Add database tables only when their specific implementation phase begins.** Do not pre-create tables for deferred features.
