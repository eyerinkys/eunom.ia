# AGENTS.md — Eunomia (`eunom.ia`)

## 1. Project Overview
Eunomia (`eunom.ia`) is a local-first Content-Addressable Storage (CAS) file manager & cryptographic provenance visualizer UI. Built with the **Mineral Archival** design system, it features tactile rule-line layouts, dual-column drawers, interactive DAG graph visualization, storage analytics, version diffing, and simulated cryptographic verification (`VALID`, `TAMPERED`, `UNVERIFIED`).

### Core Tech Stack
- **Framework**: React 19 (`react` ^19.2.8, `react-dom` ^19.2.8) with TypeScript ~6.0.2
- **Build Tool / Bundler**: Vite 8 (`vite` ^8.2.0) in ES2023 bundler mode (`tsconfig.app.json`)
- **State Management**: Zustand 5 (`zustand` ^5.0.14) single store (`useEunomiaStore`)
- **Styling**: Vanilla CSS (`src/index.css`) with custom CSS variable tokens, Lucide icons (`lucide-react` ^1.29.0), Framer Motion (`motion` ^13.0.0), and `canvas-confetti`
- **Linting & Quality**: Oxlint (`oxlint` ^1.75.0) via `.oxlintrc.json`, `tsc -b` for strict type checks

---

## 2. Repository Structure
```
eunom.ia/
├── src/
│   ├── types/
│   │   └── eunomia.ts               # Domain interfaces (FileItem, FileVersion, FolderItem, StorageCategory, GraphNode, ProvenanceStatus)
│   ├── store/
│   │   └── useEunomiaStore.ts       # Central Zustand state store (active tab, folder nav, selection, filters, verification stepper, modals)
│   ├── data/
│   │   └── mockData.ts              # In-memory initial dataset (INITIAL_FILES, INITIAL_FOLDERS, STORAGE_CATEGORIES, INITIAL_GRAPH_NODES)
│   ├── components/
│   │   ├── Shell/                   # Top-level shell (Sidebar.tsx, TopBar.tsx, BreadcrumbBar.tsx)
│   │   ├── Views/                   # Primary tab views (HomeView, MyFilesView, StorageVisualizerView, StructuralFileGraphView)
│   │   ├── Inspector/               # Stationary drawer (InspectorPanel.tsx — file details, version history, provenance verification)
│   │   └── Modals/                  # Dialog overlays (UploadModal.tsx, DiffModal.tsx)
│   ├── index.css                    # Mineral Archival tokens (--bg-canvas, --border-rule, --accent-bronze), reset rules, and rule-line utility classes
│   ├── App.tsx                      # Layout shell grid & active view router
│   └── main.tsx                     # React application entrypoint
├── docs/                            # Specifications, design guides, UI/UX audit documentation
├── design/stitch/                   # Design assets and Stitch UI references
├── public/                          # Static SVG icons and favicon
├── .oxlintrc.json                   # Oxlint rules configuration
├── package.json                     # Project scripts and dependencies
├── tsconfig.app.json                # Application TypeScript compiler config (strict, verbatimModuleSyntax, erasableSyntaxOnly)
└── vite.config.ts                   # Vite bundler configuration
```

---

## 3. Build & Development Commands

### Dependency Management
```bash
npm install
```

### Development Server
```bash
npm run dev
# Starts local Vite dev server at http://localhost:5173
```

### Linting & Static Analysis
```bash
npm run lint
# Runs Oxlint across JS/TS source files
```

### Type Checking & Production Build
```bash
npm run build
# Runs `tsc -b && vite build` — type checks and emits production assets to dist/
```

### Production Preview
```bash
npm run preview
# Serves the local dist/ production build
```

### Running Tests
*Note*: No external test runner (e.g., Vitest) is currently installed in `package.json`.
- To execute type-check verification: `npx tsc -b`
- To run lint verification: `npx oxlint`
- If adding a single component test in Vitest (future): `npx vitest run src/store/useEunomiaStore.test.ts`

---

## 4. Code Style & Architectural Guidelines

### Design System & CSS Rules
- **CSS Variable Tokens**: Always consume custom properties defined in [`src/index.css`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/index.css) (e.g., `var(--bg-canvas)`, `var(--bg-panel)`, `var(--border-rule)`, `var(--accent-bronze)`, `var(--accent-red)`). Do not hardcode hex colors in component inline styles.
- **Mineral Rule-Line Motif**: Bounding boxes and borders must use `var(--border-rule)` (`1.5px solid #171A1F`) or utility classes (`.rule-b`, `.rule-r`, `.rule-all`, `.row-selected`).
- **Typography Tokens**: Apply `.font-serif` (`Playfair Display`), `.font-sans` (`Source Sans 3`), or `.font-mono` (`JetBrains Mono`). Use `.tabular-nums` for numeric alignment.

### State Management & Data Flow
- **Single Source of Truth**: All UI state (active tab, selection set, active file, folder ID, search query, modal visibility, filter pills) MUST reside in [`useEunomiaStore`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/store/useEunomiaStore.ts).
- **No Orphaned Local State**: Views must not duplicate file or selection state locally; derive selections from the Zustand store.

### TypeScript Conventions
- **Strict Syntax Constraints**: `verbatimModuleSyntax: true` and `erasableSyntaxOnly: true` are enforced. 
- **Type-Only Imports**: Use `import type { FileItem } from '../../types/eunomia'` when importing types.
- **Enums Prohibited**: Use TypeScript union types (`export type ProvenanceStatus = 'VALID' | 'TAMPERED' | 'UNVERIFIED';`) instead of runtime enums.

---

## 5. Operational Landmines / Guardrails

1. **`selectedFileIds` vs `activeFile` State Synchronization**
   - `selectedFileIds` is a `string[]` supporting multi-selection, whereas `activeFile` controls the object rendered inside [`InspectorPanel`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/components/Inspector/InspectorPanel.tsx).
   - Changing `currentFolderId` clears `selectedFileIds` and must be handled carefully so `activeFile` does not become stale or invalid.

2. **In-Memory Store Reset**
   - All mutations (`addUploadedFile`, `addFolder`, `triggerProvenanceVerification`) operate on in-memory Zustand state initialized from [`mockData.ts`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/data/mockData.ts). Page reloads reset state back to defaults.

3. **Verification Stepper Async Timers**
   - [`triggerProvenanceVerification`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/store/useEunomiaStore.ts#L103) executes a series of un-cancelled `setTimeout` calls (400ms, 800ms, 1200ms) to update `verificationStep`. Avoid triggers that assume immediate synchronous updates.

4. **Fixed Layout Boundaries**
   - The shell in [`App.tsx`](file:///Users/eyerinerror/Desktop/Projects/eunom.ia/src/App.tsx#L51-L71) enforces strict layout dimensions: `Sidebar` (fixed 280px width), `InspectorPanel` (fixed 360px width), center workspace (`flex: 1`, `height: 100vh`, `overflow: hidden`). Custom views added to `src/components/Views/` MUST manage internal scrolling (`overflow-y: auto`) to avoid breaking the viewport layout.

5. **`package.json` Name Identifier**
   - Project name is set to `"temp_app"`. When introducing new dependencies or scripts, ensure script references match existing `package.json` definitions.
