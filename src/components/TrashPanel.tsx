import { useState } from 'react'
import type { Page } from '../types'
import ConfirmDialog from './ConfirmDialog'

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
  const [pendingDelete, setPendingDelete] = useState<Page | null>(null)
  const [emptying, setEmptying] = useState(false)

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
            <button className="btn danger" onClick={() => setPendingDelete(p)}>Delete forever</button>
          </div>
        ))}
        {pendingDelete && (
          <ConfirmDialog
            title="Delete forever?"
            message={`Permanently delete “${pendingDelete.title || 'Untitled'}”? This cannot be undone.`}
            confirmLabel="Delete forever"
            danger
            onConfirm={() => { onDeleteForever(pendingDelete.id); setPendingDelete(null) }}
            onCancel={() => setPendingDelete(null)}
          />
        )}
        {emptying && (
          <ConfirmDialog
            title="Empty the trash?"
            message="This permanently deletes all trashed pages. This cannot be undone."
            confirmLabel="Empty trash"
            danger
            onConfirm={() => { onEmptyTrash(); setEmptying(false) }}
            onCancel={() => setEmptying(false)}
          />
        )}
        <div className="modal-actions">
          {trashed.length > 0 && (
            <>
              <button className="btn" onClick={onRestoreAll}>Restore all</button>
              <button className="btn danger" onClick={() => setEmptying(true)}>
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
