# Eunomia — Frontend UI/UX Design Specification & Visual Language Guide

**Version:** 1.0  
**Date:** August 6, 2026  
**Status:** Approved Design Specification  
**Design Thesis:** *A familiar file manager governed by visual order.*

---

## 1. Executive Summary & Core Visual Thesis

### 1.1 The Ordered Archive
Eunomia is a self-hosted, content-addressed web file-management system designed to protect students from cloud storage lockouts and institutional account terminations. 

The visual identity is derived from **The Ordered Archive** — evoking a modern civic scriptorium or institutional records vault. It rejects both the sterile coldness of enterprise SaaS and the dark-mode neon tropes of consumer software. Instead, it balances technical precision with editorial warmth:
- Structural integrity expressed through **Rule Lines** rather than heavy drop shadows.
- Information density calibrated for desktop productivity.
- Tonal layering on warm paper and stone substrates.
- Three-axial typographic hierarchy distinguishing editorial branding, functional UI, and technical metadata.

### 1.2 Signature Visual Device: The Rule Line
The primary visual motif across the application is **The Rule Line** — a 1.5px solid structural border (`#171A1F` / `#191C21`) used to partition space, demarcate selection states, connect breadcrumb paths, and trace provenance timelines.

- **Selection Indicator:** A 3px solid Burnished Bronze rule on the left edge of a file row combined with a subtle background tint (`#E6E2D8`).
- **Tab Selection:** A crisp bottom rule accent in Burnished Bronze, eliminating floating capsule pills.
- **Structural Partitioning:** Strict 1.5px grid dividers between panels, headers, and inspector drawers.

---

## 2. Colour Palette & Surface Hierarchy

The palette preserves the **Mineral Archival** color strategy, using high-contrast, medium-luminance natural tones to reduce visual fatigue during extended research sessions.

### 2.1 Surface Elevation Levels (Tonal Layering)
- **Level 0 (Base Canvas):** Archive Ivory (`#F8F9FF` / `#F7F5F0`) — Primary paper-like substrate for workspace and file lists.
- **Level 1 (Panels & Toolbars):** Soft Sandstone (`#E1E2E9` / `#E6E2D8`) — Container background for drawers, headers, and inspector sub-panels.
- **Level 2 (Global Shell & Navigation):** Deep Ink (`#191C21` / `#171A1F`) — Reversed-out contrast background for global sidebar navigation.
- **Level 3 (Floating Overlays / Modals):** Pure White (`#FFFFFF`) with 1.5px Deep Ink border — Used for collision dialogs and context menus. Never uses drop shadows or blurred glassmorphism.

### 2.2 Semantic Color Scale

| Role | Name | Hex Code | Purpose |
|---|---|---|---|
| Primary Brand | Deep Sage Slate / Primary Ink | `#28332F` / `#191C21` | Sidebar, primary text, high-density rules |
| Primary Accent | Burnished Bronze | `#82510E` / `#A66F2C` | Active navigation indicator, primary buttons, focus state |
| Secondary Accent | Oxidised Copper | `#32675C` / `#5C7A70` | Secondary indicators, treemap categories, verified state |
| Tertiary Accent | Muted Plum | `#6F536A` / `#8C7389` | Categorical distinction in treemap and graph nodes |
| Success / Verified | Muted Olive | `#556B2F` / `#5B634B` | Valid cryptographic provenance badges, completed uploads |
| Warning / Tamper | Clay Red | `#BA1A1A` / `#9E3B3B` | Cryptographic hash mismatch, destructive actions, errors |
| Structural Divider | Warm Stone / Ink Rule | `#D5C3B3` / `#171A1F` | 1.5px rule line borders and column dividers |

---

## 3. Typography & Spacing System

### 3.1 Three-Axial Typographic Hierarchy
1. **Editorial Serif (`Playfair Display`):** Reserved exclusively for wordmarks, page titles (`Home`, `My Files`, `Storage Visualiser`), and high-level section branding. Never used for file names or data tables.
2. **Contemporary Sans (`Source Sans 3` / `Hanken Grotesk`):** Primary functional interface font for navigation links, filenames, table headers, form inputs, and modal copy.
3. **Technical Monospace (`JetBrains Mono`):** Dedicated to technical metadata, SHA-256 hashes, file sizes, timestamps, version IDs, and breadcrumb path segments.

