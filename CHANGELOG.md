# Changelog

All notable changes to DocNest are documented here.

## [0.1.0] — 2026-11-18

First release — the complete local-first workspace app.

### Added
- Workspaces (create / rename / delete / switch / colour) with per-workspace roles
- Block editor: paragraph, H1–H3, bulleted + numbered lists, to-dos, code, quote, callout, divider, image placeholder
- Slash (`/`) menu, Enter-split, Backspace-merge, Alt+↑/↓ move, per-block type menu, duplicate, copy-as-Markdown
- Nested pages with cycle-guarded nesting, collapse/expand, sorting, favourites, recent
- Full-text search (⌘/Ctrl+K) with ranking, excerpts and highlighted matches
- Templates: blank, meeting notes, project plan, reading list, daily journal, weekly review, book notes
- Trash + restore, restore-all, delete-forever
- Markdown export (page, workspace, copy-to-clipboard) and JSON backup / restore
- Focus mode (distraction-free writing) and per-doc version history timeline with snapshots, diff summaries and non-destructive restore
- Roles: owner / editor / viewer with a switcher that changes what the UI allows
- Deep links (`#/page/<id>`), back/forward navigation, document-title sync
- Dark mode (persisted, follows system preference), reading progress bar, word count, to-do progress
- 97 unit tests (Vitest) covering the block model, tree, search, permissions, Markdown, versions, backup, links, icons, dates, stats, templates and store
- CI (GitHub Actions: typecheck + test + build), smoke-test script, MIT license

## [Unreleased]

Ideas queued for later (see `docs/ROADMAP.md` for the full list):
- Real-time collaboration and sharing (needs a backend; roles already model the permissions)
- Drag-and-drop reordering of pages and blocks
- Image uploads stored as data URLs
