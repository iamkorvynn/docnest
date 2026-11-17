import type { Block, Page } from '../types'

function blockToMarkdown(block: Block, numberedCounters: { n: number }): string {
  switch (block.type) {
    case 'h1':
      return `# ${block.text}`
    case 'h2':
      return `## ${block.text}`
    case 'h3':
      return `### ${block.text}`
    case 'bulleted':
      return `- ${block.text}`
    case 'numbered':
      numberedCounters.n += 1
      return `${numberedCounters.n}. ${block.text}`
    case 'todo':
      return `- [${block.checked ? 'x' : ' '}] ${block.text}`
    case 'code':
      return `\`\`\`${block.language ?? ''}\n${block.text}\n\`\`\``
    case 'quote':
      return block.text
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
    case 'divider':
      return '---'
    case 'image':
      return `![${block.text || 'image'}](${block.src ?? ''})`
    case 'paragraph':
    default:
      return block.text
  }
}

/** Render a block list as Markdown. Numbered lists restart after any non-numbered block. */
export function blocksToMarkdown(blocks: Block[]): string {
  const counters = { n: 0 }
  const lines: string[] = []
  for (const block of blocks) {
    if (block.type !== 'numbered') counters.n = 0
    lines.push(blockToMarkdown(block, counters))
  }
  return lines.join('\n\n')
}

/** Export a whole page as a Markdown document, title included. */
export function pageToMarkdown(page: Page): string {
  const title = `# ${page.title || 'Untitled'}\n`
  const body = blocksToMarkdown(page.blocks)
  return body ? `${title}\n${body}\n` : `${title}\n`
}

/** Suggest a filename for a Markdown export. */
export function markdownFilename(page: Page): string {
  const slug = page.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'untitled'}.md`
}
