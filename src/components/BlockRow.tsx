import { useEffect, useRef, useState } from 'react'
import type { Block, BlockType } from '../types'
import { BLOCK_LABELS, BLOCK_TYPES } from '../lib/blocks'

interface Props {
  block: Block
  number?: number
  readOnly: boolean
  autoFocus?: boolean
  onTextChange: (id: string, text: string) => void
  onSplit: (id: string, cursor: number) => void
  onMergeBack: (id: string) => void
  onTypeChange: (id: string, type: BlockType) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (id: string, dir: -1 | 1) => void
  onToggleTodo: (id: string) => void
  onSrcChange: (id: string, src: string) => void
}

const PLACEHOLDERS: Partial<Record<BlockType, string>> = {
  paragraph: 'Write something…',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  bulleted: 'List item',
  numbered: 'List item',
  todo: 'To-do',
  code: '// code…',
  quote: 'Quote',
}

/** One editable block row: the text input plus hover tools (type, move, duplicate, delete). */
export default function BlockRow(props: Props) {
  const { block, readOnly } = props
  const taRef = useRef<HTMLTextAreaElement>(null)
  const [typeMenuOpen, setTypeMenuOpen] = useState(false)

  // Auto-grow the textarea to its content.
  useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [block.text, block.type])

  useEffect(() => {
    if (props.autoFocus) taRef.current?.focus()
  }, [props.autoFocus])

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget
    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code') {
      e.preventDefault()
      props.onSplit(block.id, ta.selectionStart ?? block.text.length)
    } else if (e.key === 'Backspace' && (ta.selectionStart ?? 0) === 0 && (ta.selectionEnd ?? 0) === 0) {
      e.preventDefault()
      props.onMergeBack(block.id)
    } else if (e.key === 'ArrowUp' && e.altKey) {
      e.preventDefault()
      props.onMove(block.id, -1)
    } else if (e.key === 'ArrowDown' && e.altKey) {
      e.preventDefault()
      props.onMove(block.id, 1)
    }
  }

  if (block.type === 'divider') {
    return (
      <div className="block-row">
        <div className="block-tools">
          {!readOnly && (
            <button title="Delete divider" onClick={() => props.onDelete(block.id)}>✕</button>
          )}
        </div>
        <div className="block-body"><hr className="block-divider" /></div>
      </div>
    )
  }

  if (block.type === 'image') {
    return (
      <div className="block-row">
        <div className="block-tools">
          {!readOnly && (
            <>
              <button title="Move up (Alt+↑)" onClick={() => props.onMove(block.id, -1)}>↑</button>
              <button title="Move down (Alt+↓)" onClick={() => props.onMove(block.id, 1)}>↓</button>
              <button title="Delete image" onClick={() => props.onDelete(block.id)}>✕</button>
            </>
          )}
        </div>
        <div className="block-body">
          <div className="block-image">
            {block.src ? (
              <img src={block.src} alt={block.text || 'image'} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            ) : (
              <div style={{ fontSize: 26, marginBottom: 6 }}>🖼️</div>
            )}
            {readOnly ? (
              <div>{block.text || 'Image'}</div>
            ) : (
              <>
                <input
                  type="text"
                  value={block.src ?? ''}
                  placeholder="Paste an image URL…"
                  onChange={(e) => props.onSrcChange(block.id, e.target.value)}
                  style={{ width: '100%', padding: '7px 9px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, marginBottom: 6 }}
                />
                <input
                  type="text"
                  value={block.text}
                  placeholder="Caption…"
                  onChange={(e) => props.onTextChange(block.id, e.target.value)}
                  style={{ width: '100%', padding: '6px 9px', border: 'none', background: 'transparent', fontSize: 13, textAlign: 'center', outline: 'none' }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  const inputClass = `block-input ${block.type === 'h1' ? 'h1' : block.type === 'h2' ? 'h2' : block.type === 'h3' ? 'h3' : block.type === 'quote' ? 'quote' : block.type === 'code' ? 'code' : ''}`

  const input = (
    <textarea
      ref={taRef}
      className={inputClass}
      value={block.text}
      placeholder={PLACEHOLDERS[block.type] ?? ''}
      disabled={readOnly}
      rows={1}
      onChange={(e) => props.onTextChange(block.id, e.target.value)}
      onKeyDown={onKeyDown}
      aria-label={BLOCK_LABELS[block.type]}
    />
  )

  let body: React.ReactNode
  if (block.type === 'bulleted') {
    body = <div className="block-bullet"><span className="marker">•</span>{input}</div>
  } else if (block.type === 'numbered') {
    body = <div className="block-number"><span className="marker">{props.number ?? 1}.</span>{input}</div>
  } else if (block.type === 'todo') {
    body = (
      <div className={`block-todo ${block.checked ? 'done' : ''}`}>
        <input type="checkbox" checked={!!block.checked} disabled={readOnly} onChange={() => props.onToggleTodo(block.id)} aria-label="Mark done" />
        {input}
      </div>
    )
  } else {
    body = input
  }

  return (
    <div className="block-row">
      <div className="block-tools">
        {!readOnly && (
          <>
            <button title="Change block type" onClick={() => setTypeMenuOpen((v) => !v)}>⋮</button>
            <button title="Move up (Alt+↑)" onClick={() => props.onMove(block.id, -1)}>↑</button>
            <button title="Move down (Alt+↓)" onClick={() => props.onMove(block.id, 1)}>↓</button>
            <button title="Duplicate block" onClick={() => props.onDuplicate(block.id)}>⧉</button>
            <button title="Delete block" onClick={() => props.onDelete(block.id)}>✕</button>
          </>
        )}
        {typeMenuOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 29 }} onClick={() => setTypeMenuOpen(false)} />
            <div className="ws-menu" style={{ position: 'absolute', left: 44, top: 26, zIndex: 30, minWidth: 170 }}>
              {BLOCK_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => { props.onTypeChange(block.id, t); setTypeMenuOpen(false) }}
                  style={{ fontWeight: block.type === t ? 700 : 400 }}
                >
                  {BLOCK_LABELS[t]}{block.type === t ? ' ✓' : ''}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="block-body">{body}</div>
    </div>
  )
}
