import { describe, expect, it } from 'vitest'
import { parseBackup, serializeBackup } from '../backup'
import { seedState } from '../store'

describe('backup round-trip', () => {
  it('serialises and parses back to the same state', () => {
    const state = seedState()
    const text = serializeBackup(state)
    const parsed = parseBackup(text)
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.state.workspaces).toHaveLength(state.workspaces.length)
      expect(parsed.state.pages).toHaveLength(state.pages.length)
      expect(parsed.state.activePageId).toBe(state.activePageId)
    }
  })
  it('rejects non-JSON', () => {
    expect(parseBackup('hello')).toEqual({ ok: false, error: 'not-json' })
  })
  it('rejects files from other apps', () => {
    expect(parseBackup(JSON.stringify({ app: 'notion', version: 1, state: {} }))).toEqual({ ok: false, error: 'wrong-app' })
  })
  it('rejects unsupported versions', () => {
    expect(parseBackup(JSON.stringify({ app: 'docnest', version: 99, state: {} }))).toEqual({ ok: false, error: 'unsupported-version' })
  })
  it('rejects backups with a malformed state', () => {
    expect(parseBackup(JSON.stringify({ app: 'docnest', version: 1, state: { pages: [] } }))).toEqual({ ok: false, error: 'missing-state' })
  })
})
