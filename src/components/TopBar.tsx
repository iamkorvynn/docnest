import type { Page, Workspace } from '../types'
import RoleBadge from './RoleBadge'

interface Props {
  workspace: Workspace
  crumbs: Page[]
  activePage: Page | null
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onToggleSidebar: () => void
  onOpenShortcuts: () => void
  onOpenFocus: () => void
  onOpenHistory: () => void
  onExportPage: () => void
  onCopyPageMarkdown: () => void
  onCopyLink: () => void
  onExportWorkspace: () => void
  onToggleFavourite: () => void
}

/** The bar above the editor: breadcrumbs, role, theme and doc actions. */
export default function TopBar(props: Props) {
  const { workspace, crumbs, activePage } = props
  return (
    <div className="topbar">
      <button className="icon-btn hamburger" onClick={props.onToggleSidebar} title="Toggle sidebar">☰</button>
      <div className="crumbs">
        <span>{workspace.icon} {workspace.name}</span>
        {crumbs.map((c, i) => (
          <span key={c.id}> / {i === crumbs.length - 1 ? <b>{c.title || 'Untitled'}</b> : c.title || 'Untitled'}</span>
        ))}
      </div>
      <RoleBadge role={workspace.role} />
      <button className="btn" onClick={props.onToggleTheme} title="Toggle dark / light theme">
        {props.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>
      {activePage && (
        <>
          <button className="btn" onClick={props.onOpenShortcuts} title="Keyboard shortcuts (?)">⌨ Shortcuts</button>
          <button className="btn" onClick={props.onOpenFocus} title="Distraction-free writing (Ctrl/⌘ Shift F)">◎ Focus</button>
          <button className="btn" onClick={props.onOpenHistory} title="Browse and restore past versions">🕘 History</button>
          <button className="btn" onClick={props.onExportPage} title="Download this doc as Markdown">↓ .md</button>
          <button className="btn" onClick={props.onCopyPageMarkdown} title="Copy this doc as Markdown">⧉ Copy .md</button>
          <button className="btn" onClick={props.onCopyLink} title="Copy a link to this page">🔗 Copy link</button>
          <button className="btn" onClick={props.onExportWorkspace} title="Download the whole workspace as one Markdown file">⇩ Workspace</button>
          <button
            className="btn"
            onClick={props.onToggleFavourite}
            title={activePage.favourite ? 'Remove from favourites' : 'Add to favourites'}
          >
            {activePage.favourite ? '★' : '☆'}
          </button>
        </>
      )}
    </div>
  )
}
