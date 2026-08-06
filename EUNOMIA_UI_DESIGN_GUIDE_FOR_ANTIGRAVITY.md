# Eunomia Frontend UI Design Guide for Antigravity

## Purpose

Design a genuinely distinctive, usable, modern file-management interface inspired by **Eunomia**, the Greek goddess of good order, lawful structure, balance, and civic harmony.

This product is functionally comparable to Google Drive in the sense that users should immediately understand how to:

- browse folders;
- view files;
- upload files;
- create folders;
- search;
- sort;
- select;
- move;
- rename;
- delete;
- inspect file details;
- access recent, shared, offline, and trashed items.

However, the interface must not feel like a copy of Google Drive, Dropbox, OneDrive, Notion, Linear, Raycast, or a generic AI-generated SaaS dashboard.

The experience should feel **familiar in interaction, unique in composition**.

---

# Non-Negotiable Instruction

## Do Not Generate Code

Do not produce:

- HTML;
- CSS;
- JavaScript;
- TypeScript;
- React components;
- Tailwind classes;
- design tokens as code;
- component implementation details;
- animation code;
- backend code;
- pseudocode;
- framework recommendations;
- file structures;
- implementation plans.

This task is strictly about:

- visual direction;
- interaction design;
- screen composition;
- hierarchy;
- UX logic;
- spatial relationships;
- component appearance;
- motion concepts;
- consistency;
- usability;
- identity.

Deliver a **design specification**, not a coded prototype.

---

# Mandatory Design-Skill Invocation

Before designing anything, invoke and apply **all design-related skills available in the Antigravity environment**.

This includes, where available:

- UI design skills;
- UX design skills;
- visual hierarchy skills;
- interaction design skills;
- accessibility skills;
- responsive design skills;
- typography skills;
- colour-system skills;
- motion-design skills;
- product-design skills;
- information-architecture skills;
- layout and composition skills;
- design-audit skills;
- anti-pattern detection skills;
- any Impeccable-style or equivalent design-quality skills.

Do not rely on a single design skill.

Run a full design pass, then a second critical review pass using all relevant design-audit and anti-pattern skills.

The final result should feel intentionally designed by a skilled human product designer, not assembled from common AI UI defaults.

---

# Core Design Thesis

> A familiar file manager governed by visual order.

Eunomia should influence the interface through:

- balance;
- rhythm;
- proportion;
- clear hierarchy;
- calm organisation;
- disciplined spacing;
- measured alignment;
- strong systems;
- restrained symbolism;
- transitions from disorder to order.

Eunomia should not be represented mainly through literal Greek decoration.

The mythology should shape the logic of the interface, not become a costume placed over it.

---

# Design Character

The product should feel:

- modern;
- calm;
- precise;
- architectural;
- editorial;
- efficient;
- trustworthy;
- slightly ceremonial;
- mature;
- distinctive;
- easy to understand;
- visually disciplined.

The product should not feel:

- futuristic for the sake of being futuristic;
- overly luxurious;
- fantasy-themed;
- ancient;
- game-like;
- corporate;
- AI-branded;
- excessively minimal;
- excessively decorative;
- visually empty;
- visually noisy.

---

# Primary Design Principle

## Familiar Mechanics, Distinctive Composition

The user should never have to learn a strange new way to:

- open a folder;
- upload a file;
- select multiple items;
- search;
- sort;
- move a file;
- open details;
- switch between list and grid view.

The uniqueness should come from:

- layout;
- spacing;
- typography;
- information hierarchy;
- transitions;
- selection treatment;
- sidebar composition;
- inspector design;
- file-row design;
- subtle symbolic structure;
- restrained motion;
- strong identity.

Do not invent confusing interactions merely to appear original.

---

# Visual Concept

## The Ordered Archive

The interface should resemble a modern civic archive or institutional records system, but translated into a refined digital product.

Possible visual references:

- ledgers;
- index systems;
- filing systems;
- archival labels;
- ruled paper;
- measured architectural drawings;
- civic seals;
- structured manuscripts;
- museum catalogues;
- editorial layouts;
- administrative records;
- modernist information systems.

These references should remain subtle.

Do not turn the app into:

- a temple;
- a museum exhibition;
- a parchment document;
- an archaeological game;
- a Greek mythology fan page.

---

# Signature Visual Device

## The Rule Line

Use a recurring line-based structural motif across the interface.

The line can appear as:

- a left selection marker;
- a breadcrumb connector;
- a section divider;
- a file-tree connector;
- a timeline axis;
- an upload-progress axis;
- an inspector separator;
- a navigation indicator;
- a relationship marker.

