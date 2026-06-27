import { describe, it, expect } from 'vitest'
import { buildAreaPath, buildLinePath, domainFor, pointPositions } from '../scales'
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