### 3.2 Fixed Type Scale

| Style Token | Font Family | Size / Line Height | Weight | Usage |
|---|---|---|---|---|
| `display-lg` | Playfair Display | 48px / 56px (-0.02em) | 700 | Wordmarks, primary page titles |
| `headline-md` | Playfair Display | 24px / 32px | 600 | Modal titles, drawer section headers |
| `headline-sm` | Playfair Display | 20px / 28px | 600 | Card titles, panel section headings |
| `body-lg` | Source Sans 3 | 18px / 28px | 400 | Editorial descriptions, empty state copy |
| `body-md` | Source Sans 3 | 16px / 24px | 400 | Primary file list names, form labels |
| `body-sm` | Source Sans 3 | 14px / 20px | 400 | Secondary list copy, helper text |
| `label-lg` | JetBrains Mono | 14px / 20px (0.05em) | 500 | Navigation links, action buttons |
| `label-md` | JetBrains Mono | 12px / 16px (0.05em) | 500 | Table column headers, breadcrumb path |
| `label-sm` | JetBrains Mono | 10px / 14px (0.05em) | 500 | Checksums, SHA-256 hashes, sizes |

*Note: All numerical metadata (file sizes, dates, hashes) must enforce `font-variant-numeric: tabular-nums` to maintain strict vertical column alignment.*

### 3.3 Grid & Spacing Scale
- **Base Grid Unit:** 4px baseline grid.
- **Micro Spacing:** 4px (`xs`), 8px (`sm`) for compact stack elements.
- **Component Padding:** 12px (`panel-padding`) for dense table cells and inspector rows.
- **Page Margin:** 24px (`md`) to 40px (`lg`) for desktop workspace canvas.
- **Sidebar Width:** Fixed 280px width (does not collapse on desktop).
- **Inspector Width:** Fixed 360px width stationary drawer (does not cause table column reflow).

---

## 4. Application Shell & Structure

The desktop layout follows a **Fixed-Fluid-Fixed Hybrid** model:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Top Bar: Brand Logo │ Global Search Input                        │ Actions: Upload     │
├─────────────────────┼────────────────────────────────────────────┼─────────────────────┤
│                     │ Breadcrumb Trail / Location Header         │                     │
│ Sidebar Navigation  ├────────────────────────────────────────────┤ File Inspector      │
│ (Fixed 280px)       │                                            │ (Fixed 360px)       │
│                     │ Central Archive Workspace                  │                     │
│                     │ (Fluid Table / Grid View)                  │ Details / Versions  │
│                     │                                            │ / Provenance Tabs   │
│                     │                                            │                     │
├─────────────────────┴────────────────────────────────────────────┴─────────────────────┤
│ Bottom Activity Bar: Upload Queue / Reconnect Sync Status                             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Global Sidebar Navigation
- **Background:** Deep Ink (`#191C21`). Text: Archive Ivory (`#F8F9FF`).
- **Brand Header:** Wordmark *Eunomia* in Playfair Display (24px) + Subtitle *Archival System* in JetBrains Mono uppercase (10px).
- **Navigation Groups:** Partitioned into two distinct semantic blocks by a 1.5px horizontal rule:
  - **Locations Block:** `Home`, `My Files`, `Recent`, `Storage`, `Graph`, `Drive Import`, `Trash`.
  - **System Block:** `Settings`.
- **Active Navigation Item:** Highlighted by a 1.5px left border in Burnished Bronze (`#82510E`) with Soft Sandstone background tint.

### 4.2 Top Bar & Global Search
- **Height:** 64px (`xl`), separated from workspace by a 1.5px bottom rule in Deep Ink.
- **Search Field:** Rectangular input box (width 280px) with Sandstone background (`#E1E2E9`) and a bottom-only 1.5px border in Deep Ink. When focused, the bottom border changes to 2px Burnished Bronze.
- **Upload Action:** Rectangular button in Burnished Bronze fill with Archive Ivory text (`UPLOAD FILE`). No rounded pill caps.

### 4.3 Breadcrumb Bar
- Expressed in JetBrains Mono (12px, uppercase) with slash (`/`) or right chevron (`>`) separators:
  `ROOT / SCHOOL / RESEARCH_2024 / PHYSICS`
- Clicking any segment navigates directly to that folder level.

---

## 5. Main File Workspace Components

