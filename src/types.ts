/** A single editable unit inside a DocNest page. */
export type BlockType =
  | 'paragraph'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bulleted'
  | 'numbered'
  | 'todo'
  | 'code'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'image'

export interface Block {
  id: string
  type: BlockType
  /** Plain text content. For `image` blocks this is the caption. */
  text: string
  /** Todo blocks only. */
  checked?: boolean
  /** Code blocks only. */
  language?: string
  /** Image blocks only: a data URL or remote URL. */
  src?: string
}

export type Role = 'owner' | 'editor' | 'viewer'

export interface Workspace {
  id: string
  name: string
  icon: string
  color: string
  /** The current user's role inside this workspace. */
  role: Role
  createdAt: number
}

export interface Page {
  id: string
  workspaceId: string
  /** Null = top-level page in the workspace. */
  parentId: string | null
  title: string
  icon: string
  blocks: Block[]
  favourite: boolean
  trashed: boolean
  createdAt: number
  updatedAt: number
}

/** A point-in-time copy of a page, restorable from the history timeline. */
export interface VersionSnapshot {
  id: string
  pageId: string
  createdAt: number
  label: string
  title: string
  blocks: Block[]
}

export interface DocNestState {
  workspaces: Workspace[]
  pages: Page[]
  versions: VersionSnapshot[]
  activeWorkspaceId: string
  activePageId: string | null
}
