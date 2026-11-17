import { describe, expect, it } from 'vitest'
import { pageIdFromHash, pageLink } from '../links'

describe('deep links', () => {
  it('builds a #/page/ link', () => {
    expect(pageLink('abc123')).toBe('#/page/abc123')
  })
  it('parses a page id back out of the hash', () => {
    expect(pageIdFromHash('#/page/abc123')).toBe('abc123')
    expect(pageIdFromHash('#/page/m1x-3d_9')).toBe('m1x-3d_9')
  })
  it('returns null for anything else', () => {
    expect(pageIdFromHash('')).toBeNull()
    expect(pageIdFromHash('#/other/abc')).toBeNull()
    expect(pageIdFromHash('#/page/')).toBeNull()
    expect(pageIdFromHash('#/page/a b')).toBeNull()
  })
})
