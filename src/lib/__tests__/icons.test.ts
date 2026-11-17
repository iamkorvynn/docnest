import { describe, expect, it } from 'vitest'
import { nextIcon, PAGE_ICONS } from '../icons'

describe('page icons', () => {
  it('cycles forward and wraps around', () => {
    expect(nextIcon('📄')).toBe('📝')
    expect(nextIcon(PAGE_ICONS[PAGE_ICONS.length - 1])).toBe(PAGE_ICONS[0])
  })
  it('restarts from the first icon for unknown input', () => {
    expect(nextIcon('🦄')).toBe('📄')
  })
  it('has unique icons only', () => {
    expect(new Set(PAGE_ICONS).size).toBe(PAGE_ICONS.length)
  })
})
