/** The emoji set a page icon can cycle through. */
export const PAGE_ICONS = [
  '📄', '📝', '📕', '📗', '📘', '🗺️', '🚀', '🎵', '💡', '🗓️',
  '✅', '🧩', '🔍', '✍️', '📚', '🏢', '👋', '🪹', '⭐', '🎯',
]

/** The next icon after `current` (wraps around). Unknown icons restart at the first. */
export function nextIcon(current: string): string {
  const idx = PAGE_ICONS.indexOf(current)
  return PAGE_ICONS[(idx + 1) % PAGE_ICONS.length]
}
