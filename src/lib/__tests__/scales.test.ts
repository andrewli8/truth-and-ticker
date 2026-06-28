import { describe, it, expect } from 'vitest'
import {
  buildAreaPath,
  buildLinePath,
  domainFor,
  pointPositions,
  dateDomainOf,
  timeX,
  priceY,
  valueAt,
  timeLinePath,
  msAtX,
  windowAround,
  decollide,
  nearestPointIndex,
  sparklinePath,
} from '../scales'
import type { Point } from '../types'

const pts: Point[] = [
  { datetime: '2025-06-24T09:00:00-04:00', price: 100, pctFromPrevClose: 0 },
  { datetime: '2025-06-24T10:00:00-04:00', price: 110, pctFromPrevClose: 10 },
  { datetime: '2025-06-24T11:00:00-04:00', price: 90, pctFromPrevClose: -10 },
  { datetime: '2025-06-24T12:00:00-04:00', price: 105, pctFromPrevClose: 5 },
]

describe('domainFor', () => {
  it('returns min/max price', () => {
    expect(domainFor(pts)).toEqual({ min: 90, max: 110 })
  })
  it('handles empty', () => {
    expect(domainFor([])).toEqual({ min: 0, max: 1 })
  })
})

describe('buildLinePath', () => {
  it('starts with a move command at full progress', () => {
    expect(buildLinePath(pts, 800, 400, 1).startsWith('M')).toBe(true)
  })
  it('uses straight segments (no smoothing) so it invents no motion between closes', () => {
    const d = buildLinePath(pts, 800, 400, 1)
    expect(d).toContain('L') // line-to segments
    expect(d).not.toContain('C') // no cubic-bezier smoothing
  })
  it('returns empty string for no points', () => {
    expect(buildLinePath([], 800, 400, 1)).toBe('')
  })
  it('reveals less at progress 0 than progress 1', () => {
    const partial = buildLinePath(pts, 800, 400, 0)
    const full = buildLinePath(pts, 800, 400, 1)
    expect(partial.length).toBeLessThan(full.length)
  })
  it('does not mutate inputs', () => {
    const before = JSON.stringify(pts)
    buildLinePath(pts, 800, 400, 0.5)
    expect(JSON.stringify(pts)).toBe(before)
  })
})

describe('buildAreaPath', () => {
  const H = 400
  const PAD = 24
  it('starts with a move command at full progress', () => {
    expect(buildAreaPath(pts, 800, H, 1).startsWith('M')).toBe(true)
  })
  it('returns empty string for no points', () => {
    expect(buildAreaPath([], 800, H, 1)).toBe('')
  })
  it('closes to the flat baseline at height - PAD', () => {
    // An area path returns to the baseline y; that y value must appear in `d`.
    expect(buildAreaPath(pts, 800, H, 1)).toContain(String(H - PAD))
  })
  it('reveals less at progress 0 than progress 1', () => {
    const partial = buildAreaPath(pts, 800, H, 0)
    const full = buildAreaPath(pts, 800, H, 1)
    expect(partial.length).toBeLessThan(full.length)
  })
  it('does not mutate inputs', () => {
    const before = JSON.stringify(pts)
    buildAreaPath(pts, 800, H, 0.5)
    expect(JSON.stringify(pts)).toBe(before)
  })
})

describe('time-axis helpers', () => {
  const ms = (s: string) => Date.parse(s)
  it('dateDomainOf spans first to last point', () => {
    expect(dateDomainOf(pts)).toEqual([ms(pts[0].datetime), ms(pts[3].datetime)])
  })
  it('timeX maps domain ends to padded edges and is monotonic', () => {
    const dom = dateDomainOf(pts)
    const xStart = timeX(dom[0], 800, dom)
    const xEnd = timeX(dom[1], 800, dom)
    expect(xStart).toBeLessThan(xEnd)
    expect(xEnd).toBeCloseTo(800 - 24)
  })
  it('priceY puts the max at the top', () => {
    const dom = domainFor(pts)
    expect(priceY(dom.max, 400, dom)).toBeLessThan(priceY(dom.min, 400, dom))
  })
  it('valueAt step-holds the last price at or before a time', () => {
    expect(valueAt(pts, ms('2025-06-24T10:30:00-04:00'))).toBe(110)
    expect(valueAt(pts, ms('2025-06-24T08:00:00-04:00'))).toBeNull()
  })
  it('timeLinePath starts with a move command', () => {
    expect(timeLinePath(pts, 800, 400).startsWith('M')).toBe(true)
    expect(timeLinePath([], 800, 400)).toBe('')
  })
  it('msAtX inverts timeX (round-trips a mid-domain time)', () => {
    const dom = dateDomainOf(pts)
    const mid = ms('2025-06-24T10:30:00-04:00')
    expect(msAtX(timeX(mid, 800, dom), 800, dom)).toBeCloseTo(mid, -3)
  })
  it('msAtX clamps x outside the padded range to the domain ends', () => {
    const dom = dateDomainOf(pts)
    expect(msAtX(-9999, 800, dom)).toBeCloseTo(dom[0], -3)
    expect(msAtX(9999, 800, dom)).toBeCloseTo(dom[1], -3)
  })
  it('msAtX increases left to right', () => {
    const dom = dateDomainOf(pts)
    expect(msAtX(100, 800, dom)).toBeLessThan(msAtX(700, 800, dom))
  })
})

