import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Block, DocNestState, Page, Role, VersionSnapshot, Workspace } from './types'
import { loadState, resetState, saveState } from './lib/store'
import { createBlock } from './lib/blocks'
import { duplicatePage, getPagePath, movePageToWorkspace, nestPage, permanentlyDeletePage, restorePage, trashPage } from './lib/tree'
import { getTemplate } from './lib/templates'
import { addSnapshot, createSnapshot, deleteSnapshot, pageDiffersFromLatest, restoreSnapshot } from './lib/versions'
import { markdownFilename, pageToMarkdown } from './lib/markdown'
import { workspaceFilename, workspaceToMarkdown } from './lib/export'
import { BACKUP_ERROR_MESSAGES, parseBackup, serializeBackup } from './lib/backup'
import { blockedActions, canCreatePage, canDeletePage, canEdit, canManageRoles, canManageWorkspace } from './lib/permissions'
import { uid } from './lib/id'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import SearchModal from './components/SearchModal'
import TemplatesModal from './components/TemplatesModal'
import VersionHistory from './components/VersionHistory'
import FocusMode from './components/FocusMode'
import TrashPanel from './components/TrashPanel'
import RoleBadge from './components/RoleBadge'

export default function App() {
  const [state, setState] = useState<DocNestState>(() => loadState())
  const [searchOpen, setSearchOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [trashOpen, setTrashOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [focusOpen, setFocusOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('docnest-theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const toastTimer = useRef<number | undefined>(undefined)
  const saveSnapshotRef = useRef<() => void>(() => {})
  const prevPageIdRef = useRef<string | null>(state.activePageId)

  const activeWorkspace: Workspace =
    state.workspaces.find((w) => w.id === state.activeWorkspaceId) ?? state.workspaces[0]
  const activePage: Page | null =
    state.pages.find((p) => p.id === state.activePageId && !p.trashed) ?? null
  const readOnly = !canEdit(activeWorkspace.role)
  const crumbs = useMemo(
    () => (activePage ? getPagePath(state.pages, activePage.id) : []),
    [state.pages, activePage],
  )

  // Apply + persist the theme.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('docnest-theme', theme)
  }, [theme])

  // Persist every change to localStorage.
  useEffect(() => {
    saveState(state)
  }, [state])

  // Auto-snapshot the page we are leaving, if it changed since its last snapshot.
  useEffect(() => {
    const prevId = prevPageIdRef.current
    if (prevId && prevId !== state.activePageId) {
      setState((s) => {
        const prev = s.pages.find((p) => p.id === prevId)
        if (!prev || !pageDiffersFromLatest(prev, s.versions)) return s
        return { ...s, versions: addSnapshot(s.versions, createSnapshot(prev, 'Auto-saved before switching pages')) }
      })
    }
    prevPageIdRef.current = state.activePageId
  }, [state.activePageId])

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2800)
  }, [])

  // Global shortcuts: ⌘/Ctrl+K search, ⌘/Ctrl+Shift+F focus mode.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      } else if (mod && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setFocusOpen((v) => !v)
      } else if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        saveSnapshotRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const updatePages = (pages: Page[]) =>
    setState((s) => ({ ...s, pages }))

  const createPage = (parentId: string | null = null, templateId?: string) => {
    if (!canCreatePage(activeWorkspace.role)) {
      showToast('Viewers cannot create pages in this workspace.')
      return
    }
    const template = templateId ? getTemplate(templateId) : null
    const now = Date.now()
    const page: Page = {
      id: uid(),
      workspaceId: activeWorkspace.id,
      parentId,
      title: template && template.id !== 'blank' ? template.name : '',
      icon: template?.icon ?? '📄',
      blocks: template ? template.blocks() : [createBlock('paragraph')],
      favourite: false,
      trashed: false,
      createdAt: now,
      updatedAt: now,
    }
    setState((s) => ({ ...s, pages: [...s.pages, page], activePageId: page.id }))
    setSidebarOpen(false)
  }

  const updateTitle = (title: string) => {
    if (!activePage || readOnly) return
    updatePages(state.pages.map((p) => (p.id === activePage.id ? { ...p, title, updatedAt: Date.now() } : p)))
  }

  const updateBlocks = (blocks: Block[]) => {
    if (!activePage || readOnly) return
    updatePages(state.pages.map((p) => (p.id === activePage.id ? { ...p, blocks, updatedAt: Date.now() } : p)))
  }

  const saveSnapshot = (page?: Page) => {
    const target = page ?? activePage
    if (!target) return
    setState((s) => ({
      ...s,
      versions: addSnapshot(s.versions, createSnapshot(target, `Manual snapshot — ${new Date().toLocaleString()}`)),
    }))
    showToast('📸 Snapshot saved — find it in Version history.')
  }
  saveSnapshotRef.current = saveSnapshot

  const restoreVersion = (snapshot: VersionSnapshot) => {
    if (!activePage || readOnly) return
    setState((s) => {
      const page = s.pages.find((p) => p.id === snapshot.pageId)
      if (!page) return s
      // Snapshot the current version first, so restore is never destructive.
      const withCurrent = addSnapshot(s.versions, createSnapshot(page, 'Before restore'))
      const restored = restoreSnapshot(page, snapshot)
      return {
        ...s,
        versions: addSnapshot(withCurrent, createSnapshot(restored, `Restored from ${new Date(snapshot.createdAt).toLocaleString()}`)),
        pages: s.pages.map((p) => (p.id === restored.id ? restored : p)),
      }
    })
    showToast('Version restored. Your previous version was snapshotted first.')
    setHistoryOpen(false)
  }

  const downloadText = (filename: string, text: string, type = 'text/markdown') => {
    const blob = new Blob([text], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportBackup = () => {
    downloadText(`docnest-backup-${new Date().toISOString().slice(0, 10)}.json`, serializeBackup(state), 'application/json')
    showToast('Backup downloaded — it holds every workspace, page and snapshot.')
  }

  const importBackup = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = parseBackup(String(reader.result ?? ''))
      if (!result.ok) {
        showToast(`Could not import: ${BACKUP_ERROR_MESSAGES[result.error]}`)
        return
      }
      if (window.confirm('Replace everything with this backup? Your current docs will be overwritten.')) {
        setState(result.state)
        showToast('Backup restored.')
      }
    }
    reader.readAsText(file)
  }

  const exportWorkspace = () => {
    downloadText(workspaceFilename(activeWorkspace), workspaceToMarkdown(activeWorkspace, state.pages))
    showToast(`Exported workspace “${activeWorkspace.name}” as Markdown.`)
  }

  const exportMarkdown = (page: Page) => {
    downloadText(markdownFilename(page), pageToMarkdown(page))
    showToast(`Exported “${page.title || 'Untitled'}” as Markdown.`)
  }

  const selectWorkspace = (id: string) => {
    setState((s) => {
      const first = s.pages.find((p) => p.workspaceId === id && !p.trashed && p.parentId === null)
      return { ...s, activeWorkspaceId: id, activePageId: first?.id ?? null }
    })
    setSidebarOpen(false)
  }

  const createWorkspace = (name: string) => {
    const ws: Workspace = { id: uid(), name, icon: '🗂️', color: '#78716c', role: 'owner', createdAt: Date.now() }
    setState((s) => ({ ...s, workspaces: [...s.workspaces, ws], activeWorkspaceId: ws.id, activePageId: null }))
    showToast(`Workspace “${name}” created — you are its owner.`)
  }

  const renameWorkspace = (id: string, name: string) => {
    if (!canManageWorkspace(activeWorkspace.role)) { showToast('Only the owner can rename the workspace.'); return }
    setState((s) => ({ ...s, workspaces: s.workspaces.map((w) => (w.id === id ? { ...w, name } : w)) }))
  }

  const deleteWorkspace = (id: string) => {
    if (!canManageWorkspace(activeWorkspace.role)) { showToast('Only the owner can delete the workspace.'); return }
    setState((s) => {
      const remaining = s.workspaces.filter((w) => w.id !== id)
      if (remaining.length === 0) return s
      const next = remaining[0]
      return {
        ...s,
        workspaces: remaining,
        pages: s.pages.filter((p) => p.workspaceId !== id),
        versions: s.versions.filter((v) => s.pages.some((p) => p.id === v.pageId && p.workspaceId !== id)),
        activeWorkspaceId: next.id,
        activePageId: s.pages.find((p) => p.workspaceId === next.id && !p.trashed)?.id ?? null,
      }
    })
    showToast('Workspace deleted.')
  }

  const changeRole = (id: string, role: Role) => {
    if (!canManageRoles(activeWorkspace.role) && role !== activeWorkspace.role) {
      // Editors/viewers may still demo the switcher, but the note explains the rule.
      // For the demo, allow it: the switcher IS the demo of roles.
    }
    setState((s) => ({ ...s, workspaces: s.workspaces.map((w) => (w.id === id ? { ...w, role } : w)) }))
    showToast(`Your role is now ${role}. ${role === 'viewer' ? 'Editing is disabled.' : role === 'editor' ? 'You can edit, but not manage roles.' : 'You have full control.'}`)
  }

  return (
    <div className="app">
      <Sidebar
        workspaces={state.workspaces}
        activeWorkspace={activeWorkspace}
        pages={state.pages}
        activePageId={state.activePageId}
        onSelectWorkspace={selectWorkspace}
        onCreateWorkspace={createWorkspace}
        onRenameWorkspace={renameWorkspace}
        onDeleteWorkspace={deleteWorkspace}
        onRoleChange={changeRole}
        onSelectPage={(id) => { setState((s) => ({ ...s, activePageId: id })); setSidebarOpen(false) }}
        onNewPage={(parentId) => createPage(parentId ?? null)}
        onNewPageFromTemplate={() => setTemplatesOpen(true)}
        onRenamePage={(id, title) => updatePages(state.pages.map((p) => (p.id === id ? { ...p, title, updatedAt: Date.now() } : p)))}
        onToggleFavourite={(id) => updatePages(state.pages.map((p) => (p.id === id ? { ...p, favourite: !p.favourite } : p)))}
        onDuplicatePage={(id) => {
          if (!canEdit(activeWorkspace.role)) { showToast('Viewers cannot duplicate pages.'); return }
          const { pages, newPageId } = duplicatePage(state.pages, id)
          setState((s) => ({ ...s, pages, activePageId: newPageId ?? s.activePageId }))
          showToast('Page duplicated.')
        }}
        onNestPage={(id, parentId) => updatePages(nestPage(state.pages, id, parentId))}
        onMoveToWorkspace={(id, workspaceId) => {
          if (!canEdit(activeWorkspace.role)) { showToast('Viewers cannot move pages.'); return }
          updatePages(movePageToWorkspace(state.pages, id, workspaceId))
          showToast('Page moved to the other workspace.')
        }}
        onTrashPage={(id) => {
          if (!canDeletePage(activeWorkspace.role)) { showToast('Viewers cannot delete pages.'); return }
          updatePages(trashPage(state.pages, id))
          if (id === state.activePageId) setState((s) => ({ ...s, activePageId: null }))
          showToast('Page moved to trash.')
        }}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenTrash={() => setTrashOpen(true)}
        onResetDemo={() => {
          if (window.confirm('Reset DocNest to the demo workspaces? Your current docs will be replaced.')) {
            setState(resetState())
            showToast('Demo data restored.')
          }
        }}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />

      <div className="main">
        <div className="topbar">
          <button className="icon-btn hamburger" onClick={() => setSidebarOpen((v) => !v)} title="Toggle sidebar">☰</button>
          <div className="crumbs">
            <span>{activeWorkspace.icon} {activeWorkspace.name}</span>
            {crumbs.map((c, i) => (
              <span key={c.id}> / {i === crumbs.length - 1 ? <b>{c.title || 'Untitled'}</b> : c.title || 'Untitled'}</span>
            ))}
          </div>
          <RoleBadge role={activeWorkspace.role} />
          <button className="btn" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} title="Toggle dark / light theme">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          {activePage && (
            <>
              <button className="btn" onClick={() => setFocusOpen(true)} title="Distraction-free writing (Ctrl/⌘ Shift F)">◎ Focus</button>
              <button className="btn" onClick={() => setHistoryOpen(true)} title="Browse and restore past versions">🕘 History</button>
              <button className="btn" onClick={() => exportMarkdown(activePage)} title="Download this doc as Markdown">↓ .md</button>
              <button
                className="btn"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(pageToMarkdown(activePage))
                    showToast('Markdown copied to clipboard.')
                  } catch {
                    showToast('Clipboard blocked — use the .md download instead.')
                  }
                }}
                title="Copy this doc as Markdown"
              >
                ⧉ Copy .md
              </button>
              <button className="btn" onClick={exportWorkspace} title="Download the whole workspace as one Markdown file">⇩ Workspace</button>
              <button
                className="btn"
                onClick={() => updatePages(state.pages.map((p) => (p.id === activePage.id ? { ...p, favourite: !p.favourite } : p)))}
                title={activePage.favourite ? 'Remove from favourites' : 'Add to favourites'}
              >
                {activePage.favourite ? '★' : '☆'}
              </button>
            </>
          )}
        </div>

        {readOnly && (
          <div className="readonly-banner">
            You are a <b>viewer</b> in “{activeWorkspace.name}” — read-only. Switch your role in the workspace menu to try editing. Blocked: {blockedActions(activeWorkspace.role).join(' · ')}.
          </div>
        )}

        <div className="content">
          {activePage ? (
            <Editor
              page={activePage}
              readOnly={readOnly}
              onTitleChange={updateTitle}
              onBlocksChange={updateBlocks}
              onSaveSnapshot={() => saveSnapshot()}
              onIconChange={(icon) => updatePages(state.pages.map((p) => (p.id === activePage.id ? { ...p, icon, updatedAt: Date.now() } : p)))}
            />
          ) : (
            <div className="empty-state">
              <div className="big">🪹</div>
              <h1>{activeWorkspace.name} is empty</h1>
              <p>
                {readOnly
                  ? 'There are no pages in this workspace yet, and viewers cannot create them. Switch to the owner or editor workspace to start writing.'
                  : 'Create your first page and start nesting ideas.'}
              </p>
              {!readOnly && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                  <button className="btn primary" onClick={() => createPage(null)}>＋ New page</button>
                  <button className="btn" onClick={() => setTemplatesOpen(true)}>From a template</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {searchOpen && (
        <SearchModal
          pages={state.pages}
          onOpen={(id) => {
            const page = state.pages.find((p) => p.id === id)
            if (page) setState((s) => ({ ...s, activeWorkspaceId: page.workspaceId, activePageId: id }))
            setSidebarOpen(false)
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}
      {templatesOpen && <TemplatesModal onPick={(tid) => createPage(null, tid)} onClose={() => setTemplatesOpen(false)} />}
      {trashOpen && (
        <TrashPanel
          pages={state.pages}
          workspaceId={activeWorkspace.id}
          onRestore={(id) => { updatePages(restorePage(state.pages, id)); showToast('Page restored.') }}
          onDeleteForever={(id) => updatePages(permanentlyDeletePage(state.pages, id))}
          onEmptyTrash={() => {
            const ids = new Set(state.pages.filter((p) => p.workspaceId === activeWorkspace.id && p.trashed).map((p) => p.id))
            updatePages(state.pages.filter((p) => !ids.has(p.id)))
            showToast('Trash emptied.')
          }}
          onClose={() => setTrashOpen(false)}
        />
      )}
      {historyOpen && activePage && (
        <VersionHistory
          page={activePage}
          versions={state.versions}
          onRestore={restoreVersion}
          onDelete={(id) => setState((s) => ({ ...s, versions: deleteSnapshot(s.versions, id) }))}
          onSaveSnapshot={() => saveSnapshot()}
          onClose={() => setHistoryOpen(false)}
        />
      )}
      {focusOpen && activePage && (
        <FocusMode
          page={activePage}
          readOnly={readOnly}
          onTitleChange={updateTitle}
          onBlocksChange={updateBlocks}
          onSaveSnapshot={() => saveSnapshot()}
          onIconChange={(icon) => updatePages(state.pages.map((p) => (p.id === activePage.id ? { ...p, icon, updatedAt: Date.now() } : p)))}
          onExit={() => setFocusOpen(false)}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
