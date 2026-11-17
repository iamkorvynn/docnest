import type { Page, VersionSnapshot } from '../types'
import { snapshotsForPage } from '../lib/versions'
import { blocksToPlainText } from '../lib/blocks'

interface Props {
  page: Page
  versions: VersionSnapshot[]
  onRestore: (snapshot: VersionSnapshot) => void
  onDelete: (snapshotId: string) => void
  onSaveSnapshot: () => void
  onClose: () => void
}

/** Per-doc version timeline: browse snapshots and restore any of them. */
export default function VersionHistory({ page, versions, onRestore, onDelete, onSaveSnapshot, onClose }: Props) {
  const snaps = snapshotsForPage(versions, page.id)

  return (
    <div className="history-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Version history</h2>
          <p className="sub" style={{ margin: '2px 0 0' }}>{page.icon} {page.title || 'Untitled'}</p>
        </div>
        <button className="icon-btn" onClick={onClose} title="Close history">✕</button>
      </div>
      <p className="sub" style={{ marginTop: 10 }}>
        DocNest saves a snapshot when you ask it to, and automatically when you leave a page you changed.
        Restoring never deletes the current version — a snapshot of it is saved first.
      </p>
      <button className="btn accent" onClick={onSaveSnapshot}>📸 Save a snapshot now</button>
      {snaps.length === 0 && <p className="sub" style={{ marginTop: 16 }}>No snapshots yet for this doc.</p>}
      <ul className="timeline">
        {snaps.map((s, i) => (
          <li key={s.id}>
            <div className="v-label">{i === 0 ? '✦ Current snapshot — ' : ''}{s.label}</div>
            <div className="v-time">
              {new Date(s.createdAt).toLocaleString()} · “{s.title || 'Untitled'}” · {s.blocks.length} blocks
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 4 }}>
              {blocksToPlainText(s.blocks).slice(0, 110) || '(empty)'}
            </div>
            <div className="v-actions">
              <button className="btn" onClick={() => { if (window.confirm(`Restore “${s.title || 'Untitled'}” from ${new Date(s.createdAt).toLocaleString()}? Your current version is snapshotted first.`)) onRestore(s) }}>
                Restore this version
              </button>
              <button className="btn danger" onClick={() => { if (window.confirm('Delete this snapshot?')) onDelete(s.id) }}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
