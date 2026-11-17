import type { Block, BlockType } from '../types'
import { uid } from './id'

export const BLOCK_TYPES: BlockType[] = [
  'paragraph',
  'h1',
  'h2',
  'h3',
  'bulleted',
  'numbered',
  'todo',
  'code',
  'quote',
  'divider',
  'image',
]

export const BLOCK_LABELS: Record<BlockType, string> = {
  paragraph: 'Text',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  bulleted: 'Bulleted list',
  numbered: 'Numbered list',
  todo: 'To-do',
  code: 'Code',
  quote: 'Quote',
  divider: 'Divider',
  image: 'Image',
}

/** Create a fresh block of the given type. */
export function createBlock(type: BlockType = 'paragraph', text = ''): Block {
  const block: Block = { id: uid(), type, text }
  if (type === 'todo') block.checked = false
  if (type === 'code') block.language = 'plaintext'
  return block
}

/** Insert `block` directly after the block with `afterId` (or at the end). */
export function insertBlockAfter(blocks: Block[], afterId: string | null, block: Block): Block[] {
  if (afterId === null) return [...blocks, block]
  const idx = blocks.findIndex((b) => b.id === afterId)
  if (idx === -1) return [...blocks, block]
  return [...blocks.slice(0, idx + 1), block, ...blocks.slice(idx + 1)]
}

/** Insert a block at an exact index (clamped). */
export function insertBlockAt(blocks: Block[], index: number, block: Block): Block[] {
  const i = Math.max(0, Math.min(index, blocks.length))
  return [...blocks.slice(0, i), block, ...blocks.slice(i)]
}

/**
 * Split the block at `cursor` into two blocks of the same type.
 * The text before the cursor stays; the text after moves to a new block.
 * Returns the new list plus the id of the new block (for caret placement).
 */
export function splitBlock(blocks: Block[], blockId: string, cursor: number): { blocks: Block[]; newBlockId: string | null } {
  const idx = blocks.findIndex((b) => b.id === blockId)
  if (idx === -1) return { blocks, newBlockId: null }
  const block = blocks[idx]
  if (block.type === 'divider' || block.type === 'image') {
    // Non-text blocks split by inserting a fresh paragraph after them.
    const next = createBlock('paragraph')
    return { blocks: insertBlockAfter(blocks, blockId, next), newBlockId: next.id }
  }
  const at = Math.max(0, Math.min(cursor, block.text.length))
  const before: Block = { ...block, text: block.text.slice(0, at) }
  const after: Block = { ...block, id: uid(), text: block.text.slice(at) }
  if (after.type === 'todo') after.checked = false
  const next = [...blocks]
  next.splice(idx, 1, before, after)
  return { blocks: next, newBlockId: after.id }
}

/**
 * Merge the block into the previous block (Backspace on an empty / start-of-block).
 * Returns the new list plus the id of the block that absorbed the text.
 */
export function mergeBlockWithPrevious(blocks: Block[], blockId: string): { blocks: Block[]; mergedIntoId: string | null } {
  const idx = blocks.findIndex((b) => b.id === blockId)
  if (idx <= 0) return { blocks, mergedIntoId: null }
  const prev = blocks[idx - 1]
  const cur = blocks[idx]
  if (prev.type === 'divider' || prev.type === 'image') return { blocks, mergedIntoId: null }
  // An empty block simply disappears; a non-empty one appends its text.
  const merged: Block = { ...prev, text: prev.text + cur.text }
  const next = [...blocks]
  next.splice(idx - 1, 2, merged)
  return { blocks: next, mergedIntoId: merged.id }
}

/** Remove a block. The editor always keeps at least one block. */
export function deleteBlock(blocks: Block[], blockId: string): Block[] {
  if (blocks.length <= 1) return [createBlock('paragraph')]
  return blocks.filter((b) => b.id !== blockId)
}

/** Flip a todo block's checked state; no-op for other types. */
export function toggleTodo(blocks: Block[], blockId: string): Block[] {
  return blocks.map((b) => (b.id === blockId && b.type === 'todo' ? { ...b, checked: !b.checked } : b))
}

/** Change a block's type, keeping its text. */
export function changeBlockType(blocks: Block[], blockId: string, type: BlockType): Block[] {
  return blocks.map((b) => {
    if (b.id !== blockId) return b
    const next: Block = { ...b, type }
    if (type === 'todo' && next.checked === undefined) next.checked = false
    if (type === 'code' && !next.language) next.language = 'plaintext'
    return next
  })
}

/** Update a block's text. */
export function updateBlockText(blocks: Block[], blockId: string, text: string): Block[] {
  return blocks.map((b) => (b.id === blockId ? { ...b, text } : b))
}

/** Move a block one step up or down. */
export function moveBlock(blocks: Block[], blockId: string, direction: -1 | 1): Block[] {
  const idx = blocks.findIndex((b) => b.id === blockId)
  const target = idx + direction
  if (idx === -1 || target < 0 || target >= blocks.length) return blocks
  const next = [...blocks]
  ;[next[idx], next[target]] = [next[target], next[idx]]
  return next
}

/** Duplicate a block directly below itself. */
export function duplicateBlock(blocks: Block[], blockId: string): Block[] {
  const idx = blocks.findIndex((b) => b.id === blockId)
  if (idx === -1) return blocks
  const copy: Block = { ...blocks[idx], id: uid() }
  return insertBlockAfter(blocks, blockId, copy)
}

/** Plain-text rendering of a block list (used by search + word count). */
export function blocksToPlainText(blocks: Block[]): string {
  return blocks.map((b) => b.text).join('\n')
}

/** Count words across all blocks. */
export function countWords(blocks: Block[]): number {
  const text = blocksToPlainText(blocks).trim()
  if (!text) return 0
  return text.split(/\s+/).length
}
