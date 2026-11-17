/** Cheat-sheet of every keyboard shortcut in DocNest. */
export default function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    ['⌘/Ctrl + K', 'Search across all docs'],
    ['⌘/Ctrl + Shift + F', 'Toggle focus mode'],
    ['⌘/Ctrl + S', 'Save a version snapshot'],
    ['Enter', 'Split the current block'],
    ['Backspace (at block start)', 'Merge with the previous block'],
    ['Alt + ↑ / ↓', 'Move the current block up / down'],
    ['Shift + Enter', 'New line inside a code block'],
    ['Esc', 'Close dialogs, menus and focus mode'],
  ]
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Keyboard shortcuts</h2>
        <p className="sub">Write faster without touching the mouse.</p>
        {rows.map(([keys, desc]) => (
          <div key={keys} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <span className="kbd" style={{ minWidth: 150, textAlign: 'center' }}>{keys}</span>
            <span style={{ fontSize: 14 }}>{desc}</span>
          </div>
        ))}
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
