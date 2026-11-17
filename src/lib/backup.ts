import type { DocNestState } from '../types'

export const BACKUP_VERSION = 1

export interface BackupFile {
  app: 'docnest'
  version: number
  exportedAt: string
  state: DocNestState
}

/** Serialise the whole app state as a portable backup file. */
export function serializeBackup(state: DocNestState): string {
  const file: BackupFile = {
    app: 'docnest',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  }
  return JSON.stringify(file, null, 2)
}

export type BackupError =
  | 'not-json'
  | 'wrong-app'
  | 'unsupported-version'
  | 'missing-state'

/** Parse and validate a backup file. Returns the state or an error code. */
export function parseBackup(text: string): { ok: true; state: DocNestState } | { ok: false; error: BackupError } {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'not-json' }
  }
  if (typeof parsed !== 'object' || parsed === null) return { ok: false, error: 'wrong-app' }
  const file = parsed as Partial<BackupFile>
  if (file.app !== 'docnest') return { ok: false, error: 'wrong-app' }
  if (file.version !== BACKUP_VERSION) return { ok: false, error: 'unsupported-version' }
  const state = file.state
  if (
    !state ||
    !Array.isArray(state.workspaces) ||
    !Array.isArray(state.pages) ||
    !Array.isArray(state.versions) ||
    typeof state.activeWorkspaceId !== 'string'
  ) {
    return { ok: false, error: 'missing-state' }
  }
  return { ok: true, state }
}

export const BACKUP_ERROR_MESSAGES: Record<BackupError, string> = {
  'not-json': 'That file is not valid JSON.',
  'wrong-app': 'That backup was not made by DocNest.',
  'unsupported-version': 'That backup is from a newer DocNest version.',
  'missing-state': 'That backup is missing workspace data.',
}
