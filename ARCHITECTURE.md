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
