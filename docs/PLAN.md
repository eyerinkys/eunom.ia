# PLAN.md — Decentralized File Management System (IVWS)

## Problem Statement
A major cloud storage provider instituted restrictive storage paywalls and experienced a prolonged outage during finals week, locking students out of critical portfolio files and source code. Build a reliable, self-hosted web file management system — a local Drive equivalent.

## Research Inspiration
- **CRDTs (Conflict-free Replicated Data Types)** — Shapiro et al. and related work. Replicas accept updates without remote sync first and converge automatically without manual conflict resolution. Basis for our offline-sync approach.
- **Merkle-CRDTs** (Protocol Labs, arXiv:2004.00107) — Merkle-DAGs + CRDTs for fully distributed key-value stores with no delivery guarantees. Basis for content-addressed version history.
- **"File system on CRDT"** (Ahmed-Nacer et al., arXiv:1207.5990) — direct prior art, cite in pitch.
- **CrossFS** (2025/2026) — recent CRDT-based metadata sync for distributed filesystems. Cite as "active research area" credibility.
- **arXiv versioning UX** — v1/v2/v3 changelog-style timeline instead of a buried "restore" button.
- **Linux permissions (rwx)** — mental model for sharing permissions instead of vague dropdowns.

---

## Headline Innovation: Authorship Provenance Trail

Not an AI feature — a cryptographic one, built for free on top of the version-history system we're already doing.

**The problem:** AI misconduct accusations are now the leading category of academic integrity cases, and detection tools are unreliable, probabilistic, and produce real false positives — with genuinely severe consequences for wrongly accused students. There's no good way for a student to *prove* a file was built incrementally over time rather than pasted in wholesale.

**The feature:** since every save already creates a content-addressed, hashed, timestamped version node (from the versioning system), expose that as a first-class "Authorship Timeline" per file:
- Full edit history — timestamps, per-version hashes, diffs between versions
- Each version's hash depends on the previous version's hash (hash-chained, like a mini git log) — so a fake early draft can't be retroactively inserted without breaking the chain
- One-click exportable provenance report (PDF) a student can attach to a submission or show a professor if flagged

Pitch line: *"A file manager that can also prove you didn't just paste this in last night."* Zero extra API cost — this is presentation of data the version-history feature already produces, not new infra.

---

## Headline Innovation 2: Peer Swarm Sync (the actual "Decentralized" in the name)

Everything else in this plan is **self-hosted**, not decentralized — self-hosting just relocates the single point of failure from the provider's server to ours. This feature is what makes the "decentralized" claim real: the system stays usable even if our main server is down, which is the exact disaster scenario in the problem statement.

**Primary mechanism — LAN auto-discovery peer sync:**
- No manual "pick a friend" step (that's a bootstrapping flaw — most people won't have someone to pair with). Instead, the app auto-discovers other instances of itself running on the same network (mDNS-style) — realistic because students are physically co-located at school during finals week.
- Discovered peers replicate via WebRTC data channels directly, peer-to-peer. The signaling server (used only for peer discovery) is tiny and stateless — if the main server goes down, already-discovered peers keep syncing fine regardless.
- **CRDT-based merge** (from the research above) is integrated directly here, not bolted on separately: when multiple peers hold different edits to the same file/folder metadata, CRDT convergence rules resolve it automatically on reconnect, no manual conflict resolution UI needed. This is where the Merkle-CRDT research and the peer replication mechanism become one feature instead of two.

**Fallback — local-first offline cache:**
- If zero peers are discoverable (no one else nearby running the app), the service-worker/IndexedDB cache of last-synced files is still available locally. Not decentralized in the network sense, but guarantees the baseline case — the actual student, on their actual device, can still get to their own files during an outage even with nobody else around.

Pitch line: *"We don't just avoid one company's outage — we don't depend on any single server at all, including ours."*

---

## Headline Innovation 3: One-Click Google Drive Import

Universities are actively cutting Google Workspace storage right now and telling students to migrate off — this isn't hypothetical, it's the exact scenario in the problem statement, happening at real schools this year. Nobody's making that forced migration painless.

**The feature:** OAuth into the student's existing Google Drive, pull their folder structure and files via the Drive API, recreate the hierarchy on import — one click, not a manual re-upload of everything. This is what turns the app from "another empty storage app I have to refill by hand" into "the thing that saved my files when my school slashed my quota."