### 5.1 File Rows (Default List View)
The primary file browsing interface is a high-density 6-column table:

```
┌───┬────────────────────────────────┬─────────────────┬──────────┬─────────────┬──────────┐
│ □ │ Name                           │ Type            │ Owner    │ Modified    │ Size     │
├───┼────────────────────────────────┼─────────────────┼──────────┼─────────────┼──────────┤
│ □ │ 📁 Mathematics                 │ Directory       │ You      │ Oct 15, 2023│ --       │
│ █ │ 📄 Physics Research Paper.md   │ Markdown        │ You      │ Today, 09:41│ 14 KB    │
│ □ │ 📑 Chemistry Lab Report.pdf    │ PDF Document    │ You      │ Nov 02, 2023│ 4.1 MB   │
└───┴────────────────────────────────┴─────────────────┴──────────┴─────────────┴──────────┘
```

- **Row Density:** Compact 36px default height (40px standard), with 12px horizontal padding.
- **Hover State:** Background shifts to 50% opacity Sandstone (`#E1E2E9`), revealing subtle inline actions on hover without shifting text columns.
- **Selected State:** Solid 3px left margin rule in Burnished Bronze (`#82510E`) + full row fill in Soft Sandstone (`#E6E2D8`).
- **Multi-Select State:** Checked checkboxes with a dark ink border, displaying an aggregate selection bar at the top of the table (*"3 items selected: Move, Download, Delete"*).

### 5.2 File Cards (Grid View)
- **Geometry:** Rectangular 4px radius cards with a 1.5px solid border in Deep Ink.
- **Aspect Ratio:** Standard 4:3 preview area on top + compact metadata footer on bottom.
- **Preview Area:** Real thumbnail preview for images/PDFs; monochromatic document icon + extension badge for text files.
- **Hover & Select:** No levitation or drop shadow. Selection replaces top border with a 3px Burnished Bronze bar.

---

## 6. Dedicated File Inspector

The File Inspector is a persistent 360px stationary side panel divided into three tabs:

```
┌─────────────────────────────────────────┐
│ Physics Research Paper.md            ✕  │
├──────────────┬──────────────┬───────────┤
│ DETAILS      │ VERSIONS     │ PROVENANCE│
├──────────────┴──────────────┴───────────┤
│                                         │
│ [ Tab Content Area ]                    │
│                                         │
└─────────────────────────────────────────┘
```

### 6.1 Details Tab
- **Preview Thumbnail:** Compact file preview box.
- **Metadata Fields:** Filename, MIME Type, Storage Path, Created Date, Last Modified, File Size, Owner, Content Hash (SHA-256 in 10px JetBrains Mono with copy trigger).
- **Actions:** Download, Rename, Move, Delete.

### 6.2 Versions Tab
- **Version Timeline:** Vertical chronological listing of versions (`v1`, `v2`, `v3`).
- **Version Row Content:** Version tag, creation timestamp, size delta (+2.4 KB), version notes text box, parent version link.
- **Actions:** "Restore Version", "Download Version", "Compare Text Diff" (opens diff modal), "Upload New Version" button.

### 6.3 Provenance Tab (Headline Feature)
- **Chain Status Badge:** Solid Muted Olive badge (`VALID / INTACT`) or Clay Red badge (`TAMPER DETECTED`).
- **Interactive Verification Trigger:** "VERIFY PROVENANCE" button (triggers Level 3 Anime.js playback sequence).
- **Vertical Chain of Custody Axis:** 1.5px vertical bronze rule line connecting event nodes:
  - **Node 1 (Creation):** SHA-256 blob hash, creation timestamp, author ID.
  - **Node 2 (Revision v2):** Parent hash link, edit timestamp, commit note.
  - **Node 3 (Cryptographic Seal):** System verification timestamp, validation signature chip (`SIG_VAL_OK`).
- **Primary Export Action:** **"Export Provenance PDF"** button in footer (triggers Go backend PDF generation).

---

## 7. Secondary Feature Screens

### 7.1 Home Layout
- **Header:** Title *Home* + Subtitle *Overview of archival systems and active processes.*
- **Continue Working:** Restrained horizontal strip showing recently opened files with 1-click reopen.
- **Recent Activity:** Vertical chronological feed showing legitimate system events (Drive imports completed, new versions created, provenance verified).
- **Storage Overview:** Simple progress bar breaking down disk usage into `Documents`, `Media Assets`, `Code & Text`, and `Deduplication Savings`.

