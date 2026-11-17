import { describe, expect, it } from 'vitest'
import { getTemplate, TEMPLATES } from '../templates'
import { blocksToPlainText } from '../blocks'

describe('templates', () => {
  it('ships blank, meeting, project, reading and journal templates', () => {
    expect(TEMPLATES.map((t) => t.id)).toEqual(
      expect.arrayContaining(['blank', 'meeting-notes', 'project-plan', 'reading-list', 'daily-journal', 'weekly-review', 'book-notes']),
    )
    expect(TEMPLATES).toHaveLength(7)
  })
  it('every template has a name, description, icon and at least one block', () => {
    for (const t of TEMPLATES) {
      expect(t.name.length).toBeGreaterThan(0)
      expect(t.description.length).toBeGreaterThan(0)
      expect(t.blocks().length).toBeGreaterThan(0)
    }
  })
  it('weekly review includes wins, lessons and next week', () => {
    const text = blocksToPlainText(getTemplate('weekly-review').blocks())
    expect(text).toMatch(/Wins/)
    expect(text).toMatch(/Lesson learned/)
    expect(text).toMatch(/Next week/)
  })
  it('meeting notes include agenda, decisions and action items', () => {
    const text = blocksToPlainText(getTemplate('meeting-notes').blocks())
    expect(text).toMatch(/Agenda/)
    expect(text).toMatch(/Decisions/)
    expect(text).toMatch(/Action items/)
  })
  it('project plan includes goal, milestones and tasks', () => {
    const text = blocksToPlainText(getTemplate('project-plan').blocks())
    expect(text).toMatch(/Goal/)
    expect(text).toMatch(/Milestones/)
  })
  it('falls back to the blank template for unknown ids', () => {
    expect(getTemplate('nope').id).toBe('blank')
  })
  it('each call returns fresh block ids', () => {
    const a = getTemplate('meeting-notes').blocks()
    const b = getTemplate('meeting-notes').blocks()
    expect(a[0].id).not.toBe(b[0].id)
  })
})
