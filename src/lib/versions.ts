import type { Page, VersionSnapshot } from '../types'
import { uid } from './id'

export const MAX_SNAPSHOTS_PER_PAGE = 20

/** Take a snapshot of a page's current content. */
export function createSnapshot(page: Page, label?: string): VersionSnapshot {
  return {
    id: uid(),
    pageId: page.id,
    createdAt: Date.now(),
    label: label ?? `Snapshot ${new Date().toLocaleString()}`,
    title: page.title,
    blocks: page.blocks.map((b) => ({ ...b })),
  }
}

/** Snapshots for one page, newest first. */
export function snapshotsForPage(versions: VersionSnapshot[], pageId: string): VersionSnapshot[] {
  return versions
    .filter((v) => v.pageId === pageId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

/** Add a snapshot, pruning the oldest ones past the cap. */
export function addSnapshot(versions: VersionSnapshot[], snapshot: VersionSnapshot): VersionSnapshot[] {
  const next = [snapshot, ...versions]
  const forPage = snapshotsForPage(next, snapshot.pageId)
  if (forPage.length <= MAX_SNAPSHOTS_PER_PAGE) return next
  const keep = new Set(forPage.slice(0, MAX_SNAPSHOTS_PER_PAGE).map((v) => v.id))
  return next.filter((v) => v.pageId !== snapshot.pageId || keep.has(v.id))
}

/** Delete one snapshot by id. */
export function deleteSnapshot(versions: VersionSnapshot[], snapshotId: string): VersionSnapshot[] {
  return versions.filter((v) => v.id !== snapshotId)
}

/** Restore a page's content from a snapshot (keeps the page's id and metadata). */
export function restoreSnapshot(page: Page, snapshot: VersionSnapshot): Page {
  if (snapshot.pageId !== page.id) return page
  return {
    ...page,
    title: snapshot.title,
    blocks: snapshot.blocks.map((b) => ({ ...b, id: uid() })),
    updatedAt: Date.now(),
  }
}

/** True when the page differs from its latest snapshot (i.e. there is something new to save). */
export function pageDiffersFromLatest(page: Page, versions: VersionSnapshot[]): boolean {
  const latest = snapshotsForPage(versions, page.id)[0]
  if (!latest) return page.blocks.length > 0 || page.title !== ''
  if (latest.title !== page.title) return true
  if (latest.blocks.length !== page.blocks.length) return true
  return latest.blocks.some(
    (b, i) =>
      b.type !== page.blocks[i].type ||
      b.text !== page.blocks[i].text ||
      b.checked !== page.blocks[i].checked,
  )
}
