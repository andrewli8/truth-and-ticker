import { describe, it, expect } from 'vitest'
import { announcements, markets } from '../index'
import { correlateAll } from '../../lib/correlate'

describe('dataset integrity', () => {
  it('has at least 6 announcements', () => {
    expect(announcements.length).toBeGreaterThanOrEqual(6)
  })

  it('has unique ids', () => {
    const ids = announcements.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('announcement timestamps are strictly increasing', () => {
    const t = announcements.map((a) => Date.parse(a.datetime))
    expect(t).toEqual([...t].sort((x, y) => x - y))
    expect(new Set(t).size).toBe(t.length)
  })

  it('every announcement carries a real citation', () => {
    announcements.forEach((a) => {
      expect(a.citationUrl).toMatch(/^https?:\/\//)
      expect(a.citationLabel.length).toBeGreaterThan(0)
    })
  })

  it('no NaN or non-finite prices', () => {
    markets.forEach((m) =>
      m.points.forEach((p) => {
        expect(Number.isFinite(p.price)).toBe(true)
        expect(Number.isFinite(p.pctFromPrevClose)).toBe(true)
      }),
    )
  })

  it('market points within each series are time-ordered', () => {
    markets.forEach((m) => {
      const t = m.points.map((p) => Date.parse(p.datetime))
      expect(t).toEqual([...t].sort((x, y) => x - y))
    })
  })

  it('tracks index, oil and defense categories', () => {
    const cats = new Set(markets.map((m) => m.category))
    ;['index', 'oil', 'defense'].forEach((c) => expect(cats.has(c as never)).toBe(true))
  })

  it('pctFromPrevClose is internally consistent with the prices', () => {
    markets.forEach((m) => {
      m.points.forEach((p, i) => {
        if (i === 0) {
          expect(p.pctFromPrevClose).toBe(0)
          return
        }
        const prev = m.points[i - 1].price
        const expected = ((p.price - prev) / prev) * 100
        // stored value is rounded to 2dp; allow a small tolerance
        expect(Math.abs(expected - p.pctFromPrevClose)).toBeLessThan(0.06)
      })
    })
  })

  it('every announcement resolves at least one non-null reaction', () => {
    correlateAll(announcements, markets, 120).forEach((e) => {
      expect(e.reactions.some((r) => r.deltaPct !== null)).toBe(true)
    })
  })
})
