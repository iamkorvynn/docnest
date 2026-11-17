import { useEffect, useRef, useState } from 'react'
import type { Role, Workspace } from '../types'
import { ROLE_DESCRIPTIONS, ROLE_LABELS, canManageWorkspace } from '../lib/permissions'
import RoleBadge from './RoleBadge'
import ConfirmDialog from './ConfirmDialog'

interface Props {
  workspaces: Workspace[]
  active: Workspace
  onSelect: (id: string) => void
  onCreate: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  /** Demo role switching: changes what the UI allows in this workspace. */
  onRoleChange: (id: string, role: Role) => void
  onColorChange: (id: string, color: string) => void
}

const ROLE_ORDER: Role[] = ['owner', 'editor', 'viewer']

export const WORKSPACE_COLORS = ['#d97706', '#2563eb', '#059669', '#db2777', '#7c3aed', '#78716c']

export default function WorkspaceSwitcher({ workspaces, active, onSelect, onCreate, onRename, onDelete, onRoleChange, onColorChange }: Props) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [open ])

  const submitCreate = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onCreate(trimmed)
    setName('')
    setCreating(false)
    setOpen(false)
  }

  const submitRename = () => {
    const trimmed = name.trim()
    if (trimmed && trimmed !== active.name) onRename(active.id, trimmed)
    setName('')
    setRenaming(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="ws-switcher" onClick={() => setOpen((v) => !v)} title="Switch workspace">
        <span className="ws-avatar" style={{ borderColor: active.color, boxShadow: `inset 0 -3px 0 ${active.color}22` }}>{active.icon}</span>
        <span className="ws-meta">
          <span className="ws-name">{active.name}</span>
          <br />
          <span className="ws-role">{ROLE_LABELS[active.role]} · {workspaces.length} workspace{workspaces.length === 1 ? '' : 's'}</span>
        </span>
        <span style={{ color: 'var(--text-faint)' }}>▾</span>
      </button>

      {open && (
        <div className="ws-menu" style={{ top: '100%', left: 0, right: 0 }}>
          {workspaces.map((ws) => (
            <button key={ws.id} onClick={() => { onSelect(ws.id); setOpen(false) }}>
              <span>{ws.icon}</span>
              <span style={{ flex: 1 }}>{ws.name}</span>
              {ws.id === active.id && <span>✓</span>}
              <RoleBadge role={ws.role} />
            </button>
          ))}
          <hr />
          {creating ? (
            <div style={{ padding: '4px 9px', display: 'flex', gap: 6 }}>
              <input
                type="text"
                autoFocus
                value={name}
                placeholder="Workspace name…"
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitCreate(); if (e.key === 'Escape') setCreating(false) }}
                style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}
              />
              <button className="btn accent" onClick={submitCreate}>Add</button>
            </div>
          ) : (
            <button onClick={() => setCreating(true)}>＋ New workspace</button>
          )}
          <hr />
          {renaming ? (
            <div style={{ padding: '4px 9px', display: 'flex', gap: 6 }}>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setRenaming(false) }}
                style={{ flex: 1, padding: '6px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}
              />
              <button className="btn" onClick={submitRename}>Save</button>
            </div>
          ) : (
            <button
              disabled={!canManageWorkspace(active.role)}
              title={canManageWorkspace(active.role) ? 'Rename this workspace' : 'Only the owner can rename the workspace'}
              onClick={() => { setName(active.name); setRenaming(true) }}
            >
              ✏️ Rename workspace
            </button>
          )}
          <div style={{ padding: '6px 9px', display: 'flex', gap: 7, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Colour</span>
            {WORKSPACE_COLORS.map((c) => (
              <button
                key={c}
                title={`Set workspace colour ${c}`}
                onClick={() => onColorChange(active.id, c)}
                style={{
                  width: 20, height: 20, borderRadius: '50%', border: active.color === c ? '2px solid var(--text)' : '2px solid transparent',
                  background: c, padding: 0,
                }}
              />
            ))}
          </div>
          <button onClick={() => setRoleOpen((v) => !v)}>👤 Switch my role {roleOpen ? '▴' : '▾'}</button>
          {roleOpen && (
            <div style={{ padding: '2px 4px 6px' }}>
              {ROLE_ORDER.map((role) => (
                <button
                  key={role}
                  onClick={() => { onRoleChange(active.id, role); setRoleOpen(false) }}
                  title={ROLE_DESCRIPTIONS[role]}
                  style={{ fontWeight: active.role === role ? 700 : 400 }}
                >
                  <span style={{ flex: 1 }}>{ROLE_LABELS[role]}{active.role === role ? ' ✓' : ''}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{role === 'owner' ? 'full control' : role === 'editor' ? 'can edit' : 'read-only'}</span>
                </button>
              ))}
              <div className="menu-note">Demo role switcher — the UI updates immediately: viewers cannot edit, editors cannot manage roles or delete the workspace.</div>
            </div>
          )}
          <hr />
          <button
            className="danger"
            disabled={!canManageWorkspace(active.role)}
            title={canManageWorkspace(active.role) ? 'Delete this workspace' : 'Only the owner can delete the workspace'}
            onClick={() => setConfirmDelete(true)}
          >
            🗑 Delete workspace
          </button>
        </div>
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete this workspace?"
          message={`Delete “${active.name}” and all its pages? This cannot be undone.`}
          confirmLabel="Delete workspace"
          danger
          onConfirm={() => { onDelete(active.id); setConfirmDelete(false); setOpen(false) }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}