The line should communicate:

- hierarchy;
- order;
- continuity;
- structure;
- position;
- lineage.

It should be functional rather than decorative.

### Example

Instead of a selected file row becoming a large rounded coloured card:

```text
│ Research Notes.md        Modified today        24 KB
```

Use a strong vertical rule combined with a subtle background change.

Instead of oversized tab pills, use:

```text
DETAILS     ACTIVITY     VERSIONS
────────
```

The active section can be marked with a clean underline or rule.

---

# Application Structure

The main desktop layout should be simple and familiar.

```text
┌───────────────────────────────────────────────────────────┐
│ Brand       Global Search                        Actions  │
├────────────┬──────────────────────────────────────────────┤
│            │ Breadcrumbs                                  │
│ Sidebar    ├──────────────────────────────────────────────┤
│            │                                              │
│            │ Main File Workspace                          │
│            │                                              │
│            │                                              │
├────────────┴──────────────────────────────────────────────┤
│ Uploads and Background Activity                           │
└───────────────────────────────────────────────────────────┘
```

Optional contextual inspector:

```text
┌────────────┬────────────────────────────┬─────────────────┐
│ Sidebar    │ Main File Workspace        │ File Inspector  │
└────────────┴────────────────────────────┴─────────────────┘
```

Do not overcomplicate the shell with:

- multiple nested sidebars;
- top navigation plus side navigation plus floating dock;
- large dashboard cards;
- floating action clusters;
- permanent secondary panels;
- excessive segmentation.

---

# Main Navigation

The left navigation should remain compact and instantly understandable.

Use:

- Home;
- My Files;
- Recent;
- Starred;
- Shared;
- Offline;
- Trash;
- Settings.

A small storage-usage area may appear near the bottom.

Do not replace standard labels with obscure mythological names.

Subtle secondary descriptors are acceptable.

Example:

```text
MY FILES
The Archive
```

Do not use labels such as:

- Agora;
- Treasury;
- Chronicle;
- Ordinances;
- Assembly;
- Exile;

as the only visible navigation terms.

Clarity comes first.

---

# Top Bar

The top bar should contain:

- brand mark;
- global search;
- upload action;
- create-folder action;
- view control;
- profile or account menu.

Search should be visually important without becoming a giant rounded pill.

Avoid the common AI-generated search bar pattern:

- excessively wide;
- pill-shaped;
- with a glowing border;
- centred inside a large empty header;
- decorated with keyboard-hint pills;
- surrounded by gradient fog.

The search field should feel integrated into the application structure.

---

# Home Screen

The home screen should help the user continue working.

Recommended sections:

## Continue Working

A restrained horizontal section showing recent or frequently accessed files.

## Recent Activity

A compact chronological list of meaningful actions.

## Important Locations

Quick access to:

- My Files;
- Shared;
- Offline.

## Storage

One simple and honest storage-usage indicator.

Do not create:

- fake productivity scores;
- fake AI insights;
- meaningless file statistics;
- twelve dashboard cards;
- “Your digital ecosystem” language;
- huge welcome banners;
- oversized greeting text;
- decorative charts with no decision value.

The home page should not resemble an investor dashboard.

---

# File Browser

The file browser is the core product screen.

## Default View

Use list view as the default.

The list should prioritise:

- filename;
- type;
- owner or source where relevant;
- modified date;
- size;
- relevant status.

Example:

```text
┌──┬─────────────────────────┬────────────┬──────────┬──────────┐
│  │ Name                    │ Owner      │ Modified │ Size     │
├──┼─────────────────────────┼────────────┼──────────┼──────────┤
│□ │ School                  │ You        │ Today    │ —        │
│□ │ Research Notes.md       │ You        │ 09:42    │ 24 KB    │
│□ │ Final Presentation.pdf  │ You        │ Yesterday│ 8.2 MB   │
└──┴─────────────────────────┴────────────┴──────────┴──────────┘
```

## File Row Behaviour

A file row should:

- remain compact;
- preserve column alignment;
- reveal actions without shifting content;
- show a restrained hover state;
- use a clear left rule or equivalent for selection;
- support multi-select;
- allow keyboard focus;
- keep metadata readable.

Do not turn every row into a rounded card.

## Grid View

Grid view should exist for visual files.

Cards should be:

- rectangular;
- preview-first;
- lightly bordered;
- restrained in radius;
- consistent in dimensions;
- free of oversized shadows;
- free of glowing hover effects.

Do not make every grid card look like a generic SaaS template tile.

---

# Breadcrumbs

Breadcrumbs should clearly express hierarchy.

