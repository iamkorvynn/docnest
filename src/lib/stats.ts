import type { Page, Workspace } from '../types'
import { countWords } from './blocks'

export interface WorkspaceStats {
  pages: number
  words: number
  todosTotal: number
  todosDone: number
  favourites: number
  trashed: number
}

/** Aggregate stats for one workspace (live pages only, except the trash count). */
export function workspaceStats(workspace: Workspace, pages: Page[]): WorkspaceStats {
  const live = pages.filter((p) => p.workspaceId === workspace.id && !p.trashed)
  const todos = live.flatMap((p) => p.blocks.filter((b) => b.type === 'todo'))
  return {
    pages: live.length,
    words: live.reduce((sum, p) => sum + countWords(p.blocks), 0),
    todosTotal: todos.length,
    todosDone: todos.filter((t) => t.checked).length,
    favourites: live.filter((p) => p.favourite).length,
    trashed: pages.filter((p) => p.workspaceId === workspace.id && p.trashed).length,
  }
}
