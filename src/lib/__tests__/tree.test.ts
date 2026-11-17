import { describe, expect, it } from 'vitest'
import {
  duplicatePage,
  flattenTree,
  getChildren,
  getDescendants,
  getPagePath,
  nestPage,
  permanentlyDeletePage,
  restorePage,
  trashPage,
} from '../tree'
import type { Page } from '../../types'

const WS = 'ws-1'
function page(id: string, parentId: string | null, title = id, trashed = false): Page {
  return {
    id, workspaceId: WS, parentId, title, icon: '📄',
    blocks: [], favourite: false, trashed, createdAt: 1, updatedAt: 1,
  }
}

describe('getChildren / getDescendants / flattenTree', () => {
  it('returns direct children and the full subtree', () => {
    const pages = [page('a', null), page('b', 'a'), page('c', 'b'), page('d', null)]
    expect(getChildren(pages, 'a', WS).map((p) => p.id)).toEqual(['b'])
    expect(getDescendants(pages, 'a').map((p) => p.id)).toEqual(['b', 'c'])
    expect(flattenTree(pages, WS).map(({ page: p, depth }) => `${p.id}:${depth}`)).toEqual(['a:0', 'b:1', 'c:2', 'd:0'])
  })
  it('excludes trashed pages from the tree', () => {
    const pages = [page('a', null), page('b', 'a', 'b', true)]
    expect(getChildren(pages, 'a', WS)).toEqual([])
  })
})

describe('nestPage', () => {
  it('nests a page under a new parent', () => {
    const pages = [page('a', null), page('b', null)]
    const out = nestPage(pages, 'b', 'a')
    expect(out.find((p) => p.id === 'b')!.parentId).toBe('a')
  })
  it('refuses to nest a page under itself or its own descendant (cycle guard)', () => {
    const pages = [page('a', null), page('b', 'a'), page('c', 'b')]
    expect(nestPage(pages, 'a', 'c')).toEqual(pages)
    expect(nestPage(pages, 'a', 'a')).toEqual(pages)
  })
  it('refuses cross-workspace nesting', () => {
    const other: Page = { ...page('x', null), workspaceId: 'ws-2' }
    const pages = [page('a', null), other]
    expect(nestPage(pages, 'a', 'x')).toEqual(pages)
  })
  it('moves a page back to top level', () => {
    const pages = [page('a', null), page('b', 'a')]
    expect(nestPage(pages, 'b', null).find((p) => p.id === 'b')!.parentId).toBeNull()
  })
})

describe('trash / restore / permanent delete', () => {
  it('trashes a page and its whole subtree', () => {
    const pages = [page('a', null), page('b', 'a'), page('c', null)]
    const out = trashPage(pages, 'a')
    expect(out.filter((p) => p.trashed).map((p) => p.id)).toEqual(['a', 'b'])
  })
  it('restores a page and its subtree', () => {
    const pages = [page('a', null, 'a', true), page('b', 'a', 'b', true)]
    const out = restorePage(pages, 'a')
    expect(out.filter((p) => p.trashed)).toEqual([])
  })
  it('restores a page to top level when its parent is still trashed', () => {
    const pages = [page('a', null, 'a', true), page('b', 'a', 'b', true)]
    const out = restorePage(pages, 'b')
    expect(out.find((p) => p.id === 'b')!.parentId).toBeNull()
    expect(out.find((p) => p.id === 'b')!.trashed).toBe(false)
  })
  it('permanently deletes a page and its subtree', () => {
    const pages = [page('a', null), page('b', 'a'), page('c', null)]
    expect(permanentlyDeletePage(pages, 'a').map((p) => p.id)).toEqual(['c'])
  })
})

describe('duplicatePage', () => {
  it('deep-copies a page with its subtree under new ids', () => {
    const pages = [page('a', null, 'Guide'), page('b', 'a', 'Child')]
    const { pages: out, newPageId } = duplicatePage(pages, 'a')
    expect(out).toHaveLength(4)
    const copy = out.find((p) => p.id === newPageId)!
    expect(copy.title).toBe('Guide (copy)')
    expect(copy.parentId).toBeNull()
    const childCopy = out.find((p) => p.title === 'Child (copy)')!
    expect(childCopy.parentId).toBe(copy.id)
  })
  it('returns null for an unknown page', () => {
    expect(duplicatePage([page('a', null)], 'nope').newPageId).toBeNull()
  })
})

describe('getPagePath', () => {
  it('returns the breadcrumb from root to page', () => {
    const pages = [page('a', null), page('b', 'a'), page('c', 'b')]
    expect(getPagePath(pages, 'c').map((p) => p.id)).toEqual(['a', 'b', 'c'])
  })
})

describe('movePageToWorkspace', () => {
  it('moves a page and its subtree to another workspace as top-level', async () => {
    const { movePageToWorkspace } = await import('../tree')
    const pages = [page('a', null), page('b', 'a')]
    const out = movePageToWorkspace(pages, 'a', 'ws-2')
    expect(out.find((p) => p.id === 'a')!.workspaceId).toBe('ws-2')
    expect(out.find((p) => p.id === 'b')!.workspaceId).toBe('ws-2')
    expect(out.find((p) => p.id === 'a')!.parentId).toBeNull()
  })
  it('is a no-op for an unknown page', async () => {
    const { movePageToWorkspace } = await import('../tree')
    const pages = [page('a', null)]
    expect(movePageToWorkspace(pages, 'nope', 'ws-2')).toEqual(pages)
  })
})

describe('sibling sorting', () => {
  it('sorts siblings by title without breaking nesting', async () => {
    const { flattenTree, compareByTitle } = await import('../tree')
    const pages = [page('a', null, 'Zebra'), page('b', 'a', 'Apple'), page('c', null, 'Mango')]
    const out = flattenTree(pages, WS, compareByTitle)
    expect(out.map(({ page: p }) => p.id)).toEqual(['c', 'a', 'b'])
    expect(out.find((x) => x.page.id === 'b')!.depth).toBe(1)
  })
})