Example:

```text
My Files / School / Science / Project
```

They may use subtle line connectors or measured separators.

Avoid:

- oversized breadcrumb chips;
- every path segment inside a pill;
- unnecessary icons between every level;
- animated breadcrumb gimmicks;
- hiding too much of the path too early.

---

# Selection and Contextual Actions

When files are selected:

- a clear structural selection marker should appear;
- contextual actions should become available;
- the layout should remain stable;
- the user should immediately understand how many items are selected.

Possible actions:

- move;
- rename;
- share;
- download;
- delete;
- inspect.

Do not show all actions at all times.

Do not create a floating rainbow toolbar.

Do not animate selection with bounce or elastic motion.

---

# File Inspector

A file inspector may appear on the right when a file is selected.

It should include:

- preview;
- filename;
- type;
- location;
- modified time;
- size;
- owner;
- sharing state;
- activity;
- version information where relevant.

Use headings, spacing, and rules rather than wrapping every field in a separate card.

Example:

```text
DETAILS

Research Notes.md
Markdown document

────────────────────

Location
School / Science

Modified
Today at 09:42

Size
24 KB
```

Avoid:

- card inside card inside card;
- excessive icon labels;
- metric tiles;
- coloured status boxes for ordinary metadata;
- unnecessary accordions;
- giant file-type illustrations.

---

# Upload Experience

The upload flow should be clear, calm, and honest.

Possible states:

- preparing;
- hashing;
- checking;
- uploading;
- processing;
- complete;
- failed.

The interface may show these as a restrained ordered sequence.

Example:

```text
Preparing → Uploading → Processing → Complete
```

A subtle line-based progress treatment is encouraged.

Do not use:

- confetti;
- fireworks;
- bouncing upload icons;
- celebratory gradients;
- oversized toast notifications;
- fake AI commentary;
- vague statuses such as “Working magic”.

---

# Empty States

Empty states should be useful and restrained.

Example:

```text
No files here yet

Upload a file or create a folder to begin.
```

A subtle geometric or archival illustration may be used.

Avoid:

- giant 3D illustrations;
- goddess portraits;
- statues;
- floating folders;
- gradient blobs;
- long motivational copy;
- joke-heavy empty states;
- huge amounts of empty vertical space.

---

# Loading States

Loading states should preserve layout.

Use:

- line placeholders;
- row skeletons;
- restrained progress indicators;
- subtle shimmer only if necessary;
- stable column widths.

Avoid:

- glowing skeleton cards;
- multiple independent spinners;
- pulsing gradients;
- loading text that jumps around;
- decorative motion that delays perceived speed.

---

# Error States

Errors should explain:

- what failed;
- what remains safe;
- what the user can do next.

Example:

```text
Upload interrupted

The file has not been added.
Retry the upload or remove it from the queue.
```

Do not use:

- vague “Something went wrong” messages;
- humorous error copy;
- full-screen dramatic errors for minor failures;
- red gradients;
- animated warning icons.

---

# Offline State

Offline behaviour should be visible but not alarming.

Show:

- offline status;
- which files remain available;
- queued actions;
- reconnect behaviour.

Do not redesign the entire interface when offline.

Do not show a giant warning screen unless the product is unusable.

---

# Colour Direction

Avoid the obvious white-marble-and-gold mythology theme.

Use a restrained mineral and archival palette.

Suggested direction:

- warm paper or stone background;
- dark ink text;
- muted bronze accent;
- restrained olive;
- clay or muted red for destructive actions;
- subtle grey-beige rules.

The palette should feel:

- timeless;
- calm;
- institutional;
- modern;
- tactile without being skeuomorphic.

Avoid:

- purple;
- blue-purple gradients;
- neon cyan;
- black-and-gold luxury styling;
- oversaturated bronze;
- glowing accents;
- too many semantic colours;
- coloured backgrounds for every section.

---

# Typography

Use typography as a major part of the identity.

## Interface Typeface

Choose a clean, practical sans serif.

The sans serif should be used for:

- navigation;
- filenames;
- metadata;
- buttons;
- forms;
- menus;
- tables.

## Display Typeface

Use a restrained serif only for:

- the wordmark;
- rare page introductions;
- reports;
- occasional empty-state headings.

Do not use the serif throughout the whole file browser.

## Monospace Typeface

Use monospace only for:

- hashes;
- technical identifiers;
- timestamps where appropriate;
- logs or version identifiers.

Avoid:

- all-uppercase labels everywhere;
- excessive letter spacing;
- pseudo-classical display fonts;
- decorative Greek fonts;
- novelty typography;
- tiny grey text;
- poor contrast.

