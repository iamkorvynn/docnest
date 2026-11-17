# 🪹 DocNest

![CI](https://github.com/iamkorvynn/docnest/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

**DocNest is a local-first workspace app in the spirit of Notion — built clean-room, with its own name, UI and twist.**

No account. No backend. No tracking. Your workspaces, pages and version history live in your browser's `localStorage`, and you can take them with you as Markdown or a JSON backup any time.

> A doc is a nest: small pieces, woven together, that hold something bigger.

## Features

- **Workspaces** — create, rename, delete and switch between workspaces; each has its own colour and icon.
- **Block editor** — paragraph, H1/H2/H3, bulleted and numbered lists, to-do checkboxes, code blocks, quotes, callouts, dividers and image placeholders. Press `Enter` to split a block, `Backspace` at the start to merge, `Alt+↑/↓` to move it, or type `/` to turn it into any other block type.
- **Nested pages** — nest any page under another from the sidebar menu, drag-free. Collapse, expand, sort (created / A–Z / recent).
- **Sidebar page tree** — favourites, recent pages, page counts, and a context menu per page (rename, change icon, duplicate, nest, move to another workspace, trash).
- **Full-text search** — `⌘/Ctrl+K` searches titles and block content across all workspaces, title matches first, with highlighted matches and excerpts. Filter to the current workspace with one checkbox.
- **Templates** — blank, meeting notes, project plan, reading list, daily journal, weekly review and book notes, each with a live preview.
- **Trash + restore** — trashed pages (and their subtrees) can be restored, restored all at once, or deleted forever.
- **Export** — any page as Markdown (download or copy to clipboard), a whole workspace as one Markdown file, or everything as a JSON backup you can restore later.
- **Deep links** — every page has a `#/page/<id>` link; copy it from the top bar, and back/forward in the browser navigates between pages.
- **Dark mode** — persisted, and follows your system preference on first run.
- **Reading progress bar, word count, reading time, to-do progress, created/edited dates** on every page.

## The twist: Focus mode + version history

Most note apps make you choose between writing and organising. DocNest does both, and the twist is that **nothing you write is ever really lost, and nothing distracts you while you write it**:

- **Focus mode** (`⌘/Ctrl+Shift+F` or the `◎ Focus` button) — the whole screen becomes just your doc. No sidebar, no buttons, just words and a live word count. `Esc` brings you back.
- **Version history** (`🕘 History`) — a timeline of snapshots for the current doc. DocNest snapshots automatically when you leave a changed page and every 5 minutes while you edit, and you can snapshot any time with `⌘/Ctrl+S` or the 📸 button. Each snapshot shows what changed vs the previous one (`+2 blocks`, `title changed`), and restoring one snapshots your current version first — so restore is never destructive.

## Roles — they actually change the UI

Every workspace has a role for you: **owner**, **editor** or **viewer**. Switch it from the workspace menu (👤 Switch my role) and watch the app change:

| | Owner | Editor | Viewer |
|---|:---:|:---:|:---:|
| Read, search, export | ✅ | ✅ | ✅ |
| Create / edit / duplicate pages | ✅ | ✅ | ❌ |
| Trash / restore pages | ✅ | ✅ | ❌ |
| Change roles | ✅ | ❌ | ❌ |
| Rename / delete the workspace | ✅ | ❌ | ❌ |

Viewers see a read-only banner explaining exactly what is blocked. The demo ships with three workspaces so you can feel all three roles at once: **My Nest** (owner), **Product Team** (editor) and **Company Handbook** (viewer).

## Keyboard shortcuts

| Keys | Does |
|---|---|
| `⌘/Ctrl + K` | Search across all docs |
| `⌘/Ctrl + Shift + F` | Toggle focus mode |
| `⌘/Ctrl + S` | Save a version snapshot |
| `?` | Show all shortcuts |
| `Enter` | Split the current block |
| `Backspace` (at block start) | Merge with the previous block |
| `Alt + ↑ / ↓` | Move the current block |
| `Shift + Enter` | New line inside a code block |
| `Esc` | Close dialogs, menus and focus mode |
| `/` (at block start) | Turn the block into another type |

## How to run

```bash
npm install   # install dependencies
npm run dev   # start the dev server (http://localhost:5173)
npm run build # typecheck + production build into dist/
npm run preview # serve the production build (http://localhost:4173)
npm test      # run the Vitest suite
npm run typecheck # tsc --noEmit
npm run smoke # build + serve + verify the app shell and bundle
```

Requires Node 24 (see `.nvmrc`). No environment variables, no secrets, no backend to configure — just open the page and write.

## Data & privacy

- Everything is stored under the `docnest-state-v1` key in `localStorage`. Clearing browser data for the site wipes it — export a backup first.
- **Backup / Restore** (sidebar footer): download a JSON file with every workspace, page and snapshot, and restore it later. Backups are validated on import (wrong app, wrong version or malformed state are rejected with a clear message).
- **Reset demo data** (sidebar footer): restores the three seeded workspaces.
- Nothing leaves your machine unless you export it. There is no analytics, no account and no server call.

## Project structure

```
src/
  App.tsx            # state, persistence, shortcuts, wiring
  types.ts           # Block, Page, Workspace, Role, VersionSnapshot
  index.css          # theme (light/dark), editor, sidebar, modals
  main.tsx           # React entry point
  lib/
    blocks.ts        # block model: create/split/merge/move/toggle…
    tree.ts          # page tree: nest/trash/restore/duplicate/sort
    search.ts        # full-text search with ranking + excerpts
    permissions.ts   # owner/editor/viewer capability checks
    markdown.ts      # Markdown export for blocks + pages
    export.ts        # whole-workspace Markdown export
    versions.ts      # snapshots, pruning, restore, diff summary
    templates.ts     # page templates
    store.ts         # localStorage load/save + demo seed data
    backup.ts        # JSON backup serialise/parse + validation
    links.ts         # #/page/<id> deep links
    dates.ts         # relative time ("2h ago")
    icons.ts         # page icon set + cycling
    stats.ts         # workspace aggregates
  components/
    Sidebar.tsx  Editor.tsx  BlockRow.tsx  TopBar.tsx  SearchModal.tsx
    TemplatesModal.tsx  VersionHistory.tsx  FocusMode.tsx  TrashPanel.tsx
    WorkspaceSwitcher.tsx  RoleBadge.tsx  ContextMenu.tsx  ConfirmDialog.tsx
    ShortcutsModal.tsx  Highlight.tsx  EmptyState.tsx  Toast.tsx
  lib/__tests__/    # Vitest suites for every lib module
```

## Tech & decisions

- **Vite 6 + React 18 + TypeScript (strict)** — minimal dependencies on purpose: `react`, `react-dom`, `vite`, `typescript`, `vitest`. No UI kit, no state library; the state is one plain object in `App` persisted with an effect.
- **Local-first, not offline-first** — there is no sync layer at all. That is a deliberate scope choice: the app is fully usable with zero setup, and the JSON backup is the portability story.
- **Roles are a demo of the permission model**, not real multi-user auth — the role switcher lives in the workspace menu so you can try every permission set in one session. The checks themselves (`src/lib/permissions.ts`) are real and unit-tested; a future backend would enforce the same matrix server-side.
- **Snapshots are full copies, not diffs** — simple, robust, and cheap at this scale; capped at 20 per page.
