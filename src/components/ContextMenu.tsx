import { useEffect } from 'react'

export interface MenuItem {
  label: string
  icon?: string
  danger?: boolean
  disabled?: boolean
  onClick: () => void
}

interface Props {
  x: number
  y: number
  items: MenuItem[]
  note?: string
  onClose: () => void
}

/** Floating menu anchored at a click position; closes on outside click or Escape. */
export default function ContextMenu({ x, y, items, note, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const style: React.CSSProperties = {
    left: Math.min(x, window.innerWidth - 220),
    top: Math.min(y, window.innerHeight - items.length * 36 - 30),
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 69 }} onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose() }} />
      <div className="context-menu" style={style}>
        {note && <div className="menu-note">{note}</div>}
        {items.map((item) => (
          <button key={item.label} className={item.danger ? 'danger' : ''} disabled={item.disabled} onClick={() => { onClose(); item.onClick() }}>
            {item.icon && <span>{item.icon}</span>}
            {item.label}
          </button>
        ))}
      </div>
    </>
  )
}
