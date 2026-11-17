import type { Block } from '../types'
import { createBlock } from './blocks'

export interface PageTemplate {
  id: string
  name: string
  description: string
  icon: string
  blocks: () => Block[]
}

function h1(text: string): Block { return createBlock('h1', text) }
function h2(text: string): Block { return createBlock('h2', text) }
function p(text: string): Block { return createBlock('paragraph', text) }
function todo(text: string, checked = false): Block { return { ...createBlock('todo', text), checked } }
function bullet(text: string): Block { return createBlock('bulleted', text) }
function numbered(text: string): Block { return createBlock('numbered', text) }
function quote(text: string): Block { return createBlock('quote', text) }

export const TEMPLATES: PageTemplate[] = [
  {
    id: 'blank',
    name: 'Blank page',
    description: 'Start from an empty page and make it yours.',
    icon: '📄',
    blocks: () => [createBlock('paragraph')],
  },
  {
    id: 'meeting-notes',
    name: 'Meeting notes',
    description: 'Agenda, notes, decisions and action items.',
    icon: '🗓️',
    blocks: () => [
      h1('Meeting notes'),
      p('Date:  ·  Attendees:  ·  Duration: '),
      h2('Agenda'),
      numbered('Welcome & introductions'),
      numbered('Main discussion'),
      numbered('Next steps'),
      h2('Notes'),
      bullet(''),
      h2('Decisions'),
      quote('What did we agree on?'),
      h2('Action items'),
      todo('Owner — task, due date'),
      todo('Owner — task, due date'),
    ],
  },
  {
    id: 'project-plan',
    name: 'Project plan',
    description: 'Goal, milestones, risks and a task list.',
    icon: '🚀',
    blocks: () => [
      h1('Project plan'),
      h2('Goal'),
      p('What does success look like for this project?'),
      h2('Milestones'),
      numbered('Milestone 1 — date'),
      numbered('Milestone 2 — date'),
      numbered('Launch — date'),
      h2('Tasks'),
      todo('Set up the repo'),
      todo('Draft the first version'),
      todo('Review with the team'),
      h2('Risks'),
      bullet('Risk: — Mitigation: '),
    ],
  },
  {
    id: 'reading-list',
    name: 'Reading list',
    description: 'Books and articles to read, with quick notes.',
    icon: '📚',
    blocks: () => [
      h1('Reading list'),
      h2('To read'),
      todo('Book / article title — why it caught my eye'),
      todo('Book / article title — why it caught my eye'),
      h2('Reading now'),
      bullet('Title — one line on what it is about'),
      h2('Finished'),
      quote('Favourite quote or takeaway from the last thing I finished.'),
    ],
  },
  {
    id: 'daily-journal',
    name: 'Daily journal',
    description: 'A short daily check-in: done, felt, tomorrow.',
    icon: '✍️',
    blocks: () => [
      h1('Today'),
      h2('What I did'),
      bullet(''),
      h2('How it felt'),
      p(''),
      h2('Tomorrow'),
      todo('One thing to do first'),
    ],
  },
]

export function getTemplate(id: string): PageTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]
}
