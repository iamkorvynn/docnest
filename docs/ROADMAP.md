# Roadmap ideas

Things DocNest could grow into, in rough order of value. Nothing here is
promised or started.

1. **Drag-and-drop** — reorder pages in the tree and blocks in the editor
   (the lib already has `moveBlock` / `nestPage`; this is purely a UI lift).
2. **Image uploads** — store pasted/dropped images as data URLs in image
   blocks (the block type and Markdown export already support `src`).
3. **Real sharing** — a backend (Supabase fits the existing shape: workspaces
   → pages → blocks → versions map cleanly to tables) with real multi-user
   roles enforced server-side using the same matrix in `permissions.ts`.
4. **Offline-first sync** — CRDT or last-write-wins on the block list, with
   the JSON backup as the conflict-free fallback.
5. **More templates** — sprint retro, OKR planning, recipe book, travel plan.
6. **Command palette actions** — "new page", "go to page", "toggle theme"
   inside the existing search modal.
