# Eunomia (`eunom.ia`) — Implementation Audit

**Audit Date:** August 6, 2026  
**Audited Against:** `docs/CONSOLIDATED_PROJECT_PLAN.md`, `docs/DESIGN.md`, `docs/PLAN.md`, `docs/STITCH_AUDIT.md`, `docs/UI_UX_DESIGN_AUDIT.md`, `docs/CORE_MVP_TECH_STACK.md`, `AGENTS.md`  
**Status:** Visual Source of Truth Frontend Complete (In-Memory Mock State) | Backend Infrastructure Pending  

---

## 1. Executive Audit Summary

The Eunomia repository contains a clean, highly polished React 19 + TypeScript + Vite frontend implementing the **Mineral Archival** design system. The application shell, typography system (`Playfair Display`, `Source Sans 3`, `JetBrains Mono`), 1.5px rule-line motifs, stationary 3-tab inspector panel, storage visualiser treemap, structural graph view, and drive import views are fully rendered and visually faithful to `DESIGN.md`.

However, the application is currently driven entirely by **in-memory Zustand state** initialized from static arrays in [`src/data/mockData.ts`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/data/mockData.ts). No Go backend, SQLite database, OpenAPI specification, or real Content-Addressed Storage (CAS) file ingestion exists in the repository yet.

---

## 2. Repository Structure

```
eunom.ia/
├── src/
│   ├── types/
│   │   └── eunomia.ts               # Domain types (FileItem, FileVersion, FolderItem, StorageCategory, GraphNode, ProvenanceStatus)
│   ├── store/
│   │   └── useEunomiaStore.ts       # Central Zustand state store (tab routing, folder state, selection, modals, simulated actions)
│   ├── data/
│   │   └── mockData.ts              # In-memory mock data (INITIAL_FILES, INITIAL_FOLDERS, STORAGE_CATEGORIES, INITIAL_GRAPH_NODES)
│   ├── components/
│   │   ├── Shell/
│   │   │   ├── Sidebar.tsx          # Fixed 280px left navigation drawer (tab routing, storage gauge, security status)
│   │   │   ├── TopBar.tsx           # Search input, view mode toggle, action triggers (New Folder, Drive Import, Upload)
│   │   │   └── BreadcrumbBar.tsx    # Folder breadcrumb path reconstruction & navigation
│   │   ├── Views/
│   │   │   ├── HomeView.tsx                 # System overview, continue working list, quick folder access, activity log
│   │   │   ├── MyFilesView.tsx              # Core file manager (6-column table, grid cards, category filters, multi-select)
│   │   │   ├── StorageVisualizerView.tsx    # Storage stats, 4-category treemap layout, category table
│   │   │   ├── StructuralFileGraphView.tsx  # 2D orthogonal file & folder graph layout, zoom/pan controls, node inspector
│   │   │   ├── DriveImportView.tsx          # OAuth status card, batch import trigger with simulated progress
│   │   │   └── SettingsView.tsx             # Ed25519 signing key display, OPFS cache settings, design tokens
│   │   ├── Inspector/
│   │   │   └── InspectorPanel.tsx   # Fixed 360px stationary drawer (Details, Versions, Provenance tabs, verification stepper)
│   │   └── Modals/
│   │       ├── UploadModal.tsx      # Synthetic file upload form modal
│   │       └── DiffModal.tsx        # Version text diff modal
│   ├── index.css                    # Mineral Archival tokens (--bg-canvas, --border-rule, --accent-bronze), resets, rule utilities
│   ├── App.css                      # Legacy template styles (partially uncleaned)
│   ├── App.tsx                      # Main grid shell layout & tab view router
│   └── main.tsx                     # React 19 root entrypoint
├── docs/
│   ├── CONSOLIDATED_PROJECT_PLAN.md # Master project plan (Tiers, Phases, Architecture, Gates)
│   ├── DESIGN.md                    # Visual design specification & design system guide
│   ├── PLAN.md                      # Original innovation & research thesis
│   ├── STITCH_AUDIT.md              # Stitch visual audit & feature mapping
│   ├── UI_UX_DESIGN_AUDIT.md        # Technical UX audit & anti-pattern checklist
│   └── CORE_MVP_TECH_STACK.md       # Target MVP tech stack specification
├── assets/                          # Reference screenshots (home, my-files-provenance, storage-visualiser, structural-file-graph)
├── design/stitch/                   # HTML reference screens & design-system.json
├── public/                          # Static icons (favicon.svg, icons.svg)
├── AGENTS.md                        # AI pair programming guidelines & guardrails
├── SESSION_NOTES.md                 # Project activity log
├── README.md                        # Vite template documentation
├── .oxlintrc.json                   # Oxlint configuration
├── package.json                     # Node.js dependencies & runtime scripts
├── tsconfig.app.json                # Bundler TypeScript configuration
├── tsconfig.json                    # Root TypeScript references
└── vite.config.ts                   # Vite bundler configuration
```

