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

// Daily closes: announcement falls between the Jun 23 close and the Jun 24 close.
const s: Series = {
  ticker: 'SPX',
  name: 'S&P 500',
  category: 'index',
  points: [
    { datetime: '2025-06-23T16:00:00-04:00', price: 100, pctFromPrevClose: 0 },
    { datetime: '2025-06-24T16:00:00-04:00', price: 102, pctFromPrevClose: 2 },
    { datetime: '2025-06-25T16:00:00-04:00', price: 101, pctFromPrevClose: -1 },
  ],
}

describe('reactionFor', () => {
  it('computes the close-to-close reaction delta', () => {
    // prior close 100 (Jun 23) -> reaction close 102 (Jun 24) = +2%
    expect(reactionFor(a, s, 120).deltaPct).toBeCloseTo(2)
  })
  it('captures from/to prices', () => {
    const r = reactionFor(a, s, 120)
    expect(r.fromPrice).toBe(100)
    expect(r.toPrice).toBe(102)
  })
  it('returns null delta on empty series', () => {
    expect(reactionFor(a, { ...s, points: [] }, 120).deltaPct).toBeNull()
  })
  it('returns null when there is no reaction close after the announcement', () => {
    const late: Announcement = { ...a, datetime: '2025-12-31T23:59:00-05:00' }
    expect(reactionFor(late, s, 120).deltaPct).toBeNull() // no close on/after → to=null
  })
  it('returns null when there is no prior close', () => {
    const early = { ...a, datetime: '2025-06-01T09:00:00-04:00' }
    expect(reactionFor(early, s, 120).deltaPct).toBeNull()
  })
  it('does not mutate inputs', () => {
    const before = JSON.stringify(s)
    reactionFor(a, s, 120)
    expect(JSON.stringify(s)).toBe(before)
  })
  it('tags reaction with ids and window metadata', () => {
    const r = reactionFor(a, s, 120)
    expect(r.announcementId).toBe('x')
    expect(r.ticker).toBe('SPX')
    expect(r.windowMins).toBe(120)
  })
})

describe('correlateAll', () => {
  it('maps each announcement to an event with one reaction per series', () => {
    const out = correlateAll([a], [s], 120)
    expect(out).toHaveLength(1)
    expect(out[0].reactions).toHaveLength(1)
  })
  it('preserves announcement order', () => {
    const a2 = { ...a, id: 'y', datetime: '2025-06-25T11:00:00-04:00' }
    const out = correlateAll([a, a2], [s], 120)
    expect(out.map((e) => e.announcement.id)).toEqual(['x', 'y'])
  })
})
