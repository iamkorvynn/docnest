import { useEffect } from 'react'
import type { Block, Page } from '../types'
import Editor from './Editor'

interface Props {
  page: Page
  readOnly: boolean
  onTitleChange: (title: string) => void
  onBlocksChange: (blocks: Block[]) => void
  onSaveSnapshot: () => void
  onExit: () => void
}

/** Distraction-free writing: just the doc, full screen. Esc exits. */
export default function FocusMode(props: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [props])

  return (
    <div className="focus-mode">
      <button className="focus-exit" onClick={props.onExit}>✕ Exit focus <span className="kbd">Esc</span></button>
      <Editor
        page={props.page}
        readOnly={props.readOnly}
        focus
        onTitleChange={props.onTitleChange}
        onBlocksChange={props.onBlocksChange}
        onSaveSnapshot={props.onSaveSnapshot}
      />
      <div className="focus-hint">Focus mode — nothing but the words. Your changes save automatically.</div>
    </div>
  )
}