Doubles as the account-independence pitch: once imported, files aren't tied to any institution-issued account, so there's no "your school's plan ended, your files are gone" failure mode to begin with — a real, current problem for students whose Drive access is tied to enrollment status.

---

## Feature List

### Tier 1 — Must Ship (core demo)
- [ ] Folder navigation (nested folders, breadcrumb nav)
- [ ] File upload / download
- [ ] Version history — content-addressed (hash file, skip storage if unchanged, new version node on change), arxiv-style v1/v2/v3 timeline UI
- [ ] **Authorship Provenance Trail** — hash-chained version timeline + exportable report (headline feature, built on version history above)
- [ ] Storage limit visualizer (usage by folder/filetype, dedup savings called out)
- [ ] Basic auth (single-user login minimum)
- [ ] File relationship graph (doable version) — nodes = files, edges = folder/structural relationships (shared folder, shared tags, upload proximity). Force-directed layout (Cytoscape.js or d3.js). Ship this first as a solid, achievable visual.
- [ ] **Peer Swarm Sync — fallback layer**: local-first offline cache (service worker + IndexedDB), always available even with zero peers. Ship this baseline first — it's the guaranteed floor under the fancier peer stuff below.
- [ ] **One-Click Google Drive Import** — OAuth + Drive API, pull folder structure and files, recreate hierarchy on import

### Tier 2 — Should Ship (stretch, attempt after Tier 1 works end-to-end)
- [ ] Sharing permissions — simple link generation, view/edit toggle
- [ ] **Peer Swarm Sync — primary layer**: LAN auto-discovery (mDNS-style) + WebRTC peer replication, stateless signaling server for discovery only, no manual peer-picking
- [ ] **File metadata summarizer** — lightweight per-file summary shown alongside the (structural) graph and file listings. Text-extractable files (code, docx, pdf, md) → short content summary via Groq; binary/media files (images, design files) → metadata-only description (EXIF, dimensions, filename) instead of faking a content read:
  - Opt-in toggle per user (privacy — clearly surfaced, off by default)
  - Lazy calls only (on file open/explicit request, never bulk on upload)
  - Truncate/sample content before sending (signatures/headers/first N lines, not full file) — keeps token usage sane on Groq free tier (30 RPM / ~12K TPM / ~1K RPD on llama-3.3-70b)
  - Cache summary keyed to content hash — never re-summarize an unchanged version

### Tier 3 — Absurdly Ahead of Schedule
- [ ] **Peer Swarm Sync — full CRDT merge**: vector-clock/CRDT-based automatic conflict resolution across peers on reconnect (upgrades the basic "last-write-wins" version of Tier 2 sync into true conflict-free merging)
- [ ] Linux-style rwx permission model (owner/group/other) for sharing, shown visually
- [ ] Multi-user real-time collaboration (presence indicators, live cursors/edits)
- [ ] Diff previews for file versions (text diff minimum; binary "changed region" heuristic if time allows)
- [ ] Symlink-style file references (link one file into multiple folders without duplicating storage)
- [ ] Opinionated default folder scaffolding on account creation (e.g. /drafts, /final, /archive)
- [ ] Metadata tagging + "linked files" (à la Papers with Code linking papers ↔ code ↔ datasets)
- [ ] Expiring/password-protected share links
- [ ] Audit log per file (who accessed/edited/when)
- [ ] Map-reduce summarization for very large files (chunk → summarize → summarize-of-summaries) — only if truncation genuinely isn't enough for the metadata summarizer

---

## Build Order
1. Auth + folder nav + upload/download (skeleton app working end-to-end)
2. Version history with content-addressed hashing
3. Authorship provenance trail (built directly on #2)
4. Storage visualizer
5. File graph — structural version first
6. Peer Swarm Sync — fallback layer (local cache, guaranteed floor)
7. One-Click Google Drive Import
8. Sharing (link-based)
9. Peer Swarm Sync — primary layer (LAN discovery + WebRTC replication)
10. File metadata summarizer (Groq), if time allows
11. Peer Swarm Sync — CRDT merge upgrade, and anything else from Tier 3, in whatever order is fastest to demo

## Non-Negotiable Rule
Do not touch Tier 2 until Tier 1 is fully working end-to-end. Do not touch Tier 3 unless Tier 2 is done with time to spare. A rock-solid Tier 1 demo beats a half-working everything.
