import type { Page } from '../types'
import { uid } from './id'

export type PageCompare = (a: Page, b: Page) => number

export const compareByCreated: PageCompare = (a, b) => a.createdAt - b.createdAt
export const compareByTitle: PageCompare = (a, b) =>
  (a.title || 'Untitled').localeCompare(b.title || 'Untitled')
export const compareByRecent: PageCompare = (a, b) =>
  (b.lastOpenedAt ?? b.updatedAt) - (a.lastOpenedAt ?? a.updatedAt)

/** Direct children of a page (or top-level pages when parentId is null). */
export function getChildren(
  pages: Page[],
  parentId: string | null,
  workspaceId: string,
  compare: PageCompare = compareByCreated,
): Page[] {
  return pages
    .filter((p) => p.parentId === parentId && p.workspaceId === workspaceId && !p.trashed)
    .sort(compare)
}

/** All descendants of a page, depth-first. */
export function getDescendants(pages: Page[], pageId: string): Page[] {
  const out: Page[] = []
  const walk = (id: string) => {
    for (const child of pages.filter((p) => p.parentId === id)) {
      out.push(child)
      walk(child.id)
    }
  }
  walk(pageId)
  return out
}

/** True when `candidateId` is the page itself or one of its descendants. */
export function isDescendantOrSelf(pages: Page[], pageId: string, candidateId: string): boolean {
  if (pageId === candidateId) return true
  return getDescendants(pages, pageId).some((p) => p.id === candidateId)
}

/**
 * Nest `pageId` under `newParentId` (null = move to top level).
 * Refuses moves that would create a cycle or cross workspaces.
 */
export function nestPage(pages: Page[], pageId: string, newParentId: string | null): Page[] {
  const page = pages.find((p) => p.id === pageId)
  if (!page) return pages
  if (newParentId !== null) {
    const parent = pages.find((p) => p.id === newParentId)
    if (!parent || parent.workspaceId !== page.workspaceId) return pages
    if (isDescendantOrSelf(pages, pageId, newParentId)) return pages
  }
  return pages.map((p) => (p.id === pageId ? { ...p, parentId: newParentId, updatedAt: Date.now() } : p))
}

/** Move a page to a different workspace (becomes top-level there). */
export function movePageToWorkspace(pages: Page[], pageId: string, workspaceId: string): Page[] {
  const page = pages.find((p) => p.id === pageId)
  if (!page) return pages
  const descendants = getDescendants(pages, pageId)
  const ids = new Set([pageId, ...descendants.map((d) => d.id)])
  return pages.map((p) => (ids.has(p.id) ? { ...p, workspaceId, updatedAt: Date.now() } : p))
}

/** Send a page (and its subtree) to trash. */
export function trashPage(pages: Page[], pageId: string): Page[] {
  const ids = new Set([pageId, ...getDescendants(pages, pageId).map((d) => d.id)])
  return pages.map((p) => (ids.has(p.id) ? { ...p, trashed: true, updatedAt: Date.now() } : p))
}

/** Restore a trashed page. If its parent is trashed/missing, it comes back top-level. */
export function restorePage(pages: Page[], pageId: string): Page[] {
  const page = pages.find((p) => p.id === pageId)
  if (!page) return pages
  const parentOk =
    page.parentId === null ||
    pages.some((p) => p.id === page.parentId && !p.trashed)
  const restored = pages.map((p) =>
    p.id === pageId
      ? { ...p, trashed: false, parentId: parentOk ? p.parentId : null, updatedAt: Date.now() }
      : p,
  )
  // Restoring a parent also restores its whole subtree.
  const ids = new Set([pageId, ...getDescendants(restored, pageId).map((d) => d.id)])
  return restored.map((p) => (ids.has(p.id) ? { ...p, trashed: false } : p))
}

/** Permanently delete a page and its subtree. */
export function permanentlyDeletePage(pages: Page[], pageId: string): Page[] {
  const ids = new Set([pageId, ...getDescendants(pages, pageId).map((d) => d.id)])
  return pages.filter((p) => !ids.has(p.id))
}

/** Deep-copy a page (with its subtree) under a new title. Returns the new list + new root id. */
export function duplicatePage(pages: Page[], pageId: string): { pages: Page[]; newPageId: string | null } {
  const page = pages.find((p) => p.id === pageId)
  if (!page) return { pages, newPageId: null }
  const now = Date.now()
  const idMap = new Map<string, string>()
  const clone = (src: Page, parentId: string | null): Page => {
    const newId = uid()
    idMap.set(src.id, newId)
    return {
      ...src,
      id: newId,
      parentId,
      title: `${src.title} (copy)`,
      blocks: src.blocks.map((b) => ({ ...b, id: uid() })),
      favourite: false,
      trashed: false,
      createdAt: now,
      updatedAt: now,
    }
  }
  const copies: Page[] = []
  const walk = (src: Page, parentId: string | null) => {
    const copy = clone(src, parentId)
    copies.push(copy)
    for (const child of pages.filter((p) => p.parentId === src.id)) walk(child, copy.id)
  }
  walk(page, page.parentId)
  return { pages: [...pages, ...copies], newPageId: copies[0]?.id ?? null }
}

/** Breadcrumb path from the workspace root down to a page. */
export function getPagePath(pages: Page[], pageId: string): Page[] {
  const path: Page[] = []
  let current = pages.find((p) => p.id === pageId)
  const seen = new Set<string>()
  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    path.unshift(current)
    current = current.parentId ? pages.find((p) => p.id === current!.parentId) : undefined
  }
  return path
}

/** Flatten a workspace's live pages into a depth-annotated list for rendering the tree.
 *  Sorting applies within each sibling group, so nesting is never broken. */
export function flattenTree(
  pages: Page[],
  workspaceId: string,
  compare: PageCompare = compareByCreated,
): { page: Page; depth: number }[] {
  const out: { page: Page; depth: number }[] = []
  const walk = (parentId: string | null, depth: number) => {
    for (const child of getChildren(pages, parentId, workspaceId, compare)) {
      out.push({ page: child, depth })
      walk(child.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}
