import { describe, expect, it } from 'vitest'
import { relativeTime } from '../dates'

const NOW = new Date('2026-11-18T12:00:00Z').getTime()

describe('relativeTime', () => {
  it('says just now for the last few seconds', () => {
    expect(relativeTime(NOW - 5_000, NOW)).toBe('just now')
    expect(relativeTime(NOW, NOW)).toBe('just now')
  })
  it('uses seconds, minutes, hours, days and weeks', () => {
    expect(relativeTime(NOW - 45_000, NOW)).toBe('45s ago')
    expect(relativeTime(NOW - 5 * 60_000, NOW)).toBe('5m ago')
    expect(relativeTime(NOW - 2 * 3_600_000, NOW)).toBe('2h ago')
    expect(relativeTime(NOW - 3 * 86_400_000, NOW)).toBe('3d ago')
    expect(relativeTime(NOW - 14 * 86_400_000, NOW)).toBe('2w ago')
  })
  it('falls back to a date for old timestamps', () => {
    expect(relativeTime(NOW - 60 * 86_400_000, NOW)).toBe(new Date(NOW - 60 * 86_400_000).toLocaleDateString())
  })
  it('never goes negative for future timestamps', () => {
    expect(relativeTime(NOW + 60_000, NOW)).toBe('just now')
  })
})