---

# Shape Language

Use restrained radii.

Recommended visual behaviour:

- file rows: nearly square;
- buttons: lightly rounded;
- menus: moderately rounded;
- dialogs: moderately rounded;
- previews: slightly more rounded than controls.

Avoid:

- 16px to 24px radius on everything;
- full pills for ordinary buttons;
- giant rounded dashboard containers;
- circular icon buttons everywhere;
- excessive capsule-shaped filters.

Pills should be reserved for:

- true tags;
- compact status labels;
- removable filter tokens.

---

# Spacing and Density

The interface should feel productive, not sparse.

Use:

- compact navigation;
- readable file rows;
- modest page padding;
- clear grouping;
- consistent vertical rhythm.

Avoid:

- huge empty margins;
- oversized headers;
- unnecessarily tall controls;
- giant section gaps;
- tiny dense text;
- cramped inspector panels.

The target is balanced desktop productivity.

---

# Motion Design

Motion should express:

- elements finding their correct place;
- hierarchy becoming clear;
- selection;
- movement;
- continuity;
- confirmation.

Use motion for:

- opening and closing the inspector;
- switching list and grid views;
- moving between folders;
- contextual action changes;
- upload progression;
- subtle file movement;
- route continuity.

Reserve more expressive motion for rare signature moments.

Possible signature moments:

- first-time archive reveal;
- a folder’s contents resolving into order;
- an import completing;
- the brand mark assembling;
- a file moving into its destination.

Avoid:

- bouncing;
- elastic easing;
- spring motion everywhere;
- floating cards;
- perpetual motion;
- large parallax;
- scroll-jacking;
- staggered animation on every list load;
- slow route transitions;
- animating routine interactions excessively.

Motion must never reduce clarity or speed.

Support reduced-motion preferences.

---

# Logo Direction

Do not use a literal goddess face.

Explore a restrained geometric mark using:

- the letter E;
- three horizontal lines;
- a central axis;
- a partial circle;
- a balanced seal;
- a subtle archive or ledger reference.

The logo should work at:

- favicon size;
- sidebar size;
- login-screen size;
- report or seal size.

Avoid:

- statues;
- profile illustrations;
- laurel wreath clichés;
- Greek columns;
- lightning bolts;
- detailed crests;
- ornate gold emblems.

---

# Recommended Screens to Design

Design the following screens:

## 1. Login

Simple and restrained.

Include:

- brand mark;
- product name;
- login form;
- optional short statement;
- no giant illustration;
- no split-screen gradient artwork;
- no unnecessary testimonial.

## 2. Home

Include:

- continue working;
- recent activity;
- important locations;
- simple storage usage.

## 3. My Files

Include:

- breadcrumbs;
- sorting;
- filtering;
- list/grid toggle;
- upload;
- create folder;
- file list;
- selection state.

## 4. Folder View

Include:

- clear hierarchy;
- breadcrumb path;
- folder actions;
- empty-state version;
- populated version.

## 5. Search Results

Include:

- query;
- filters;
- sorted results;
- file location;
- file type;
- date;
- owner or source.

## 6. Shared

Include:

- shared by me;
- shared with me;
- permissions;
- clear ownership.

## 7. Recent

Include:

- chronological grouping;
- compact rows;
- file location;
- date and time.

## 8. Offline

Include:

- offline availability;
- sync state;
- queued actions;
- storage usage.

## 9. Trash

Include:

- deletion date;
- restore;
- permanent delete;
- clear consequences.

## 10. Settings

Include:

- account;
- appearance;
- storage;
- offline settings;
- privacy;
- accessibility.

## 11. File Inspector

Design states for:

- document;
- image;
- folder;
- multi-select.

## 12. Upload Queue

Design states for:

- uploading;
- paused;
- complete;
- failed;
- retrying.

---

# Required Design Examples

Show concrete examples for the following:

## File Row Example

Demonstrate:

- default;
- hover;
- selected;
- multi-selected;
- keyboard-focused;
- error;
- offline-available.

## File Grid Card Example

Demonstrate:

- image preview;
- document preview;
- folder;
- selected state;
- shared state.

## Sidebar Example

Demonstrate:

- active navigation;
- inactive navigation;
- storage usage;
- compact account area.

## Inspector Example

Demonstrate:

- file details;
- activity;
- sharing;
- version information.

## Upload Queue Example

Demonstrate:

- active upload;
- complete upload;
- failed upload.

## Empty State Example

Demonstrate:

- empty folder;
- no search results;
- no shared files;
- offline unavailable.

