# Decisions

Short ADRs for the choices that shape DocNest.

## 1. localStorage, no backend

*Context:* the brief asked for a standalone workspace app with no account.
*Decision:* `localStorage` is the only store; JSON backup is the portability
story. *Consequence:* data is per-browser. Sync/sharing need a backend later.

## 2. One state object, pure lib

*Context:* a workspace app has many cross-cutting operations (nesting, trash,
versions) that are easy to get wrong in component state.
*Decision:* a single `DocNestState` in `App`; all operations are pure
functions in `src/lib/` returning new arrays. *Consequence:* the logic is
unit-testable without React, and persistence is one `JSON.stringify`.

## 3. Snapshots are full copies, capped at 20 per page

*Context:* version history must never lose data on restore.
*Decision:* store the whole block list per snapshot; restore snapshots the
current version first. *Consequence:* storage use is bounded and restore is
non-destructive; diffs are computed on display (`diffSummary`).

## 4. Roles are a demo, not auth

*Context:* the brief wants roles that change the UI, with no backend.
*Decision:* the role switcher is in the workspace menu and the checks live in
`permissions.ts`. *Consequence:* anyone can switch roles — that is the demo.
A backend would enforce the same matrix server-side.

## 5. Minimal dependencies

*Context:* every dependency is a future maintenance cost.
*Decision:* React + Vite + TypeScript + Vitest only; no UI kit, no state
library, no date library. *Consequence:* the bundle is ~200 kB and the
dependency surface is tiny.
