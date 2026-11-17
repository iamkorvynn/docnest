import { useMemo, useState } from 'react'
import type { Page, Workspace } from '../types'
import { flattenTree, getChildren } from '../lib/tree'
import { canCreatePage, canDeletePage } from '../lib/permissions'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import ContextMenu, { type MenuItem } from './ContextMenu'
import type { Role } from '../types'

interface Props {
  workspaces: Workspace[]
  activeWorkspace: Workspace
  pages: Page[]
  activePageId: string | null
  onSelectWorkspace: (id: string) => void
  onCreateWorkspace: (name: string) => void
  onRenameWorkspace: (id: string, name: string) => void
  onDeleteWorkspace: (id: string) => void
  onRoleChange: (id: string, role: Role) => void
  onSelectPage: (id: string) => void
  onNewPage: (parentId?: string | null) => void
  onNewPageFromTemplate: () => void
  onRenamePage: (id: string, title: string) => void
  onToggleFavourite: (id: string) => void
  onDuplicatePage: (id: string) => void
  onNestPage: (id: string, parentId: string | null) => void
  onMoveToWorkspace: (id: string, workspaceId: string) => void
  onTrashPage: (id: string) => void
  onOpenSearch: () => void
  onOpenTrash: () => void
  onResetDemo: () => void
  sidebarOpen: boolean
  onCloseSidebar: () => void
}

