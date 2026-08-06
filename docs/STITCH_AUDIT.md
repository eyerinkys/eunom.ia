# Eunomia — Stitch Visual Reference Audit

**Target Directory:** `design/stitch/`  
**Audit Date:** August 6, 2026  
**Primary Source of Truth:** `docs/CONSOLIDATED_PROJECT_PLAN.md` (Product Scope, Workflows, Routes, Features)  
**Secondary Source of Truth:** `EUNOMIA_UI_DESIGN_GUIDE_FOR_ANTIGRAVITY.md` & `docs/UI_UX_DESIGN_AUDIT.md` (Design Principles, Layout Rules, Anti-Patterns)  
**Visual Reference:** Stitch Screens (Project ID: `7032727545275549996`)

---

## Executive Summary & Source-of-Truth Hierarchy

This visual audit evaluates five primary Stitch references against confirmed Eunomia product specifications:

1. `my-files-provenance` (`a1bcd0e1002541808178f583c8b7f8e0`)
2. `design-system` (`asset-stub-assets_52ed0d2072c24b6bbcf22bca562e15e5` / `Mineral Archival`)
3. `home` (`4c466120d4c44fb5aba7e8dc18e040ef`)
4. `structural-file-graph` (`cd14f488b0fd49a897485dfb480576ad`)
5. `storage-visualiser` (`aa47ebd3e3424fc589cd2b73250e1ed9`)

### Strict Priority Rules
- **Rule 1:** `CONSOLIDATED_PROJECT_PLAN.md` strictly governs product scope, feature tiers, database schema, routing, and workflows.
- **Rule 2:** `EUNOMIA_UI_DESIGN_GUIDE_FOR_ANTIGRAVITY.md` governs design principles, architectural layout, rule-line motifs, surface hierarchy, and anti-pattern bans.
- **Rule 3:** Stitch references provide **visual inspiration only** (composition, mineral color palette, typography hierarchy, rule-line weight, surface contrast). Stitch must **never** define product behavior or invent scope.

---

## Classification Legend

- **Supported by project plan:** Valid feature, route, or workflow defined in Tier 1A / Tier 1B.
- **Keep as visual inspiration:** Valid visual composition, layout pattern, or styling detail to adopt.
- **Replace with a supported Eunomia feature:** UI slot or container is valid, but the text/action must map to a confirmed Eunomia capability.
- **Remove:** Invented AI features, fake enterprise metrics, fantasy collaboration workflows, or anti-patterns explicitly banned by the UI guide.

---

## Detailed Audit by Screen

### 1. Screen: `my-files-provenance` (My Files — Provenance View)

| Visual Element / Component | Stitch Manifestation | Classification | Recommended Technical / Design Action |
|---|---|---|---|
| Navigation Item: `Starred` | Star icon navigation link | **Remove** | `Starred` is not in the confirmed project plan scope. |
| Navigation Item: `Support` | Contact support link | **Remove** | Extraneous SaaS navigation item not in scope. |
| Navigation Item: `Shared` | Included in some Stitch nav variants | **Replace with a supported Eunomia feature** | Sharing is deferred to Tier 2 (`CONSOLIDATED_PROJECT_PLAN.md` §4). In Tier 1, `Shared` must not appear as an active route. |
| Navigation Items: `Home`, `My Files`, `Recent`, `Storage`, `Graph`, `Drive Import`, `Trash`, `Settings` | Main sidebar list | **Supported by project plan** | Retain these primary routes as defined in Tiers 1A & 1B. |
| File Table Columns | 3-column table (`Name`, `Modified`, `Size`) | **Replace with a supported Eunomia feature** | Replace with standard 6-column high-density layout (`Checkbox`, `Name`, `Type`, `Owner`, `Modified`, `Size`). |
| File Row Selection | Left border accent `border-l-[3px] border-l-bronze` + `bg-sandstone` | **Keep as visual inspiration** | Adopt as Eunomia's signature **Rule Line** selection marker. |
| File Inspector Tabs | 2-tab switcher (`Details`, `Provenance`) | **Replace with a supported Eunomia feature** | Expand to confirmed 3-tab layout (`Details`, `Versions`, `Provenance`) per Section 7 & 10 of project plan. |
| Inspector Action Button | "Export Audit Log" | **Replace with a supported Eunomia feature** | Rename to **"Export Provenance PDF"** (Tier 1A headline feature). Per-file audit logs are deferred to Tier 3. |
| Provenance Node 3 Glow | `shadow-[0_0_15px_rgba(91,99,75,0.5)]` neon glow | **Remove** | Banned anti-pattern (`UI GUIDE` line 737: "no glowing accents / glowing nodes"). Use solid `Muted Olive` fill and 1.5px dark ink border instead. |
| Provenance Chain Node | Timeline axis with round node markers and hash chips (`SIG_VAL_OK`) | **Keep as visual inspiration** | Excellent vertical axis timeline layout. Map `SIG_VAL_OK` to cryptographic validation state. |

