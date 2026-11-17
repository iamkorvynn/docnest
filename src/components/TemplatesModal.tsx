import { TEMPLATES } from '../lib/templates'

interface Props {
  onPick: (templateId: string) => void
  onClose: () => void
}

/** Pick a starter template for a new page. */
export default function TemplatesModal({ onPick, onClose }: Props) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>New page from template</h2>
        <p className="sub">Start with structure instead of a blank page.</p>
        <div className="template-grid">
          {TEMPLATES.map((t) => (
            <button key={t.id} className="template-card" onClick={() => { onPick(t.id); onClose() }}>
              <div className="t-icon">{t.icon}</div>
              <div className="t-name">{t.name}</div>
              <div className="t-desc">{t.description}</div>
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
