import type { Page, Workspace } from '../types'
import { pageToMarkdown } from './markdown'
import { getChildren } from './tree'

/** Render one workspace as a single combined Markdown document, tree order. */
export function workspaceToMarkdown(workspace: Workspace, pages: Page[]): string {
  const lines: string[] = [`# ${workspace.name}`, '']
  const walk = (parentId: string | null, depth: number) => {
    for (const child of getChildren(pages, parentId, workspace.id)) {
      const body = pageToMarkdown(child)
        // Demote the page's own H1 so the workspace title stays on top.
        .replace(/^# /, `${'#'.repeat(Math.min(depth + 2, 6))} `)
      lines.push(body.trim(), '')
      walk(child.id, depth + 1)
    }
  }
  walk(null, 0)
  return lines.join('\n').trim() + '\n'
}

/** Suggest a filename for a workspace export. */
export function workspaceFilename(workspace: Workspace): string {
  const slug = workspace.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'workspace'}.md`
}
