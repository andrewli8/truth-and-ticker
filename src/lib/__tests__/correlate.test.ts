import { describe, it, expect } from 'vitest'
import { reactionFor, correlateAll } from '../correlate'
import type { Announcement, Series } from '../types'

const a: Announcement = {
  id: 'x',
  datetime: '2025-06-24T09:00:00-04:00',
  source: 'Truth Social',
  quote: 'q',
  summary: 's',
  type: 'ceasefire',
  citationUrl: 'https://example.com',
  citationLabel: 'l',
}

const s: Series = {
  ticker: 'SPX',
  name: 'S&P 500',
  category: 'index',
  points: [
    { datetime: '2025-06-24T09:00:00-04:00', price: 100, pctFromPrevClose: 0 },
    { datetime: '2025-06-24T09:30:00-04:00', price: 101, pctFromPrevClose: 1 },
    { datetime: '2025-06-24T10:00:00-04:00', price: 102, pctFromPrevClose: 2 },
  ],
}

describe('reactionFor', () => {
  it('computes delta across the window', () => {
    expect(reactionFor(a, s, 60).deltaPct).toBeCloseTo(2)
  })
  it('captures from/to prices', () => {
    const r = reactionFor(a, s, 60)
    expect(r.fromPrice).toBe(100)
    expect(r.toPrice).toBe(102)
  })
  it('returns null delta on empty series', () => {
    expect(reactionFor(a, { ...s, points: [] }, 60).deltaPct).toBeNull()
  })
  it('does not mutate inputs', () => {
    const before = JSON.stringify(s)
    reactionFor(a, s, 60)
    expect(JSON.stringify(s)).toBe(before)
  })
  it('tags reaction with ids', () => {
    const r = reactionFor(a, s, 60)
    expect(r.announcementId).toBe('x')
    expect(r.ticker).toBe('SPX')
  })
})

describe('correlateAll', () => {
  it('maps each announcement to an event with one reaction per series', () => {
    const out = correlateAll([a], [s], 60)
    expect(out).toHaveLength(1)
    expect(out[0].reactions).toHaveLength(1)
  })
  it('preserves announcement order', () => {
    const a2 = { ...a, id: 'y', datetime: '2025-06-24T11:00:00-04:00' }
    const out = correlateAll([a, a2], [s], 60)
    expect(out.map((e) => e.announcement.id)).toEqual(['x', 'y'])
  })
})
