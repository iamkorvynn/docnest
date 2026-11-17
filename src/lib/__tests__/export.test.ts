import { describe, expect, it } from 'vitest'
import { workspaceFilename, workspaceToMarkdown } from '../export'
import type { Page, Workspace } from '../../types'

const WS: Workspace = { id: 'ws', name: 'My Nest', icon: '🪹', color: '#000', role: 'owner', createdAt: 1 }
function page(id: string, parentId: string | null, title: string, text: string): Page {
  return {
    id, workspaceId: 'ws', parentId, title, icon: '📄',
    blocks: [{ id: `b-${id}`, type: 'paragraph', text }],
    favourite: false, trashed: false, createdAt: 1, updatedAt: 1,
  }
}

describe('workspaceToMarkdown', () => {
  it('combines pages in tree order with the workspace title on top', () => {
    const pages = [page('a', null, 'Guide', 'intro'), page('b', 'a', 'Child', 'detail'), page('c', null, 'Other', 'more')]
    const md = workspaceToMarkdown(WS, pages)
    expect(md.startsWith('# My Nest\n')).toBe(true)
    expect(md).toContain('## Guide')
    expect(md).toContain('### Child')
    expect(md.indexOf('Guide')).toBeLessThan(md.indexOf('Child'))
    expect(md.indexOf('Child')).toBeLessThan(md.indexOf('Other'))
  })
  it('skips trashed pages', () => {
    const pages = [page('a', null, 'Keep', 'yes'), { ...page('b', null, 'Gone', 'no'), trashed: true }]
    const md = workspaceToMarkdown(WS, pages)
    expect(md).toContain('Keep')
    expect(md).not.toContain('Gone')
  })
  it('slugifies the filename', () => {
    expect(workspaceFilename(WS)).toBe('my-nest.md')
  })
})
