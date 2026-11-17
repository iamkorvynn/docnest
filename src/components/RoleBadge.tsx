import type { Role } from '../types'
import { ROLE_LABELS } from '../lib/permissions'

/** Small pill showing the current user's role in the active workspace. */
export default function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`role-badge ${role}`} title={role === 'owner' ? 'You own this workspace' : role === 'editor' ? 'You can edit here' : 'Read-only in this workspace'}>
      <span className="dot" />
      {ROLE_LABELS[role]}
    </span>
  )
}
