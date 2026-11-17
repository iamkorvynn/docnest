import type { Workspace } from '../types'

interface Props {
  workspace: Workspace
  readOnly: boolean
  onNewPage: () => void
  onNewFromTemplate: () => void
}

/** Shown when the active workspace has no page open. */
export default function EmptyState({ workspace, readOnly, onNewPage, onNewFromTemplate }: Props) {
  return (
    <div className="empty-state">
      <div className="big">🪹</div>
      <h1>{workspace.name} is empty</h1>
      <p>
        {readOnly
          ? 'There are no pages in this workspace yet, and viewers cannot create them. Switch to the owner or editor workspace to start writing.'
          : 'Create your first page and start nesting ideas.'}
      </p>
      {!readOnly && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
          <button className="btn primary" onClick={onNewPage}>＋ New page</button>
          <button className="btn" onClick={onNewFromTemplate}>From a template</button>
        </div>
      )}
    </div>
  )
}