---

### 2. Screen: `design-system` (Mineral Archival Design System)

| Visual Element / Component | Stitch Manifestation | Classification | Recommended Technical / Design Action |
|---|---|---|---|
| Palette: `Archive Ivory` (`#F8F6F0`) | Primary background canvas | **Supported by project plan** | Preserved as Base Level 0 surface (`#F7F5F0` / `#F8F9FA`). |
| Palette: `Deep Ink` (`#171A1F`) | Sidebar background, text, 1.5px rules | **Supported by project plan** | Preserved for high contrast text and structural rule lines. |
| Palette: `Burnished Bronze` (`#A66F2C` / `#82510E`) | Primary actions, active indicators, selection | **Supported by project plan** | Preserved as primary brand and focus accent. |
| Palette: `Muted Olive` (`#5B634B` / `#32675C`) | Valid provenance status, success badges | **Supported by project plan** | Preserved for verified cryptographic integrity states. |
| Palette: `Clay Red` (`#BA1A1A`) | Destructive actions, tamper alerts | **Supported by project plan** | Preserved strictly for broken hash chains and deletion. |
| Typography Strategy | `Playfair Display` (Headings), `Source Sans 3` (Body), `JetBrains Mono` (Code/Hashes) | **Supported by project plan** | Adopt exact three-axial typography hierarchy. |
| Geometry & Radius | Sharp 0px to 4px radii, 1.5px solid rule lines | **Keep as visual inspiration** | Adopt architectural minimalism; ban 16px–24px oversized rounded cards. |

---

### 3. Screen: `home` (Home Screen — Revised)

| Visual Element / Component | Stitch Manifestation | Classification | Recommended Technical / Design Action |
|---|---|---|---|
| Header Action | "NEW ARCHIVE" button | **Replace with a supported Eunomia feature** | Replace with **"UPLOAD FILE"** / **"NEW FOLDER"** actions. |
| Quick Access Tile 4 | "AI Analysis" (`auto_awesome` icon) | **Remove** | Banned AI anti-pattern (`UI GUIDE` line 1145: "no 'Ask AI' buttons or AI analysis cards"). |
| Quick Access Tile 3 | "Shared Drives" | **Replace with a supported Eunomia feature** | Replace with **"Google Drive Import"** or **"My Files"**. |
| Quick Access Tiles 1 & 2 | "Q3 Transcripts", "Historical Assets" | **Replace with a supported Eunomia feature** | Replace with actual recent user files in "Continue Working" section. |
| Activity Item 2 | "Access Requested by Dr. Aris Thorne" (`APPROVE` / `DENY`) | **Remove** | Multi-user approval workflow is unsupported in Tier 1. Remove completely. |
| Activity Item 3 | "Data Anomaly Detected in Partition Delta" | **Remove** | Unsupported system partition error. Replace with legitimate provenance or CAS upload activity events. |
| Storage Metric Header | "72.4 TERABYTES USED / 100 CAPACITY" | **Replace with a supported Eunomia feature** | Replace with realistic local/self-hosted student metrics (e.g., "45.2 GB Used / 100 GB"). |
| Storage Legend Categories | "DOCUMENTS 45 TB", "MEDIA ASSETS 20 TB", "SYSTEM LOGS 7.4 TB" | **Replace with a supported Eunomia feature** | Replace with actual CAS categories: `Documents`, `Media`, `Code & Text`, `Deduplication Savings`. |
| System Status Box | "Indexing Engine (OPTIMAL)", "Sync Gateways (ONLINE)", "Archive Node C (REBUILDING)" | **Remove** | Fake enterprise infrastructure cluster status. Replace with honest single-binary storage breakdown or local sync status. |

---

### 4. Screen: `structural-file-graph` (Structural File Graph — Revised)

