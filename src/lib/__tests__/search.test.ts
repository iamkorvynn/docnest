import { describe, expect, it } from 'vitest'
import { searchPages } from '../search'
import type { Page } from '../../types'

function page(id: string, title: string, texts: string[], extra: Partial<Page> = {}): Page {
  return {
    id, workspaceId: 'ws-1', parentId: null, title, icon: '📄',
    blocks: texts.map((t, i) => ({ id: `b${i}`, type: 'paragraph' as const, text: t })),
    favourite: false, trashed: false, createdAt: 1, updatedAt: 1, ...extra,
  }
}

describe('searchPages', () => {
  const pages = [
    page('1', 'Shazam-lite spec', ['fingerprint audio with hashes so shazam can match it']),
    page('2', 'Shopping list', ['buy milk and bread']),
    page('3', 'Audio notes', ['the shazam idea came from a podcast']),
    page('4', 'Old draft', ['shazam everywhere'], { trashed: true }),
  ]

  it('returns nothing for an empty query', () => {
    expect(searchPages(pages, '   ')).toEqual([])
  })
  it('finds title and content matches, title first', () => {
    const out = searchPages(pages, 'shazam')
    expect(out.map((r) => r.page.id)).toEqual(['1', '3'])
    expect(out[0].matchIn).toBe('both')
    expect(out[1].matchIn).toBe('content')
  })
  it('is case-insensitive', () => {
    expect(searchPages(pages, 'SHAZAM').map((r) => r.page.id)).toEqual(['1', '3'])
  })
  it('never returns trashed pages', () => {
    expect(searchPages(pages, 'everywhere')).toEqual([])
  })
  it('scopes to one workspace when asked', () => {
    const other = page('5', 'Shazam clone', ['x'], { workspaceId: 'ws-2' })
    expect(searchPages([...pages, other], 'shazam', 'ws-1').map((r) => r.page.id)).toEqual(['1', '3'])
    expect(searchPages([...pages, other], 'shazam', 'ws-2').map((r) => r.page.id)).toEqual(['5'])
  })
  it('includes an excerpt around the content match', () => {
    const out = searchPages(pages, 'milk')
    expect(out[0].excerpt).toContain('milk')
  })
})
