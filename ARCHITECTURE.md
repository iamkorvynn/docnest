# DocNest architecture

## Principles

1. **One plain state object.** The whole app is a single `DocNestState`
   (`workspaces`, `pages`, `versions`, `activeWorkspaceId`, `activePageId`)
   held in `App` with `useState`. Every mutation builds a new object; nothing
   is mutated in place. That makes persistence trivial (one `JSON.stringify`
   per change) and the logic easy to test without React.
2. **Pure lib, thin UI.** Everything that can be a pure function lives in
   `src/lib/` and is covered by Vitest: the block model, the page tree,
   search, permissions, Markdown export, snapshots, backup parsing. Components
   render state and call lib functions; they own no business rules.
3. **Local-first.** `localStorage` is the only store. There is no network
   code anywhere in the app except the Vite dev server itself.
4. **Roles are data, not branches.** Components ask `canEdit(role)` etc.
   instead of checking `role === 'viewer'` inline, so the permission matrix
   has exactly one source of truth (`src/lib/permissions.ts`).

## Module map

| Module | Owns | Depends on |
|---|---|---|
| `types.ts` | `Block`, `Page`, `Workspace`, `Role`, `VersionSnapshot`, `DocNestState` | — |
| `lib/blocks.ts` | Block create/insert/split/merge/delete/toggle/move/duplicate, word count | `types`, `id` |
| `lib/tree.ts` | Page tree: children, descendants, nest (cycle-guarded), trash/restore, duplicate, path, sibling sorting | `types`, `id` |
| `lib/search.ts` | Full-text search, title-first scoring, excerpts | `types`, `blocks` |
| `lib/permissions.ts` | Capability checks + role labels/descriptions | `types` |
| `lib/markdown.ts` | Block/page → Markdown, filename slug | `types` |
| `lib/export.ts` | Whole-workspace Markdown in tree order | `types`, `markdown`, `tree` |
| `lib/versions.ts` | Snapshots, 20-per-page pruning, restore, diff summary | `types`, `id` |
| `lib/templates.ts` | The seven page templates | `blocks` |
| `lib/store.ts` | `localStorage` load/save, demo seed (3 workspaces, 3 roles) | `types`, `blocks`, `versions` |
| `lib/backup.ts` | JSON backup serialise/parse + validation | `types` |
| `lib/links.ts` | `#/page/<id>` deep links | — |
| `lib/dates.ts` | Relative time | — |
| `lib/icons.ts` | Page icon set + cycling | — |
| `lib/stats.ts` | Workspace aggregates (pages/words/todos) | `types`, `blocks` |

Components are organised by screen area: `Sidebar` (tree + switcher),
`Editor` + `BlockRow` (editing), `TopBar` (actions), and one component per
overlay (`SearchModal`, `TemplatesModal`, `VersionHistory`, `FocusMode`,
`TrashPanel`, `ShortcutsModal`, `ConfirmDialog`, `ContextMenu`).
