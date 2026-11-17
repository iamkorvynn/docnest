import { describe, expect, it } from 'vitest'
import { blocksToMarkdown, markdownFilename, pageToMarkdown } from '../markdown'
import type { Block, Page } from '../../types'

const b = (type: Block['type'], text: string, extra: Partial<Block> = {}): Block => ({ id: `b-${type}-${text.slice(0, 6)}`, type, text, ...extra })

describe('blocksToMarkdown', () => {
  it('renders headings, text, lists and todos', () => {
    const md = blocksToMarkdown([
      b('h1', 'Title'),
      b('paragraph', 'Intro line.'),
      b('bulleted', 'one'),
      b('bulleted', 'two'),
      b('todo', 'done task', { checked: true }),
      b('todo', 'open task', { checked: false }),
    ])
    expect(md).toContain('# Title')
    expect(md).toContain('Intro line.')
    expect(md).toContain('- one')
    expect(md).toContain('- [x] done task')
    expect(md).toContain('- [ ] open task')
  })
  it('numbers ordered lists and restarts after other blocks', () => {
    const md = blocksToMarkdown([
      b('numbered', 'first'),
      b('numbered', 'second'),
      b('paragraph', 'break'),
      b('numbered', 'again first'),
    ])
    expect(md).toContain('1. first')
    expect(md).toContain('2. second')
    expect(md).toContain('1. again first')
  })
  it('renders code fences, quotes and dividers', () => {
    const md = blocksToMarkdown([
      b('code', 'const x = 1', { language: 'ts' }),
      b('quote', 'be kind\nrewind'),
      b('divider', ''),
    ])
    expect(md).toContain('```ts\nconst x = 1\n```')
    expect(md).toContain('> be kind\n> rewind')
    expect(md).toContain('---')
  })
  it('renders image blocks', () => {
    const md = blocksToMarkdown([b('image', 'A cat', { src: 'https://example.com/cat.png' })])
    expect(md).toContain('![A cat](https://example.com/cat.png)')
  })
})

describe('pageToMarkdown / markdownFilename', () => {
  const page: Page = {
    id: 'p1', workspaceId: 'ws', parentId: null, title: 'My Cool Doc!',
    icon: '📄', blocks: [b('h2', 'Section'), b('paragraph', 'body')],
    favourite: false, trashed: false, createdAt: 1, updatedAt: 1,
  }
  it('puts the title first as H1', () => {
    const md = pageToMarkdown(page)
    expect(md.startsWith('# My Cool Doc!\n')).toBe(true)
    expect(md).toContain('## Section')
    expect(md).toContain('body')
  })
  it('falls back to Untitled for empty titles', () => {
    expect(pageToMarkdown({ ...page, title: '' })).toContain('# Untitled')
  })
  it('slugifies filenames', () => {
    expect(markdownFilename(page)).toBe('my-cool-doc.md')
    expect(markdownFilename({ ...page, title: '' })).toBe('untitled.md')
  })
})
