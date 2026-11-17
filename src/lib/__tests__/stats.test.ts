import { describe, expect, it } from 'vitest'
import { workspaceStats } from '../stats'
import type { Page, Workspace } from '../../types'

const WS: Workspace = { id: 'ws', name: 'W', icon: '📄', color: '#000', role: 'owner', createdAt: 1 }
function page(id: string, blocks: Page['blocks'], extra: Partial<Page> = {}): Page {
  return { id, workspaceId: 'ws', parentId: null, title: id, icon: '📄', blocks, favourite: false, trashed: false, createdAt: 1, updatedAt: 1, ...extra }
}

describe('workspaceStats', () => {
  it('aggregates pages, words and todo progress', () => {
    const pages = [
      page('a', [
        { id: '1', type: 'paragraph', text: 'hello world' },
        { id: '2', type: 'todo', text: 'done', checked: true },
        { id: '3', type: 'todo', text: 'open', checked: false },
      ], { favourite: true }),
      page('b', [{ id: '4', type: 'paragraph', text: 'three more words' }]),
      page('c', [], { trashed: true }),
    ]
    const stats = workspaceStats(WS, pages)
    expect(stats.pages).toBe(2)
    expect(stats.words).toBe(7) // hello world + done + open + three more words
    expect(stats.todosTotal).toBe(2)
    expect(stats.todosDone).toBe(1)
    expect(stats.favourites).toBe(1)
    expect(stats.trashed).toBe(1)
  })
  it('returns zeros for an empty workspace', () => {
    expect(workspaceStats(WS, [])).toEqual({ pages: 0, words: 0, todosTotal: 0, todosDone: 0, favourites: 0, trashed: 0 })
  })
})
