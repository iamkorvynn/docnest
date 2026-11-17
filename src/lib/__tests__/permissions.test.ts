import { describe, expect, it } from 'vitest'
import {
  blockedActions,
  canCreatePage,
  canDeletePage,
  canEdit,
  canExport,
  canManageRoles,
  canManageWorkspace,
  ROLE_DESCRIPTIONS,
} from '../permissions'
import type { Role } from '../../types'

const ROLES: Role[] = ['owner', 'editor', 'viewer']

describe('role permissions', () => {
  it('owners can do everything', () => {
    expect(canEdit('owner')).toBe(true)
    expect(canCreatePage('owner')).toBe(true)
    expect(canDeletePage('owner')).toBe(true)
    expect(canManageRoles('owner')).toBe(true)
    expect(canManageWorkspace('owner')).toBe(true)
    expect(blockedActions('owner')).toEqual([])
  })
  it('editors can edit but cannot manage roles or the workspace', () => {
    expect(canEdit('editor')).toBe(true)
    expect(canCreatePage('editor')).toBe(true)
    expect(canDeletePage('editor')).toBe(true)
    expect(canManageRoles('editor')).toBe(false)
    expect(canManageWorkspace('editor')).toBe(false)
    expect(blockedActions('editor')).toContain('Change roles')
    expect(blockedActions('editor')).toContain('Delete the workspace')
  })
  it('viewers are read-only', () => {
    expect(canEdit('viewer')).toBe(false)
    expect(canCreatePage('viewer')).toBe(false)
    expect(canDeletePage('viewer')).toBe(false)
    expect(canManageRoles('viewer')).toBe(false)
    expect(canManageWorkspace('viewer')).toBe(false)
    expect(blockedActions('viewer')).toContain('Edit pages')
  })
  it('everyone can export (reading is free)', () => {
    for (const role of ROLES) expect(canExport(role)).toBe(true)
  })
  it('every role has a description', () => {
    for (const role of ROLES) expect(ROLE_DESCRIPTIONS[role].length).toBeGreaterThan(10)
  })
})
