import type { DocNestState, Page, VersionSnapshot, Workspace } from '../types'
import { createBlock } from './blocks'
import { createSnapshot } from './versions'
import { uid } from './id'

export const STORAGE_KEY = 'docnest-state-v1'

function page(
  workspaceId: string,
  parentId: string | null,
  title: string,
  icon: string,
  blocks: ReturnType<typeof createBlock>[],
  extra: Partial<Page> = {},
): Page {
  const now = Date.now()
  return {
    id: uid(),
    workspaceId,
    parentId,
    title,
    icon,
    blocks,
    favourite: false,
    trashed: false,
    createdAt: now,
    updatedAt: now,
    ...extra,
  }
}

/** First-run demo content: three workspaces, one per role, so roles are visible immediately. */
export function seedState(): DocNestState {
  const personal: Workspace = { id: uid(), name: 'My Nest', icon: '🪹', color: '#d97706', role: 'owner', createdAt: Date.now() }
  const team: Workspace = { id: uid(), name: 'Product Team', icon: '🧩', color: '#2563eb', role: 'editor', createdAt: Date.now() }
  const handbook: Workspace = { id: uid(), name: 'Company Handbook', icon: '📖', color: '#059669', role: 'viewer', createdAt: Date.now() }

  const welcome = page(personal.id, null, 'Welcome to DocNest', '👋', [
    createBlock('h1', 'Welcome to DocNest'),
    createBlock('paragraph', 'This is your nest for docs — a local-first workspace. Everything lives in your browser, no account, no backend.'),
    createBlock('h2', 'Try things out'),
    createBlock('bulleted', 'Hover any block to change its type, duplicate it, or delete it.'),
    createBlock('bulleted', 'Press Enter to split a block, Backspace on an empty block to merge it back.'),
    createBlock('bulleted', 'Use the + button under a block to add a new one.'),
    { ...createBlock('todo', 'Star this page — it shows up under Favourites'), checked: true },
    createBlock('todo', 'Open Focus mode (top right) and write without distractions'),
    createBlock('todo', 'Check Version history — every snapshot can be restored'),
    createBlock('quote', 'A doc is a nest: small pieces, woven together, that hold something bigger.'),
    createBlock('divider'),
    createBlock('paragraph', 'Tip: press Ctrl/Cmd + K anywhere to search across all your docs.'),
  ], { favourite: true })

  const sideQuests = page(personal.id, null, 'Side quests', '🗺️', [
    createBlock('h1', 'Side quests'),
    createBlock('paragraph', 'Little builds and ideas, one page each. Nest a page under another from the ••• menu in the sidebar.'),
    createBlock('todo', 'Shazam-lite in Python'),
    createBlock('todo', 'Spotify Wrapped, but for my own listening'),
    createBlock('todo', 'A globe that shows where my friends are travelling'),
  ])
  const shazamSpec = page(personal.id, sideQuests.id, 'Shazam-lite spec', '🎵', [
    createBlock('h1', 'Shazam-lite spec'),
    createBlock('paragraph', 'Fingerprint 10 tracks I pick, then identify a 5–10 second clip from the mic.'),
    createBlock('h2', 'How it works'),
    createBlock('numbered', 'Spectrogram → peaks → hashes'),
    createBlock('numbered', 'Store hashes with track + time offset'),
    createBlock('numbered', 'Match a clip by voting on hash hits'),
    createBlock('code', 'def fingerprint(audio):\n    # spectrogram peaks -> hashes\n    pass'),
  ])

  const roadmap = page(team.id, null, 'Q4 Roadmap', '🗺️', [
    createBlock('h1', 'Q4 Roadmap'),
    createBlock('paragraph', 'You are an editor here — you can edit pages, but you cannot change roles or delete this workspace.'),
    createBlock('h2', 'Milestones'),
    createBlock('numbered', 'Alpha — end of October'),
    createBlock('numbered', 'Beta with 20 testers — mid November'),
    createBlock('numbered', 'Launch — December'),
    createBlock('h2', 'Open tasks'),
    createBlock('todo', 'Finalise the pricing page'),
    { ...createBlock('todo', 'Write the launch post'), checked: true },
  ])
  const syncNotes = page(team.id, roadmap.id, 'Weekly sync — notes', '🗓️', [
    createBlock('h1', 'Weekly sync'),
    createBlock('h2', 'Decisions'),
    createBlock('quote', 'We ship the beta when the onboarding flow works end to end, not before.'),
    createBlock('h2', 'Action items'),
    createBlock('todo', 'Maya — fix the invite email copy'),
    createBlock('todo', 'Dev — add the empty state for new workspaces'),
  ])

  const howWeWork = page(handbook.id, null, 'How we work', '🏢', [
    createBlock('h1', 'How we work'),
    createBlock('paragraph', 'You are a viewer in this workspace — read-only. Try editing this page: the editor will not let you.'),
    createBlock('h2', 'Principles'),
    createBlock('bulleted', 'Write it down before you say it in a meeting.'),
    createBlock('bulleted', 'Small docs beat big decks.'),
    createBlock('bulleted', 'If it is not written, it did not happen.'),
  ])
  const onboarding = page(handbook.id, howWeWork.id, 'Onboarding checklist', '✅', [
    createBlock('h1', 'Onboarding checklist'),
    createBlock('todo', 'Read How we work'),
    createBlock('todo', 'Create your own workspace'),
    createBlock('todo', 'Write your first doc and star it'),
  ])

  const pages = [welcome, sideQuests, shazamSpec, roadmap, syncNotes, howWeWork, onboarding]
  const firstSnapshot: VersionSnapshot = {
    ...createSnapshot(welcome, 'First version — welcome draft'),
    blocks: welcome.blocks.slice(0, 4).map((b) => ({ ...b })),
    title: 'Welcome to DocNest',
  }

  return {
    workspaces: [personal, team, handbook],
    pages,
    versions: [firstSnapshot],
    activeWorkspaceId: personal.id,
    activePageId: welcome.id,
  }
}

/** Load persisted state, or seed demo content on first run. */
export function loadState(): DocNestState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = seedState()
      saveState(seeded)
      return seeded
    }
    const parsed = JSON.parse(raw) as DocNestState
    if (!parsed.workspaces?.length || !parsed.pages) return seedState()
    return parsed
  } catch {
    return seedState()
  }
}

export function saveState(state: DocNestState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable (private mode) — the app keeps working in memory.
  }
}

/** Wipe everything and re-seed the demo content. */
export function resetState(): DocNestState {
  const seeded = seedState()
  saveState(seeded)
  return seeded
}
