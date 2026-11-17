import type { Role } from '../types'

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: 'Full control — edit, manage roles, delete the workspace.',
  editor: 'Can create and edit pages, but cannot change roles or delete the workspace.',
  viewer: 'Read-only — can browse and search, but cannot edit anything.',
}

/** Can this role edit page content? */
export function canEdit(role: Role): boolean {
  return role === 'owner' || role === 'editor'
}

/** Can this role create new pages? */
export function canCreatePage(role: Role): boolean {
  return canEdit(role)
}

/** Can this role delete or trash pages? */
export function canDeletePage(role: Role): boolean {
  return canEdit(role)
}

/** Can this role change other people's roles? */
export function canManageRoles(role: Role): boolean {
  return role === 'owner'
}

/** Can this role delete or rename the workspace? */
export function canManageWorkspace(role: Role): boolean {
  return role === 'owner'
}

/** Can this role export a doc as Markdown? (Everyone can — reading is free.) */
export function canExport(_role: Role): boolean {
  return true
}

/** Human-readable list of what a role is blocked from doing. */
export function blockedActions(role: Role): string[] {
  if (role === 'owner') return []
  if (role === 'editor') return ['Change roles', 'Delete the workspace']
  return ['Edit pages', 'Create pages', 'Delete pages', 'Change roles', 'Delete the workspace']
}
