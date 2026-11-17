# Contributing to DocNest

## Setup

```bash
npm install
npm run dev
```

## Rules

- **Small, real commits** — one file or one feature per commit, no junk files.
- **Tests for lib changes** — every function in `src/lib/` has a Vitest suite in
  `src/lib/__tests__/`. Add or extend tests with the behaviour you change.
- **Keep it dependency-light** — the stack is intentionally minimal
  (React + Vite + TypeScript + Vitest). Don't add a dependency for something
  a 20-line function can do.
- **No secrets, ever** — nothing in this repo needs a credential. Don't add one.
- **Check before you push**: `npm run typecheck && npm test && npm run build`.

## Where things live

See `ARCHITECTURE.md` for the module map and data flow.
