import type { Page } from '../types'

interface Props {
  pages: Page[]
  workspaceId: string
  onRestore: (id: string) => void
  onRestoreAll: () => void
  onDeleteForever: (id: string) => void
  onEmptyTrash: () => void
  onClose: () => void
}

/** Trash: restore pages or delete them forever. */
export default function TrashPanel({ pages, workspaceId, onRestore, onRestoreAll, onDeleteForever, onEmptyTrash, onClose }: Props) {
  const trashed = pages.filter((p) => p.workspaceId === workspaceId && p.trashed)

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Trash</h2>
        <p className="sub">Deleted pages stay here until you restore them or delete them forever.</p>
        {trashed.length === 0 && <p className="sub">Trash is empty. Nothing to restore.</p>}
        {trashed.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px', borderBottom: '1px solid var(--border)' }}>
            <span>{p.icon}</span>
            <span style={{ flex: 1 }}>{p.title || 'Untitled'}</span>
            <button className="btn" onClick={() => onRestore(p.id)}>Restore</button>
            <button className="btn danger" onClick={() => { if (window.confirm(`Permanently delete “${p.title || 'Untitled'}” forever?`)) onDeleteForever(p.id) }}>Delete forever</button>
          </div>
        ))}
        <div className="modal-actions">
          {trashed.length > 0 && (
            <>
              <button className="btn" onClick={onRestoreAll}>Restore all</button>
              <button className="btn danger" onClick={() => { if (window.confirm('Empty the trash? This permanently deletes all trashed pages.')) onEmptyTrash() }}>
                Empty trash
              </button>
            </>
          )}
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