### 7.2 Storage Visualiser Styling
- **Metric Strip:** High-contrast statistics callouts: `Total Logical Size`, `Physical CAS Storage`, `Deduplication Savings %`.
- **Treemap Layout:** D3/SVG hierarchical treemap rendered with solid 1.5px rule line borders between blocks.
- **Treemap Categories:** Color-coded by natural mineral tokens (Warm Bronze, Oxidised Copper, Muted Olive, Muted Plum, Soft Sandstone).

### 7.3 Structural File Graph Styling
- **Vis Network Engine:** Configured in **Hierarchical Mode** (`direction: 'UD'`, `sortMethod: 'directed'`), **physics strictly disabled**.
- **Node Styling:** Rectangular nodes with 1.5px Deep Ink borders and mineral color fills. Folder nodes = Sandstone fill; File nodes = Ivory/Plum fill; Broken provenance nodes = Clay Red border + warning dot.
- **Edge Styling:** Clean 1.5px orthogonal (right-angled) rule line connectors in Deep Ink (`#191C21`).

---

## 8. State Variations & Interactions

### 8.1 Dialogs & Modals (Upload Collision Prompt)
When an uploaded file collides with an existing filename in a folder, present an explicit modal prompt:
- **Title:** `Filename Collision Detected`
- **Body:** *"A file named 'Research_Notes.md' already exists in this folder."*
- **Options:** 
  1. `Replace Existing File (Create vN)` — Primary Bronze action.
  2. `Keep Both (Auto-Rename)` — Secondary Sandstone action.
  3. `Cancel` — Plain text action.

### 8.2 Empty & Loading States
- **Empty Folders:** Centered architectural line drawing + text *"No files in this folder. Upload a file or create a folder to begin."*
- **Loading Skeletons:** Static 1.5px rule line placeholders matching exact table row dimensions. No glowing shimmer or pulsing gradients.

### 8.3 Status & Error Alerts
- **Offline Sync Pending:** Dotted rule line indicator badge next to file rows modified offline.
- **Tamper Alert:** Clay Red inline callout in Inspector Provenance tab explaining hash mismatch.

---

## 9. Animation Opportunities (Anime.js & CSS Transitions)

### 9.1 Motion Principles
- Motion must express **elements finding their correct place**, hierarchy resolving, and cryptographic verification.
- **Level 1 (Routine - CSS Transitions):** Row hover opacity, button focus rings, menu open/close (100–200ms). Instant table row rendering.
- **Level 2 (Structural - Anime.js Timelines):** Inspector panel slide open/close, version timeline expansion, graph node collapse/expand (200–400ms).
- **Level 3 (Signature - Anime.js Choreography):**
  1. **App Entry & Logo Assembly:** Geometric assembly of the E logo and three rule lines on login.
  2. **Provenance Verification Playback:** Sequential timeline axis tracing, SVG path drawing, and hash validation seal reveal (600–1200ms).
  3. **Storage Treemap Reveal:** Staggered geometric block expansion on Storage page load.
  4. **PDF Export Completion:** Progress ring to checkmark transformation.

### 9.2 Motion Anti-Patterns (Banned)
- Bounce easing, elastic motion, spring physics.
- Entrance stagger animations on standard file browsing or repeated folder views.
- SHA-256 character assembly during routine file browsing (hashes display instantly; assembly allowed strictly during signature verification sequence).

---

## 10. Explicit Visual Anti-Patterns (Banned UI Triggers)

The final implementation must strictly avoid all of the following AI-generated UI anti-patterns:

- ❌ **No Generic AI Dashboards:** No "Welcome back" hero banners, no fake productivity scores, no random activity charts, no prompt-style search bars, no "Ask AI" buttons.
- ❌ **No Generic Visual Effects:** No purple gradients, no neon glows, no glassmorphism / frosted glass, no floating card levitation, no 16px–24px oversized rounded card tiles, no pill-shaped buttons.
- ❌ **No Mythology Costumes:** No marble textures, no parchment backgrounds, no Greek temple illustrations, no goddess statues, no laurel wreaths, no mythological navigation names (e.g. *Agora*, *Treasury*).
- ❌ **No Fake Enterprise Metrics:** No 70-terabyte disk capacity claims for local student apps, no "Archive Node C Rebuilding" cluster status boxes, no multi-user access request approval feeds in Tier 1.