export default function Sidebar(props: Props) {
  const { workspaces, activeWorkspace, pages, activePageId } = props
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [menu, setMenu] = useState<{ x: number; y: number; page: Page } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const tree = useMemo(
    () => flattenTree(pages, activeWorkspace.id),
    [pages, activeWorkspace.id],
  )
  const favourites = pages.filter((p) => p.workspaceId === activeWorkspace.id && p.favourite && !p.trashed)
  const trashedCount = pages.filter((p) => p.workspaceId === activeWorkspace.id && p.trashed).length
  const canEdit = canCreatePage(activeWorkspace.role)

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const visibleTree = tree.filter(({ page, depth }) => {
    // Hide children of collapsed ancestors.
    let parentId = page.parentId
    while (parentId) {
      if (collapsed.has(parentId)) return false
      parentId = pages.find((p) => p.id === parentId)?.parentId ?? null
    }
    return depth >= 0
  })

  const openMenu = (e: React.MouseEvent, page: Page) => {
    e.preventDefault()
    e.stopPropagation()
    setMenu({ x: e.clientX, y: e.clientY, page })
  }

  const menuItems = (page: Page): MenuItem[] => {
    const siblings = pages.filter((p) => p.workspaceId === page.workspaceId && p.parentId === null && p.id !== page.id && !p.trashed)
    const items: MenuItem[] = [
      { label: 'Rename', icon: '✏️', disabled: !canEdit, onClick: () => { setEditingId(page.id); setEditTitle(page.title) } },
      { label: page.favourite ? 'Remove from favourites' : 'Add to favourites', icon: '⭐', onClick: () => props.onToggleFavourite(page.id) },
      { label: 'Duplicate', icon: '📄', disabled: !canEdit, onClick: () => props.onDuplicatePage(page.id) },
      { label: 'New sub-page', icon: '＋', disabled: !canEdit, onClick: () => props.onNewPage(page.id) },
    ]
    if (page.parentId) {
      items.push({ label: 'Move to top level', icon: '⬆️', disabled: !canEdit, onClick: () => props.onNestPage(page.id, null) })
    }
    for (const target of siblings.slice(0, 5)) {
      items.push({
        label: `Nest under “${target.title || 'Untitled'}”`,
        icon: '📥',
        disabled: !canEdit,
        onClick: () => props.onNestPage(page.id, target.id),
      })
    }
    for (const ws of workspaces.filter((w) => w.id !== page.workspaceId)) {
      items.push({
        label: `Move to “${ws.name}”`,
        icon: '↗️',
        disabled: !canEdit,
        onClick: () => props.onMoveToWorkspace(page.id, ws.id),
      })
    }
    items.push({ label: 'Move to trash', icon: '🗑', danger: true, disabled: !canDeletePage(activeWorkspace.role), onClick: () => props.onTrashPage(page.id) })
    return items
  }

  return (
    <aside className={`sidebar ${props.sidebarOpen ? 'open' : ''}`}>
      <WorkspaceSwitcher
        workspaces={workspaces}
        active={activeWorkspace}
        onSelect={props.onSelectWorkspace}
        onCreate={props.onCreateWorkspace}
        onRename={props.onRenameWorkspace}
        onDelete={props.onDeleteWorkspace}
        onRoleChange={props.onRoleChange}
      />

      <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
        <button className="sidebar-item" onClick={props.onOpenSearch} title="Search all docs (Ctrl/⌘ K)">
          <span className="icon">🔍</span>
          <span className="title">Search</span>
          <span className="kbd">⌘K</span>
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="sidebar-item" onClick={() => props.onNewPage(null)} disabled={!canEdit} title={canEdit ? 'New page' : 'Viewers cannot create pages'}>
          <span className="icon">＋</span>
          <span className="title">New page</span>
        </button>
        <button className="sidebar-item" onClick={props.onNewPageFromTemplate} disabled={!canEdit} title={canEdit ? 'New page from template' : 'Viewers cannot create pages'}>
          <span className="icon">▦</span>
          <span className="title">Template</span>
        </button>
      </div>

      {favourites.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-label">Favourites</div>
          {favourites.map((p) => (
            <button key={p.id} className={`sidebar-item ${p.id === activePageId ? 'active' : ''}`} onClick={() => props.onSelectPage(p.id)}>
              <span className="icon">⭐</span>
              <span className="title">{p.title || 'Untitled'}</span>
            </button>
          ))}
        </div>
      )}

      <div className="sidebar-section">
        <div className="sidebar-label">
          Pages
          <button className="icon-btn" onClick={() => props.onNewPage(null)} disabled={!canEdit} title="New page">＋</button>
        </div>
        {visibleTree.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-dim)', padding: '4px 8px' }}>No pages yet — create your first one.</div>}
        {visibleTree.map(({ page, depth }) => {
          const children = getChildren(pages, page.id, activeWorkspace.id)
          const isCollapsed = collapsed.has(page.id)
          return (
            <div key={page.id} className={`sidebar-item ${page.id === activePageId ? 'active' : ''}`} style={{ paddingLeft: 8 + depth * 16 }} onClick={() => props.onSelectPage(page.id)} onContextMenu={(e) => openMenu(e, page)}>
              {children.length > 0 ? (
                <button className="chev" title={isCollapsed ? 'Expand' : 'Collapse'} onClick={(e) => { e.stopPropagation(); toggleCollapse(page.id) }}>
                  {isCollapsed ? '▸' : '▾'}
                </button>
              ) : (
                <span style={{ width: 11 }} />
              )}
              <span className="icon">{page.icon}</span>
              {editingId === page.id ? (
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => { props.onRenamePage(page.id, editTitle); setEditingId(null) }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { props.onRenamePage(page.id, editTitle); setEditingId(null) }
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ flex: 1, minWidth: 0, padding: '2px 5px', border: '1px solid var(--accent)', borderRadius: 5, fontSize: 13 }}
                />
              ) : (
                <span className="title">{page.title || 'Untitled'}</span>
              )}
              <button className="menu-btn" title="Page options" onClick={(e) => { e.stopPropagation(); setMenu({ x: e.clientX, y: e.clientY, page }) }}>•••</button>
            </div>
          )
        })}
      </div>

      <div className="sidebar-section">
        <button className="sidebar-item" onClick={props.onOpenTrash}>
          <span className="icon">🗑</span>
          <span className="title">Trash</span>
          {trashedCount > 0 && <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{trashedCount}</span>}
        </button>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', padding: '8px', lineHeight: 1.5 }}>
        Local-first — your docs live in this browser only.
        <br />
        <button onClick={props.onResetDemo} style={{ border: 'none', background: 'none', color: 'var(--text-dim)', fontSize: 11.5, padding: 0, textDecoration: 'underline' }}>
          Reset demo data
        </button>
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={menuItems(menu.page)}
          note={canEdit ? undefined : 'You are a viewer here — editing is disabled.'}
          onClose={() => setMenu(null)}
        />
      )}
    </aside>
  )
}