---

## 3. Frontend Framework & Dependency Audit

### Installed Dependencies (`package.json`)
- **React**: `^19.2.8` & `react-dom` `^19.2.8` — Latest React release.
- **State Management**: `zustand` `^5.0.14` — Single global store [`useEunomiaStore`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/store/useEunomiaStore.ts).
- **Icons**: `lucide-react` `^1.29.0` — Icon set used across shell and views.
- **Animation**: `motion` `^13.0.0` — Installed (Framer Motion).
- **Effects**: `canvas-confetti` `^1.9.4` — Installed.
- **Utilities**: `clsx` `^2.1.1` — Class name concatenation.

### Dev Dependencies & Quality Tools
- **Build Tool**: `vite` `^8.2.0` with `@vitejs/plugin-react` `^6.0.4`.
- **TypeScript**: `~6.0.2` with `verbatimModuleSyntax: true` and `erasableSyntaxOnly: true`.
- **Linter**: `oxlint` `^1.75.0` via `.oxlintrc.json` (`npm run lint` passes clean with 0 warnings/errors).

---

## 4. Routing, Navigation & Screen Status

| Route / Screen | Current Implementation | Status | Notes / Gaps |
|---|---|---|---|
| `/` (Home) | [`HomeView.tsx`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/components/Views/HomeView.tsx) | **Frontend-only state** | Switched via `activeTab === 'home'`. Metrics use static strings + array lengths. |
| `/files` (My Files) | [`MyFilesView.tsx`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/components/Views/MyFilesView.tsx) | **Frontend-only state** | Switched via `activeTab === 'files'`. Supports folder drilldown, filters, selection. |
| `/files/$folderId` | Simulated in [`MyFilesView.tsx`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/components/Views/MyFilesView.tsx) | **Frontend-only state** | `currentFolderId` state in Zustand. No real browser URL routing (TanStack Router not used). |
| `/storage` (Storage Visualiser) | [`StorageVisualizerView.tsx`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/components/Views/StorageVisualizerView.tsx) | **Frontend-only state** | Static metric strip + CSS grid treemap + table mapping over `STORAGE_CATEGORIES`. |
| `/graph` (Structural Graph) | [`StructuralFileGraphView.tsx`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/components/Views/StructuralFileGraphView.tsx) | **Frontend-only state** | 2D SVG connector lines + absolute div nodes. Vis Network is NOT installed. |
| `/import` (Google Drive Import) | [`DriveImportView.tsx`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/components/Views/DriveImportView.tsx) | **Partially Functional** | Simulates 1.5s timer then injects fake PDF file into Zustand store. |
| `/trash` (Trash / Retention) | Inline in [`App.tsx`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/App.tsx#L36) | **Placeholder** | Renders static text message: *"No deleted blobs currently pending garbage collection."* |
| `/settings` (Settings) | [`SettingsView.tsx`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/components/Views/SettingsView.tsx) | **Frontend-only state** | Renders static cards for keys, OPFS, and theme tokens. |
| Dedicated Inspector | [`InspectorPanel.tsx`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/components/Inspector/InspectorPanel.tsx) | **Frontend-only state** | Fixed 360px drawer with working Details, Versions, Provenance tabs. |

---

## 5. In-Memory Mock Data & Fake Forms Audit

All runtime data originates in [`src/data/mockData.ts`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/data/mockData.ts):
- `INITIAL_FOLDERS` (4 folders: `ROOT`, `PHYSICS_RESEARCH`, `CHEMISTRY_LABS`, `HISTORICAL_ARCHIVES`)
- `INITIAL_FILES` (7 files with mock SHA-256 hashes, provenance statuses, and version sub-arrays)
- `STORAGE_CATEGORIES` (4 static categories with hardcoded sizes and percentages)
- `INITIAL_ACTIVITIES` (4 system log items)
- `INITIAL_GRAPH_NODES` (8 static 2D graph nodes with fixed `x, y` positions)

### Fake Forms & Dialog Alerts
1. **New Folder**: `prompt('Enter new folder name:')` in `TopBar.tsx` (adds in-memory folder).
2. **File Upload**: `UploadModal.tsx` form generates pseudo-random SHA-256 string and appends to Zustand `files` array.
3. **Drive Import**: `DriveImportView.tsx` button runs `setTimeout` to push `Google_Drive_Lecture_Notes_2026.pdf` to Zustand `files`.
4. **Download Selected**: `alert('Downloading N file blobs as TAR.GZ archive...')` in `MyFilesView.tsx`.
5. **Refresh Analytics**: `alert('Refreshing CAS storage block indices...')` in `StorageVisualizerView.tsx`.
6. **Export Provenance PDF**: `alert('Generating & Exporting Cryptographic Provenance PDF...')` in `InspectorPanel.tsx`.
7. **Restore Version**: `alert('Restoring vN as current active version!')` in `InspectorPanel.tsx`.
8. **Upload Version**: `alert('Create new version for...')` in `InspectorPanel.tsx`.

---

## 6. Backend, API & Database Status

- **Backend Files**: `0` (No Go source code, Chi router, or binary entrypoints exist).
- **API Calls**: `0` (No `fetch` calls, REST endpoints, or OpenAPI specs exist).
- **Database Status**: `None` (No SQLite database, Goose migrations, or sqlc queries exist).
- **CAS Storage Engine**: `None` (No physical `/data/blobs/sha256/` directory or blob management exists).

---

## 7. Interactive Element Classification Matrix

| Component | Interactive Element | Current Action | Classification |
|---|---|---|---|
| `Sidebar.tsx` | Main Nav Buttons (`Home`, `My Files`, `Storage`, `Graph`) | `setActiveTab(tab)` | **Frontend-only state** |
| `Sidebar.tsx` | Storage Gauge Widget | Displays static 345.9 MB / 1.0 GB | **Placeholder** |
| `Sidebar.tsx` | SECURE Badge | Hover tooltip | **Placeholder** |
| `TopBar.tsx` | Search Input Field | Updates `searchQuery`, filters `currentFiles` in `MyFilesView` | **Frontend-only state** |
| `TopBar.tsx` | List / Grid View Toggles | `setDisplayMode('table' | 'grid')` | **Frontend-only state** |
| `TopBar.tsx` | New Folder Button | Opens `prompt()`, calls `createFolder(name)` | **Functional** |
| `TopBar.tsx` | Upload File Button | `setUploadModalOpen(true)` | **Frontend-only state** |
| `BreadcrumbBar.tsx` | Folder Path Links | `setCurrentFolderId(crumb.id)` | **Frontend-only state** |
| `HomeView.tsx` | Metric Summary Cards | Displays hardcoded & calculated values | **Placeholder** |
| `HomeView.tsx` | "Browse All Files" Link | `setActiveTab('files')` | **Frontend-only state** |
| `HomeView.tsx` | "Continue Working" Row Click | `selectFile(file)`, `setActiveTab('files')` | **Frontend-only state** |
| `HomeView.tsx` | Primary Archival Folder Cards | `setCurrentFolderId(id)`, `setActiveTab('files')` | **Frontend-only state** |
| `HomeView.tsx` | Quick Ingest Drop Zone | `setUploadModalOpen(true)` | **Frontend-only state** |
| `MyFilesView.tsx` | Category Filter Pills (`ALL`, `MARKDOWN`, etc.) | `setSelectedCategoryFilter(cat)` | **Frontend-only state** |
| `MyFilesView.tsx` | "Download Selected" Button | Triggers browser `alert()` | **Placeholder** |
| `MyFilesView.tsx` | "Clear Selection" Button | `clearSelection()` | **Frontend-only state** |
| `MyFilesView.tsx` | Directory Row Cards | `setCurrentFolderId(id)` | **Frontend-only state** |
| `MyFilesView.tsx` | Table Select-All Checkbox | Selects/clears all visible files in folder | **Frontend-only state** |
| `MyFilesView.tsx` | File Row Checkbox & Row Click | `toggleFileSelection()`, `selectFile()` | **Frontend-only state** |
| `MyFilesView.tsx` | Grid Card Click | `selectFile()` | **Frontend-only state** |
| `StorageVisualizerView.tsx` | "Refresh Analytics" Button | Triggers browser `alert()` | **Placeholder** |
| `StorageVisualizerView.tsx` | Treemap Blocks | Visual CSS grid layout | **Placeholder** |
| `StructuralFileGraphView.tsx` | Zoom In / Zoom Out / Reset Buttons | Adjusts `zoomLevel` CSS scale transform | **Frontend-only state** |
| `StructuralFileGraphView.tsx` | Node Click | `setSelectedNode(node)`, selects file | **Frontend-only state** |
| `StructuralFileGraphView.tsx` | "Inspect in File View" Button | `setActiveTab('files')` | **Frontend-only state** |
| `DriveImportView.tsx` | "START BATCH IMPORT NOW" Button | 1.5s timer, appends synthetic file to store | **Partially functional** / **Requires backend** |
| `InspectorPanel.tsx` | Tab Switcher (`DETAILS`, `VERSIONS`, `PROVENANCE`) | `setInspectorTab(tab)` | **Frontend-only state** |
| `InspectorPanel.tsx` | Copy SHA-256 Hash Button | `navigator.clipboard.writeText()` | **Partially functional** |
| `InspectorPanel.tsx` | "+ Upload Version" Button | Triggers browser `alert()` | **Placeholder** |
| `InspectorPanel.tsx` | "Compare Diff" Button | `setDiffModalOpen(true, diffData)` | **Frontend-only state** |
| `InspectorPanel.tsx` | "Restore" Version Button | Triggers browser `alert()` | **Placeholder** |
| `InspectorPanel.tsx` | "VERIFY PROVENANCE NOW" Button | Runs 4-step timer stepper (1.2s total) | **Partially functional** |
| `InspectorPanel.tsx` | "Export Provenance PDF" Button | Triggers browser `alert()` | **Placeholder** / **Requires backend** |
| `UploadModal.tsx` | Upload Form Submit | Appends synthetic `FileItem` to Zustand store | **Partially functional** / **Requires backend** |
| `DiffModal.tsx` | Side-by-Side Diff View | Renders snippet strings passed from store | **Frontend-only state** |

---

## 8. Architectural Conflicts & Plan Deviations

1. **Graph Engine Conflict**:
   - *Plan Requirement*: `CONSOLIDATED_PROJECT_PLAN.md` §12 mandates **Vis Network** operating in hierarchical mode (`direction: 'UD'`) with physics disabled (`physics: { enabled: false }`).
   - *Current Code*: `StructuralFileGraphView.tsx` uses custom static SVG lines and absolute positioning divs (`x: 400, y: 50`). `vis-network` is not installed.

2. **Upload Collision Handling Missing**:
   - *Plan Requirement*: `CONSOLIDATED_PROJECT_PLAN.md` §14 mandates an explicit inline collision modal prompt when uploading a duplicate filename: *"Replace existing file (create vN)"*, *"Keep both (auto-rename)"*, or *"Cancel"*.
   - *Current Code*: `addUploadedFile` in `useEunomiaStore.ts` prepends new files blindly without collision checking or modal prompts.

3. **Routing Architecture Conflict**:
   - *Plan Requirement*: `CONSOLIDATED_PROJECT_PLAN.md` §3 specifies **TanStack Router** for typed URL routes (`/files/$folderId`, `/storage`, `/graph`).
   - *Current Code*: `App.tsx` uses a simple `switch(activeTab)` state router inside Zustand without URL location sync.

4. **Missing Anime.js Integration**:
   - *Plan Requirement*: `CONSOLIDATED_PROJECT_PLAN.md` §6 mandates **Anime.js** as the sole JavaScript animation engine for Level 3 signature sequences (provenance playback, treemap reveal, app entry).
   - *Current Code*: Provenance verification uses un-cancelled `setTimeout` calls (400ms, 800ms, 1200ms). Anime.js is not installed (`package.json` contains `motion` instead).

---

## 9. Genuine vs. Apparent Functionality

### Genuinely Working Features
- **UI Shell & Layout**: Fixed 280px sidebar, fluid center workspace, fixed 360px stationary inspector drawer, top bar search, and breadcrumb path bar.
- **Mineral Archival Styling**: Pure CSS variable tokens, 1.5px rule-line motifs, selection indicators (`.row-selected`), and typography scales.
- **Client-Side Folder Navigation**: Clicking breadcrumbs or folder rows correctly updates `currentFolderId` and filters items.
- **File Inspector Tab Switching**: Instant tab switching between `DETAILS`, `VERSIONS`, and `PROVENANCE`.
- **List / Grid View Toggle**: Smooth switching between 6-column table view and grid card view.
- **Category Filter Pills**: Client-side filtering of file lists by file type (`MARKDOWN`, `PDF`, `CODE`, `ARCHIVE`).
- **Multi-Selection State**: Multi-select checkboxes and aggregate selection action bar.

### Features That Only Appear to Work (Mock / Simulated)
- **File Ingestion / CAS**: `UploadModal` creates synthetic in-memory file records with pseudo-random hash strings instead of computing SHA-256 hashes of real file chunks.
- **Provenance Verification**: Clicking "VERIFY PROVENANCE NOW" runs a `setTimeout` stepper timer without performing cryptographic hash-chain validation against backend block logs.
- **Google Drive Import**: Clicking "START BATCH IMPORT NOW" runs a 1.5s timer and appends a single fake PDF file to memory.
- **Version Restoration & Diffing**: Restoring a version pops a browser `alert()`. Diffing displays hardcoded snippet strings instead of computing text diffs via Web Workers.
- **PDF Report Export**: "Export Provenance PDF" pops a browser `alert()` instead of requesting a server-generated Go PDF payload.
- **Storage Analytics & Treemap**: Storage sizes and treemap block proportions are hardcoded static numbers.
