import { describe, expect, it } from 'vitest'
import {
  changeBlockType,
  countWords,
  createBlock,
  deleteBlock,
  duplicateBlock,
  insertBlockAfter,
  insertBlockAt,
  mergeBlockWithPrevious,
  moveBlock,
  splitBlock,
  toggleTodo,
  updateBlockText,
} from '../blocks'
import type { Block } from '../../types'

const b = (text: string, type: Block['type'] = 'paragraph'): Block => ({ id: `b-${text}`, type, text })

describe('createBlock', () => {
  it('creates a paragraph by default with a unique id', () => {
    const a = createBlock()
    const c = createBlock()
    expect(a.type).toBe('paragraph')
    expect(a.id).not.toBe(c.id)
  })
  it('initialises todos unchecked and code blocks with a language', () => {
    expect(createBlock('todo').checked).toBe(false)
    expect(createBlock('code').language).toBe('plaintext')
  })
})

describe('insertBlockAfter / insertBlockAt', () => {
  it('inserts after the named block', () => {
    const blocks = [b('one'), b('two')]
    const out = insertBlockAfter(blocks, 'b-one', b('new'))
    expect(out.map((x) => x.text)).toEqual(['one', 'new', 'two'])
  })
  it('appends when the anchor is missing or null', () => {
    const blocks = [b('one')]
    expect(insertBlockAfter(blocks, 'nope', b('new')).map((x) => x.text)).toEqual(['one', 'new'])
    expect(insertBlockAfter(blocks, null, b('new')).map((x) => x.text)).toEqual(['one', 'new'])
  })
  it('clamps the insert index', () => {
    const blocks = [b('one')]
    expect(insertBlockAt(blocks, 99, b('new')).map((x) => x.text)).toEqual(['one', 'new'])
    expect(insertBlockAt(blocks, -5, b('new')).map((x) => x.text)).toEqual(['new', 'one'])
  })
})

describe('splitBlock', () => {
  it('splits text at the cursor and keeps the type', () => {
    const blocks = [b('hello world', 'h2')]
    const { blocks: out, newBlockId } = splitBlock(blocks, 'b-hello world', 5)
    expect(out.map((x) => x.text)).toEqual(['hello', ' world'])
    expect(out[1].type).toBe('h2')
    expect(out[1].id).toBe(newBlockId)
  })
  it('inserts a fresh paragraph after non-text blocks', () => {
    const blocks = [{ id: 'd1', type: 'divider' as const, text: '' }]
    const { blocks: out } = splitBlock(blocks, 'd1', 0)
    expect(out).toHaveLength(2)
    expect(out[1].type).toBe('paragraph')
  })
  it('is a no-op for an unknown id', () => {
    const blocks = [b('one')]
    expect(splitBlock(blocks, 'nope', 1).blocks).toEqual(blocks)
  })
})

describe('mergeBlockWithPrevious', () => {
  it('merges text into the previous block', () => {
    const blocks = [b('hello '), b('world')]
    const { blocks: out, mergedIntoId } = mergeBlockWithPrevious(blocks, 'b-world')
    expect(out.map((x) => x.text)).toEqual(['hello world'])
    expect(mergedIntoId).toBe('b-hello ')
  })
  it('removes an empty block without touching the previous text', () => {
    const blocks = [b('keep'), b('')]
    const { blocks: out } = mergeBlockWithPrevious(blocks, 'b-')
    expect(out.map((x) => x.text)).toEqual(['keep'])
  })
  it('cannot merge the first block', () => {
    const blocks = [b('one'), b('two')]
    expect(mergeBlockWithPrevious(blocks, 'b-one').blocks).toEqual(blocks)
  })
})

describe('deleteBlock', () => {
  it('removes the named block', () => {
    expect(deleteBlock([b('a'), b('b')], 'b-a').map((x) => x.text)).toEqual(['b'])
  })
  it('never leaves the doc empty — resets to one paragraph', () => {
    const out = deleteBlock([b('only')], 'b-only')
    expect(out).toHaveLength(1)
    expect(out[0].type).toBe('paragraph')
  })
})

describe('toggleTodo', () => {
  it('flips checked on todo blocks only', () => {
    const todo: Block = { id: 't1', type: 'todo', text: 'do it', checked: false }
    const para = b('para')
    const out = toggleTodo([todo, para], 't1')
    expect(out[0].checked).toBe(true)
    expect(toggleTodo(out, 't1')[0].checked).toBe(false)
    expect(toggleTodo([para], 'b-para')).toEqual([para])
  })
})

describe('changeBlockType / updateBlockText / moveBlock / duplicateBlock', () => {
  it('changes type while keeping text', () => {
    const out = changeBlockType([b('hi')], 'b-hi', 'h1')
    expect(out[0]).toMatchObject({ type: 'h1', text: 'hi' })
  })
  it('updates text', () => {
    expect(updateBlockText([b('old')], 'b-old', 'new')[0].text).toBe('new')
  })
  it('moves blocks up and down, and not past the ends', () => {
    const blocks = [b('a'), b('b'), b('c')]
    expect(moveBlock(blocks, 'b-b', 1).map((x) => x.text)).toEqual(['a', 'c', 'b'])
    expect(moveBlock(blocks, 'b-b', -1).map((x) => x.text)).toEqual(['b', 'a', 'c'])
    expect(moveBlock(blocks, 'b-a', -1)).toEqual(blocks)
    expect(moveBlock(blocks, 'b-c', 1)).toEqual(blocks)
  })
  it('duplicates a block directly below itself with a new id', () => {
    const blocks = [b('a'), b('b')]
    const out = duplicateBlock(blocks, 'b-a')
    expect(out).toHaveLength(3)
    expect(out[1].text).toBe('a')
    expect(out[1].id).not.toBe('b-a')
  })
})

describe('countWords', () => {
  it('counts words across blocks and ignores empty docs', () => {
    expect(countWords([])).toBe(0)
    expect(countWords([b('hello world'), b('one more')])).toBe(4)
    expect(countWords([b('   ')])).toBe(0)
  })
})
