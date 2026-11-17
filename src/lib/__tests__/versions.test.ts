import { describe, expect, it } from 'vitest'
import { addSnapshot, createSnapshot, pageDiffersFromLatest, restoreSnapshot, snapshotsForPage } from '../versions'
import type { Page, VersionSnapshot } from '../../types'

function page(title = 'Doc', texts: string[] = ['hello']): Page {
  return {
    id: 'p1', workspaceId: 'ws', parentId: null, title, icon: '📄',
    blocks: texts.map((t, i) => ({ id: `b${i}`, type: 'paragraph' as const, text: t })),
    favourite: false, trashed: false, createdAt: 1, updatedAt: 1,
  }
}

describe('createSnapshot / snapshotsForPage', () => {
  it('captures a deep copy of title and blocks', () => {
    const p = page()
    const snap = createSnapshot(p, 'v1')
    p.blocks[0].text = 'changed'
    expect(snap.blocks[0].text).toBe('hello')
    expect(snap.pageId).toBe('p1')
    expect(snap.label).toBe('v1')
  })
  it('lists snapshots newest first', () => {
    const a: VersionSnapshot = { ...createSnapshot(page(), 'old'), createdAt: 100 }
    const c: VersionSnapshot = { ...createSnapshot(page(), 'new'), createdAt: 300 }
    const other: VersionSnapshot = { ...createSnapshot({ ...page(), id: 'p2' }, 'other'), createdAt: 200 }
    expect(snapshotsForPage([a, c, other], 'p1').map((s) => s.label)).toEqual(['new', 'old'])
  })
})

describe('addSnapshot pruning', () => {
  it('keeps at most 20 snapshots per page', () => {
    let versions: VersionSnapshot[] = []
    for (let i = 0; i < 25; i++) {
      versions = addSnapshot(versions, { ...createSnapshot(page(), `v${i}`), createdAt: i })
    }
    expect(snapshotsForPage(versions, 'p1')).toHaveLength(20)
    expect(snapshotsForPage(versions, 'p1')[0].label).toBe('v24')
  })
})

describe('restoreSnapshot', () => {
  it('restores title and blocks, keeps the page id', () => {
    const p = page('New title', ['new text'])
    const snap = createSnapshot(page('Old title', ['old text']), 'v1')
    const out = restoreSnapshot(p, snap)
    expect(out.id).toBe('p1')
    expect(out.title).toBe('Old title')
    expect(out.blocks[0].text).toBe('old text')
  })
  it('refuses snapshots from another page', () => {
    const p = page()
    const snap = createSnapshot({ ...page(), id: 'p2' }, 'v1')
    expect(restoreSnapshot(p, snap)).toBe(p)
  })
})

describe('pageDiffersFromLatest', () => {
  it('reports no diff right after snapshotting, and a diff after any edit', () => {
    const p = page()
    expect(pageDiffersFromLatest(p, [])).toBe(true)
    const versions = addSnapshot([], createSnapshot(p))
    expect(pageDiffersFromLatest(p, versions)).toBe(false)
    expect(pageDiffersFromLatest({ ...p, title: 'Renamed' }, versions)).toBe(true)
    expect(pageDiffersFromLatest({ ...p, blocks: [{ id: 'b0', type: 'h1', text: 'hello' }] }, versions)).toBe(true)
  })
})

describe('deleteSnapshot', () => {
  it('removes only the named snapshot', async () => {
    const { deleteSnapshot } = await import('../versions')
    const a = createSnapshot(page(), 'a')
    const b = createSnapshot(page(), 'b')
    const out = deleteSnapshot([a, b], a.id)
    expect(out).toEqual([b])
    expect(deleteSnapshot([a, b], 'missing')).toEqual([a, b])
  })
})
