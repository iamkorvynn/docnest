import type { Page } from '../types'
import { blocksToPlainText } from './blocks'

export interface SearchResult {
  page: Page
  /** Where the match was found. */
  matchIn: 'title' | 'content' | 'both'
  /** Short excerpt around the first content match. */
  excerpt: string
  score: number
}

function excerptFor(text: string, query: string, radius = 48): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text.slice(0, radius * 2)
  const start = Math.max(0, idx - radius)
  const end = Math.min(text.length, idx + query.length + radius)
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`
}

/** Full-text search across titles and block content. Title matches rank first. */
export function searchPages(pages: Page[], query: string, workspaceId?: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const results: SearchResult[] = []
  for (const page of pages) {
    if (page.trashed) continue
    if (workspaceId && page.workspaceId !== workspaceId) continue
    const titleHit = page.title.toLowerCase().includes(q)
    const content = blocksToPlainText(page.blocks)
    const contentHit = content.toLowerCase().includes(q)
    if (!titleHit && !contentHit) continue
    const matchIn = titleHit && contentHit ? 'both' : titleHit ? 'title' : 'content'
    const score = (titleHit ? 10 : 0) + (contentHit ? 5 : 0) + (page.favourite ? 1 : 0)
    results.push({
      page,
      matchIn,
      excerpt: contentHit ? excerptFor(content, q) : page.title,
      score,
    })
  }
  return results.sort((a, b) => b.score - a.score)
}
