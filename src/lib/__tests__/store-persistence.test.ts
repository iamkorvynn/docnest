import { describe, expect, it, vi, beforeEach } from 'vitest'
import { loadState, saveState, STORAGE_KEY } from '../store'

/** Minimal in-memory localStorage stand-in for the node test env. */
function mockStorage() {
  const data = new Map<string, string>()
  return {
    getItem: vi.fn((k: string) => data.get(k) ?? null),
    setItem: vi.fn((k: string, v: string) => { data.set(k, v) }),
    removeItem: vi.fn((k: string) => { data.delete(k) }),
    clear: vi.fn(() => data.clear()),
    key: vi.fn(),
    length: 0,
  }
}

describe('store persistence', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', mockStorage())
  })

  it('round-trips state through save/load', () => {
    const state = loadState()
    state.workspaces[0].name = 'Renamed Nest'
    saveState(state)
    const loaded = loadState()
    expect(loaded.workspaces[0].name).toBe('Renamed Nest')
    expect(loaded.pages.length).toBe(state.pages.length)
    expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String))
  })

  it('seeds demo data when storage is empty', () => {
    const state = loadState()
    expect(state.workspaces).toHaveLength(3)
    expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY)
  })
})