| Visual Element / Component | Stitch Manifestation | Classification | Recommended Technical / Design Action |
|---|---|---|---|
| 2D Matrix Layout | Orthogonal grid with 1.5px right-angled rule line connectors | **Keep as visual inspiration** | Reproduce using Vis Network in hierarchical mode (`direction: 'UD'`, physics disabled). |
| Toolbar Controls | `ROOT: /ARCHIVES_1920`, `Filter`, `Zoom Level` | **Supported by project plan** | Maps directly to Vis Network zoom, pan, select, collapse/expand, and filter controls. |
| Node Types | Folder nodes (`DOCUMENTS`, `PHOTOGRAPHS`), File nodes (`Manifest_A.txt`, `Camp_Site.tiff`) | **Supported by project plan** | Supported in Vis Network graph scope (`CONSOLIDATED_PROJECT_PLAN.md` §12). |
| Tamper Indicator Node | Red dot badge (`Report_Draft.pdf` - "Broken Provenance") | **Supported by project plan** | Preserved for visual tamper detection in graph view. |
| Node Inspector Tags | Tags section (`Egypt`, `Dig Site`, `Priority`) | **Remove** | Database tag tables are deferred to Tier 3 (`CONSOLIDATED_PROJECT_PLAN.md` §4 & §11). Remove tags section from Tier 1 Inspector. |
| Mobile Avatar | Archival researcher portrait photo in header | **Remove** | Banned AI image asset pattern (`UI GUIDE` line 918). Replace with geometric initial avatar or standard account menu. |

---

### 5. Screen: `storage-visualiser` (Storage Visualiser — Revised)

| Visual Element / Component | Stitch Manifestation | Classification | Recommended Technical / Design Action |
|---|---|---|---|
| Statistics Strip | `Total Logical Size`, `Physical CAS Storage`, `Deduplication Savings` (74.5%) | **Supported by project plan** | Excellent metric presentation! Maps directly to SHA-256 CAS deduplication analytics. |
| Metric Scale | "842.6 TB Logical Size", "214.3 TB Physical CAS Storage" | **Replace with a supported Eunomia feature** | Replace enterprise petabyte scale with realistic local storage values (e.g. GB / TB scale for student research). |
| Treemap Visualization | Mineral-colored grid tiles (`Historical Records 42%`, `Multimedia 28%`, `Financial Logs 12%`) | **Keep as visual inspiration** | Reproduce using SVG/D3 treemap component. Replace categories with real CAS file-type aggregations (`Documents`, `Images`, `Audio/Video`, `Version Overhead`, `Deduplication Savings`). |
| Treemap Palette | Warm Bronze (`#A66F2C`), Oxidised Copper (`#5C7A70`), Olive (`#7B855A`), Dusty Blue (`#6B8296`), Muted Plum (`#8C7389`) | **Keep as visual inspiration** | Preserved as mineral color tokens for treemap category distinctions. |
| Top Action | "Export Map" button | **Replace with a supported Eunomia feature** | Replace with **"Refresh Analytics"** or density toggle controls. |

---

## Summary Matrix of Audited Elements

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ CATEGORY               │ KEEP / SUPPORTED                 │ REPLACE / REMOVE              │
├────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ Navigation             │ Home, My Files, Recent, Storage, │ Starred (Remove),             │
│                        │ Graph, Drive Import, Trash       │ Support (Remove),             │
│                        │                                  │ Shared (Defer to Tier 2)      │
├────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ Inspector              │ Details, Provenance,             │ 2-Tab layout (Replace with 3) │
│                        │ Vertical timeline axis           │ Export Audit Log (Replace)    │
│                        │                                  │ Node glow shadows (Remove)    │
├────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ Home Screen            │ Continue Working, Recent         │ AI Analysis tile (Remove)     │
│                        │ Activity, Storage Overview       │ Access Requests (Remove)      │
│                        │                                  │ Fake Enterprise Nodes (Remove)│
├────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ Structural Graph       │ Orthogonal 2D layout,            │ Floating physics (Banned)     │
│                        │ Vis Network hierarchical mode,   │ Metadata Tags (Defer Tier 3)  │
│                        │ Tamper detection badge           │ Avatar Photo (Remove)         │
├────────────────────────┼──────────────────────────────────┼───────────────────────────────┤
│ Storage Visualiser     │ CAS deduplication metrics %,     │ Petabyte enterprise scale     │
│                        │ Mineral treemap palette,         │ (Replace with realistic GB)   │
│                        │ D3/SVG treemap layout            │                               │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```
