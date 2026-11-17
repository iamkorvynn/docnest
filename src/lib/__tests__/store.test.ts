import { describe, expect, it } from 'vitest'
import { seedState, STORAGE_KEY } from '../store'

describe('seedState', () => {
  it('seeds three workspaces, one per role', () => {
    const state = seedState()
    expect(state.workspaces).toHaveLength(3)
    expect(state.workspaces.map((w) => w.role).sort()).toEqual(['editor', 'owner', 'viewer'])
    expect(state.workspaces.map((w) => w.name)).toEqual(['My Nest', 'Product Team', 'Company Handbook'])
  })
  it('seeds pages in every workspace, with nesting and a favourite', () => {
    const state = seedState()
    expect(state.pages.length).toBeGreaterThanOrEqual(7)
    const nested = state.pages.filter((p) => p.parentId !== null)
    expect(nested.length).toBeGreaterThanOrEqual(3)
    expect(state.pages.some((p) => p.favourite)).toBe(true)
  })
  it('seeds one version snapshot so history is never empty', () => {
    const state = seedState()
    expect(state.versions).toHaveLength(1)
    expect(state.versions[0].pageId).toBe(state.activePageId)
  })
  it('starts on the owner workspace with the welcome page active', () => {
    const state = seedState()
    const active = state.workspaces.find((w) => w.id === state.activeWorkspaceId)!
    expect(active.role).toBe('owner')
    const page = state.pages.find((p) => p.id === state.activePageId)!
    expect(page.title).toBe('Welcome to DocNest')
  })
  it('uses the stable storage key', () => {
    expect(STORAGE_KEY).toBe('docnest-state-v1')
  })
})
