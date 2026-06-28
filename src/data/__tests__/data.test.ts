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

  it('market points within each series are time-ordered with no duplicate dates', () => {
    markets.forEach((m) => {
      const t = m.points.map((p) => Date.parse(p.datetime))
      expect(t).toEqual([...t].sort((x, y) => x - y))
      expect(new Set(t).size).toBe(t.length) // no duplicate timestamps
    })
  })

  it('all series are aligned (same count and date span)', () => {
    const first = markets[0]
    markets.forEach((m) => {
      expect(m.points.length).toBe(first.points.length)
      expect(m.points[0].datetime).toBe(first.points[0].datetime)
      expect(m.points[m.points.length - 1].datetime).toBe(first.points[first.points.length - 1].datetime)
    })
  })

  it('every announcement type is a known AnnType', () => {
    const known = new Set([
      'strike', 'threat', 'ceasefire', 'market-jawbone', 'tariff', 'trade-deal', 'fed', 'policy',
    ])
    announcements.forEach((a) => expect(known.has(a.type)).toBe(true))
  })

  it('every announcement falls within the market data date range', () => {
    const ms = (s: string) => Date.parse(s)
    const pts = markets[0].points
    const lo = ms(pts[0].datetime)
    const hi = ms(pts[pts.length - 1].datetime)
    announcements.forEach((a) => {
      const t = ms(a.datetime)
      expect(t).toBeGreaterThanOrEqual(lo)
      expect(t).toBeLessThanOrEqual(hi)
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
