/** Deep links look like `#/page/<page-id>` and open that page on load. */
export function pageLink(pageId: string): string {
  return `#/page/${pageId}`
}

/** Full shareable URL for a page, based on the current location. */
export function pageUrl(pageId: string): string {
  const base = window.location.href.split('#')[0]
  return `${base}${pageLink(pageId)}`
}

/** Extract a page id from a location hash, or null. */
export function pageIdFromHash(hash: string): string | null {
  const match = hash.match(/^#\/page\/([A-Za-z0-9_-]+)$/)
  return match ? match[1] : null
}