## Mobile Example

Demonstrate:

- mobile navigation;
- mobile file list;
- mobile search;
- mobile selection;
- mobile inspector or details sheet.

---

# Explicit AI-UI Anti-Patterns to Avoid

The final design must avoid all of the following:

## Generic AI Dashboard Patterns

- oversized greeting headers;
- “Welcome back” hero sections;
- fake analytics;
- productivity scores;
- random activity charts;
- meaningless metric cards;
- prompt-like search bars;
- assistant panels;
- “Ask AI” buttons;
- conversational empty states.

## Generic Visual Patterns

- purple gradients;
- blue-purple gradients;
- gradient text;
- neon glows;
- frosted glass;
- glassmorphism;
- large blurred colour blobs;
- floating cards;
- excessive shadows;
- huge rounded containers;
- pill-shaped everything;
- icon cards in repetitive grids;
- giant white-space-heavy hero sections;
- dashboard card mosaics;
- overly centred layouts.

## Generic SaaS Patterns

- every section in a card;
- every card with an icon in a coloured square;
- identical 3-column feature grids;
- left sidebar with glowing active pill;
- command palette as the main identity;
- rounded table inside rounded card inside rounded page;
- unnecessary top-level tabs;
- decorative charts;
- floating create button on desktop;
- overuse of badge labels.

## Generic Motion Patterns

- bouncing;
- spring animation everywhere;
- card levitation;
- excessive hover scaling;
- glowing pulse effects;
- animated gradient backgrounds;
- infinite loops;
- over-staggered entrances;
- overly slow transitions;
- every element moving at once.

## Generic Mythology Patterns

- marble textures;
- parchment backgrounds;
- literal Greek temples;
- goddess artwork;
- statues;
- columns;
- laurel wreaths;
- Roman numerals everywhere;
- excessive gold;
- mythological naming for basic actions;
- fantasy UI;
- game HUD styling.

---

# Accessibility Requirements

The design must account for:

- strong contrast;
- keyboard navigation;
- visible focus states;
- screen-reader-friendly hierarchy;
- accessible labels;
- reduced-motion support;
- scalable text;
- touch-friendly mobile controls;
- non-colour-only status communication;
- clear destructive-action confirmation;
- readable metadata;
- sufficient row height;
- logical tab order.

Accessibility must be integrated into the design, not added as a final checklist.

---

# Responsive Behaviour

## Desktop

Use:

- persistent sidebar;
- large main workspace;
- optional right inspector;
- list-first file browser.

## Tablet

Use:

- collapsible sidebar;
- main workspace;
- overlay or slide-in inspector;
- simplified columns.

## Mobile

Use:

- top app bar;
- navigation sheet or bottom navigation;
- compact file rows;
- details as a bottom sheet;
- contextual selection toolbar;
- clear upload action;
- simplified metadata;
- no desktop table squeezed onto a small screen.

Do not merely shrink the desktop interface.

---

# Final Deliverable Requirements

Produce a detailed, design-only frontend specification containing:

1. overall visual direction;
2. layout system;
3. navigation structure;
4. colour direction;
5. typography direction;
6. shape language;
7. spacing and density rules;
8. motion language;
9. screen-by-screen design;
10. component-by-component design;
11. state variations;
12. desktop, tablet, and mobile behaviour;
13. accessibility considerations;
14. concrete visual examples;
15. explicit anti-pattern checks;
16. a final design audit.

Do not include code.

Do not include implementation details.

Do not include framework choices.

Do not output generic mood-board language without translating it into specific interface decisions.

---

# Final Quality-Control Pass

Before finalising the design, review it against the following questions:

- Does this still feel easy to understand?
- Does it remain recognisably a file manager?
- Is the interface unique because of composition rather than gimmicks?
- Is Eunomia expressed through order rather than decoration?
- Are there too many cards?
- Are there too many rounded shapes?
- Is the sidebar visually generic?
- Is the search bar too dominant or too pill-like?
- Is motion restrained?
- Is every colour meaningful?
- Is the typography doing enough identity work?
- Is the file list efficient?
- Is the inspector too fragmented?
- Does the mobile version feel intentionally designed?
- Are there any common AI-generated UI patterns left?
- Could any section be simplified?
- Does every visible element have a clear purpose?

Revise the design until the answer to the final question is yes.

---

# Final Direction

The intended result is:

> A modern, calm, visually ordered file manager that feels immediately usable, quietly distinctive, and unmistakably shaped by the idea of Eunomia without becoming a mythology-themed interface.

The design should feel human, deliberate, and mature.

No code.
