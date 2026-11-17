import { useEffect, useMemo, useRef, useState } from 'react'
import { blocksToMarkdown } from '../lib/markdown'
import { relativeTime } from '../lib/dates'
import type { Block, BlockType, Page } from '../types'
import {
  changeBlockType,
  countWords,
  createBlock,
  deleteBlock,
  duplicateBlock,
  insertBlockAfter,
  mergeBlockWithPrevious,
  moveBlock,
  splitBlock,
  toggleTodo,
  updateBlockText,
  BLOCK_LABELS,
  BLOCK_TYPES,
} from '../lib/blocks'
import BlockRow from './BlockRow'

export const PAGE_ICONS = ['📄', '📝', '📕', '📗', '📘', '🗺️', '🚀', '🎵', '💡', '🗓️', '✅', '🧩', '🔍', '✍️', '📚', '🏢', '👋', '🪹', '⭐', '🎯']

interface Props {
  page: Page
  readOnly: boolean
  focus?: boolean
  onTitleChange: (title: string) => void
  onBlocksChange: (blocks: Block[]) => void
  onSaveSnapshot: () => void
  onIconChange?: (icon: string) => void
  onCopyBlock?: (block: Block) => void
}

/** The document editor: title, block list, add-block menu, word count. */
export default function Editor({ page, readOnly, focus, onTitleChange, onBlocksChange, onSaveSnapshot, onIconChange, onCopyBlock }: Props) {
  const cycleIcon = () => {
    if (readOnly || !onIconChange) return
    const idx = PAGE_ICONS.indexOf(page.icon)
    onIconChange(PAGE_ICONS[(idx + 1) % PAGE_ICONS.length])
  }
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow the title.
  useEffect(() => {
    const ta = titleRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [page.title])

  const words = useMemo(() => countWords(page.blocks), [page.blocks])
  const todos = useMemo(() => {
    const all = page.blocks.filter((b) => b.type === 'todo')
    return { done: all.filter((b) => b.checked).length, total: all.length }
  }, [page.blocks])
  const minutes = Math.max(1, Math.round(words / 200))
  const updated = relativeTime(page.updatedAt)

  // Numbering for numbered-list blocks: count consecutive numbered siblings.
  const numbers = useMemo(() => {
    const map = new Map<string, number>()
    let n = 0
    for (const b of page.blocks) {
      if (b.type === 'numbered') { n += 1; map.set(b.id, n) } else { n = 0 }
    }
    return map
  }, [page.blocks])

  const setBlocks = (blocks: Block[]) => onBlocksChange(blocks)

  const handleSplit = (id: string, cursor: number) => {
    const { blocks, newBlockId } = splitBlock(page.blocks, id, cursor)
    setBlocks(blocks)
    setFocusBlockId(newBlockId)
  }
  const handleMergeBack = (id: string) => {
    const { blocks, mergedIntoId } = mergeBlockWithPrevious(page.blocks, id)
    if (mergedIntoId) { setBlocks(blocks); setFocusBlockId(mergedIntoId) }
  }
  const addBlock = (type: BlockType) => {
    const block = createBlock(type)
    setBlocks(insertBlockAfter(page.blocks, page.blocks[page.blocks.length - 1]?.id ?? null, block))
    setFocusBlockId(block.id)
    setAddMenuOpen(false)
  }

  return (
    <div className={`editor ${focus ? 'focus' : ''}`}>
      <div className="doc-icon-row">
        <button className="doc-icon" title={readOnly ? 'Page icon' : 'Click to change the page icon'} onClick={cycleIcon} style={{ cursor: readOnly ? 'default' : 'pointer' }}>
          {page.icon}
        </button>
      </div>
      <textarea
        ref={titleRef}
        className="doc-title"
        value={page.title}
        placeholder="Untitled"
        disabled={readOnly}
        rows={1}
        onChange={(e) => onTitleChange(e.target.value)}
        aria-label="Page title"
      />
      <div className="doc-meta">
        <span>{words} words · ~{minutes} min read</span>
        <span>{page.blocks.length} blocks</span>
        {todos.total > 0 && <span>✓ {todos.done}/{todos.total} to-dos done</span>}
        <span>Last edited {updated}</span>
        {!readOnly && (
          <button className="btn" style={{ padding: '2px 9px', fontSize: 12 }} onClick={onSaveSnapshot} title="Save a snapshot you can restore later">
            📸 Save snapshot
          </button>
        )}
      </div>

      {page.blocks.map((block) => (
        <BlockRow
          key={block.id}
          block={block}
          number={numbers.get(block.id)}
          readOnly={readOnly}
          autoFocus={focusBlockId === block.id}
          onTextChange={(id, text) => setBlocks(updateBlockText(page.blocks, id, text))}
          onSplit={handleSplit}
          onMergeBack={handleMergeBack}
          onTypeChange={(id, type) => setBlocks(changeBlockType(page.blocks, id, type))}
          onDelete={(id) => setBlocks(deleteBlock(page.blocks, id))}
          onDuplicate={(id) => setBlocks(duplicateBlock(page.blocks, id))}
          onMove={(id, dir) => setBlocks(moveBlock(page.blocks, id, dir))}
          onToggleTodo={(id) => setBlocks(toggleTodo(page.blocks, id))}
          onSrcChange={(id, src) => setBlocks(page.blocks.map((b) => (b.id === id ? { ...b, src } : b)))}
          onCopyMarkdown={(block) => onCopyBlock?.(block)}
        />
      ))}

      {!readOnly && (
        <div className="add-block" style={{ position: 'relative' }}>
          <button onClick={() => setAddMenuOpen((v) => !v)}>＋ Add a block</button>
          <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Enter splits · Backspace merges · Alt+↑/↓ moves</span>
          {addMenuOpen && (
            <div className="ws-menu" style={{ position: 'absolute', left: 0, top: 30, minWidth: 190 }}>
              {BLOCK_TYPES.map((t) => (
                <button key={t} onClick={() => addBlock(t)}>{BLOCK_LABELS[t]}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