---

## 11. Complete Screen Inventory

| Screen # | Screen Title | Primary Route | Purpose & Key Components |
|---|---|---|---|
| 1 | **Login** | `/login` | Simple brand seal, product wordmark, Argon2id credentials form. |
| 2 | **Home** | `/` | Continue working strip, recent activity feed, storage summary bar. |
| 3 | **My Files** | `/files` | Core file browser, 6-column list view, breadcrumb bar, top bar upload trigger. |
| 4 | **Folder View** | `/files/$folderId` | Nested folder view, path navigation, folder creation modal, empty state. |
| 5 | **Search Results** | `/search` | Dedicated search view, query string, file location breadcrumbs, filters. |
| 6 | **Shared** | `/shared` | Reserved route for Tier 2 link sharing (disabled placeholder in Tier 1). |
| 7 | **Recent** | `/recent` | Chronological file access list grouped by `Today`, `Yesterday`, `This Week`. |
| 8 | **Storage Visualiser** | `/storage` | Storage metrics strip, D3/SVG treemap by category, dedup savings. |
| 9 | **Structural File Graph** | `/graph` | Vis Network 2D hierarchical graph view, physics off, node inspector drawer. |
| 10 | **Google Drive Import** | `/import` | OAuth consent trigger, folder picker, resumable import queue progress bar. |
| 11 | **Trash** | `/trash` | Deleted items list, deletion timestamp, restore action, permanent purge trigger. |
| 12 | **Settings** | `/settings` | Account management, density toggle (Compact 32px / Standard 40px), storage quotas. |
| 13 | **File Inspector** | Side Drawer | 3-tab drawer (`Details`, `Versions`, `Provenance`), PDF export button. |
| 14 | **Upload Queue** | Bottom Drawer | Active upload progress bar, chunk status, retry/pause controls, collision modal. |

---

## 12. Implementation Guidance

### 12.1 Reproduce Closely from Stitch References
- **Mineral Palette & Contrast:** The warm ivory base (`#F8F6F0`), sandstone panel fills (`#E6E2D8`), deep ink navigation (`#171A1F`), and burnished bronze accents (`#A66F2C`).
- **Signature 1.5px Rule Line Motif:** Structural 1.5px borders dividing all major workspace panels and cards.
- **Vertical Timeline Axis:** The line-based chain of custody presentation in the Inspector Provenance tab.
- **Orthogonal Structural Graph Layout:** 2D right-angled connector lines in the structural graph view.
- **Deduplication Metrics Strip:** The storage percentage callout (`Deduplication Savings: 74.5%`) on the Storage page.

### 12.2 Banned Stitch Elements (Do Not Implement)
- **Do NOT implement** the "AI Analysis" tile or `auto_awesome` action buttons.
- **Do NOT implement** the "Access Requested by Dr. Aris Thorne" approval feed item on Home.
- **Do NOT implement** the "System Status: Archive Node C Rebuilding" cluster box.
- **Do NOT implement** neon glow shadows (`shadow-[0_0_15px...]`) around valid provenance nodes.
- **Do NOT implement** the 2-tab Inspector layout (must expand to 3 tabs: Details, Versions, Provenance).
- **Do NOT implement** `Starred` or `Support` navigation items.

### 12.3 Component Translation & Scope Overrides
- **Top Bar Search:** Translate Stitch's rounded search box into a clean rectangular input with a bottom-only 1.5px rule line.
- **Table Density:** Translate Stitch's 3-column table into Eunomia's 6-column high-density table (`Checkbox`, `Name`, `Type`, `Owner`, `Modified`, `Size`).
- **File Inspector:** Map Stitch's "Export Audit Log" button to Eunomia's **"Export Provenance PDF"** server-side PDF generator (`CONSOLIDATED_PROJECT_PLAN.md` §13).
- **Vis Network Graph:** Configure Vis Network with `physics: { enabled: false }` and `hierarchical: { direction: 'UD' }` to reproduce Stitch's crisp 2D visual structure without floating canvas physics.
- **Storage Categories:** Map Stitch's generic categories to real SHA-256 CAS storage data (Logical Size vs Physical CAS Size vs Deduplication Savings).
