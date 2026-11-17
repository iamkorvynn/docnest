# Roles in DocNest

DocNest models three roles per workspace. They are enforced in the UI by
`src/lib/permissions.ts` — one source of truth, covered by tests.

## The matrix

| Capability | Owner | Editor | Viewer |
|---|:---:|:---:|:---:|
| Read pages, search, export | ✅ | ✅ | ✅ |
| Create / edit / duplicate pages | ✅ | ✅ | ❌ |
| Trash / restore pages | ✅ | ✅ | ❌ |
| Change roles | ✅ | ❌ | ❌ |
| Rename / delete the workspace | ✅ | ❌ | ❌ |

## How to try them

The demo seeds three workspaces, one per role:

- **My Nest** — you are the **owner**. Everything works.
- **Product Team** — you are an **editor**. Edit freely, but the workspace
  menu disables role changes and workspace deletion.
- **Company Handbook** — you are a **viewer**. A banner explains what is
  blocked; the editor is read-only and creation buttons are disabled.

You can also switch your own role in any workspace from the workspace menu
(👤 Switch my role) — the UI updates immediately, which is the point of the
demo: the permission checks are real, the "user" is just you trying them on.

## What this is not

There is no server and no other user, so roles are a *demonstration* of the
permission model, not access control. A future backend would enforce the same
matrix server-side; the checks in `permissions.ts` are written to be reusable
there.