describe('pointPositions', () => {
  it('returns one position per point', () => {
    expect(pointPositions(pts, 800, 400)).toHaveLength(pts.length)
  })
  it('x increases left to right', () => {
    const xs = pointPositions(pts, 800, 400).map((p) => p.x)
    expect(xs).toEqual([...xs].sort((a, b) => a - b))
  })
  it('maps the highest price to the smallest y (top)', () => {
    const pos = pointPositions(pts, 800, 400)
    const yOfMax = pos[1].y // price 110 is the max
    const others = pos.filter((_, i) => i !== 1).map((p) => p.y)
    others.forEach((y) => expect(yOfMax).toBeLessThanOrEqual(y))
  })
})

describe('windowAround', () => {
  const daily: Point[] = Array.from({ length: 11 }, (_, i) => ({
    datetime: `2025-03-${String(i + 1).padStart(2, '0')}T16:00:00-05:00`,
    price: 100 + i,
    pctFromPrevClose: 0,
  }))

  it('keeps points within ±days of the event, centred', () => {
    const win = windowAround(daily, '2025-03-06T16:00:00-05:00', 2)
    // Mar 4,5,6,7,8 are within 2 days of Mar 6 (boundaries inclusive).
    expect(win.map((p) => p.datetime.slice(8, 10))).toEqual(['04', '05', '06', '07', '08'])
  })
  it('clamps at the start of the data', () => {
    const win = windowAround(daily, '2025-03-01T16:00:00-05:00', 2)
    expect(win.map((p) => p.datetime.slice(8, 10))).toEqual(['01', '02', '03'])
  })
  it('preserves order and never mutates the input', () => {
    const before = JSON.stringify(daily)
    const win = windowAround(daily, '2025-03-06T16:00:00-05:00', 3)
    expect(JSON.stringify(daily)).toBe(before)
    const ts = win.map((p) => Date.parse(p.datetime))
    expect(ts).toEqual([...ts].sort((a, b) => a - b))
  })
  it('returns [] for empty input', () => {
    expect(windowAround([], '2025-03-06T12:00:00-05:00', 5)).toEqual([])
  })
})

describe('decollide', () => {
  it('leaves well-separated positions unchanged', () => {
    expect(decollide([0, 50, 100], 16)).toEqual([0, 50, 100])
  })
  it('fans out a tight cluster to the minimum gap', () => {
    expect(decollide([0, 5, 10], 16)).toEqual([0, 16, 32])
  })
  it('fans a cluster back off the upper bound', () => {
    expect(decollide([90, 95, 100], 16, 0, 100)).toEqual([68, 84, 100])
  })
  it('is idempotent', () => {
    const once = decollide([90, 95, 100], 16, 0, 100)
    expect(decollide(once, 16, 0, 100)).toEqual(once)
  })
  it('keeps ascending order and never mutates the input', () => {
    const xs = [10, 12, 14, 200]
    const before = xs.slice()
    const out = decollide(xs, 16)
    expect(xs).toEqual(before)
    expect(out).toEqual([...out].sort((a, b) => a - b))
  })
  it('returns [] for empty input', () => {
    expect(decollide([], 16)).toEqual([])
  })
  it('keeps the min gap and stays idempotent when clamped at the lower bound', () => {
    const out = decollide([20, 40], 30, 30, 100)
    // Every neighbour gap must still be >= minGap, within [min, max].
    for (let i = 1; i < out.length; i++) {
      expect(out[i] - out[i - 1]).toBeGreaterThanOrEqual(30)
    }
    expect(Math.min(...out)).toBeGreaterThanOrEqual(30)
    expect(Math.max(...out)).toBeLessThanOrEqual(100)
    // Re-running must be a no-op.
    expect(decollide(out, 30, 30, 100)).toEqual(out)
  })
})

describe('sparklinePath', () => {
  const daily: Point[] = Array.from({ length: 11 }, (_, i) => ({
    datetime: `2025-03-${String(i + 1).padStart(2, '0')}T16:00:00-05:00`,
    price: 100 + i,
    pctFromPrevClose: 0,
  }))
  it('draws a line path for the window around the event', () => {
    const d = sparklinePath(daily, '2025-03-06T16:00:00-05:00', 3, 80, 24)
    expect(d.startsWith('M')).toBe(true)
  })
  it('is empty when the window has fewer than two points', () => {
    expect(sparklinePath(daily, '2024-01-01T00:00:00-05:00', 1, 80, 24)).toBe('')
    expect(sparklinePath([], '2025-03-06T16:00:00-05:00', 3, 80, 24)).toBe('')
  })
})

describe('nearestPointIndex', () => {
  const ms = (s: string) => Date.parse(s)
  it('returns -1 for an empty series', () => {
    expect(nearestPointIndex([], ms('2025-06-24T10:00:00-04:00'))).toBe(-1)
  })
  it('finds the exact match', () => {
    expect(nearestPointIndex(pts, ms('2025-06-24T11:00:00-04:00'))).toBe(2)
  })
  it('picks the closer neighbour for an in-between time', () => {
    // 10:40 is closer to the 11:00 point (index 2) than the 10:00 point (index 1)
    expect(nearestPointIndex(pts, ms('2025-06-24T10:40:00-04:00'))).toBe(2)
  })
  it('clamps to the ends for out-of-range times', () => {
    expect(nearestPointIndex(pts, ms('2025-06-24T06:00:00-04:00'))).toBe(0)
    expect(nearestPointIndex(pts, ms('2025-06-24T23:00:00-04:00'))).toBe(pts.length - 1)
  })
})
