# Testing DocNest

## Run

```bash
npm test          # single run (Vitest)
npm run test:watch # watch mode
npm run typecheck # tsc --noEmit
npm run smoke     # build + preview + verify the served app
```

## What is tested

Every module in `src/lib/` has a suite in `src/lib/__tests__/`:

- `blocks` — insert / split / merge / delete / toggle / move / duplicate / word count
- `tree` — nest (incl. cycle guard), trash / restore, duplicate, sibling sorting
- `search` — ranking, case-insensitivity, trash exclusion, workspace scope
- `permissions` — the full owner / editor / viewer matrix
- `markdown` / `export` — block, page and workspace Markdown output
- `versions` — snapshots, 20-per-page pruning, restore, diff summary
- `templates` — all seven templates, fresh ids per call
- `backup` — round-trip plus rejection of bad files
- `links` — deep-link build / parse
- `icons` / `dates` / `stats` — cycling, relative time, aggregates
- `store` / `store-persistence` — seed data and localStorage round-trip

## What is not tested

Components are not unit-tested (no jsdom in the suite on purpose — the app's
logic lives in `lib`, which is fully testable in node). The smoke script and a
manual pass over the dev server cover the UI: create a page, nest it, search,
switch roles, restore a snapshot, export Markdown.
