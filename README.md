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
