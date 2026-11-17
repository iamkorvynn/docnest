import { useEffect, useMemo, useRef, useState } from 'react'
import type { Page } from '../types'
import { searchPages } from '../lib/search'

interface Props {
  pages: Page[]
  workspaceId?: string
  workspaceName?: string
  onOpen: (pageId: string) => void
  onClose: () => void
}

/** ⌘K palette: full-text search across titles and block content. */
export default function SearchModal({ pages, workspaceId, workspaceName, onOpen, onClose }: Props) {
  const [onlyCurrent, setOnlyCurrent] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(
    () => searchPages(pages, query, onlyCurrent ? workspaceId : undefined),
    [pages, query, workspaceId, onlyCurrent],
  )

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => setSelected(0), [query])

  const openSelected = () => {
    const hit = results[selected]
    if (hit) { onOpen(hit.page.id); onClose() }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search docs… (title or text)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
            if (e.key === 'Enter') openSelected()
          }}
          aria-label="Search docs"
        />
        {workspaceId && (
          <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, marginTop: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={onlyCurrent} onChange={(e) => setOnlyCurrent(e.target.checked)} />
            Only in “{workspaceName ?? 'this workspace'}”
          </label>
        )}
        <div style={{ marginTop: 10 }}>
          {query.trim() === '' && <p className="sub">Type to search across every workspace — titles rank first, then content.</p>}
          {query.trim() !== '' && results.length === 0 && <p className="sub">No docs match “{query}”.</p>}
          {results.map((r, i) => (
            <button key={r.page.id} className={`search-result ${i === selected ? 'selected' : ''}`} onClick={() => { onOpen(r.page.id); onClose() }} onMouseEnter={() => setSelected(i)}>
              <div className="r-tag">{r.matchIn === 'title' ? 'Title match' : r.matchIn === 'both' ? 'Title + content' : 'Content match'}</div>
              <div className="r-title">{r.page.icon} {r.page.title || 'Untitled'}</div>
              <div className="r-excerpt">{r.excerpt}</div>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 8 }}>↑↓ to navigate · Enter to open · Esc to close</div>
      </div>
    </div>
  )
}
