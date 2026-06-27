import { describe, it, expect } from 'vitest'
import { drawOnVars, adjacentIndex } from '../motion'

describe('drawOnVars', () => {
  it('returns dash params for a positive length', () => {
    expect(drawOnVars(120)).toEqual({ dasharray: 120, from: 120, to: 0 })
  })
  it('animates the offset from the full length down to zero', () => {
    const v = drawOnVars(250)!
    expect(v.from).toBeGreaterThan(v.to)
    expect(v.to).toBe(0)
  })
  it('returns null when there is nothing to draw', () => {
    expect(drawOnVars(0)).toBeNull()
    expect(drawOnVars(-5)).toBeNull()
    expect(drawOnVars(NaN)).toBeNull()
    expect(drawOnVars(Infinity)).toBeNull()
  })
})

describe('adjacentIndex', () => {
  it('steps forward and backward within range', () => {
    expect(adjacentIndex(5, 2, 1)).toBe(3)
    expect(adjacentIndex(5, 2, -1)).toBe(1)
  })
  it('clamps at both ends', () => {
    expect(adjacentIndex(5, 4, 1)).toBe(4)
    expect(adjacentIndex(5, 0, -1)).toBe(0)
  })
  it('enters from the matching edge when nothing is selected', () => {
    expect(adjacentIndex(5, -1, 1)).toBe(0)
    expect(adjacentIndex(5, -1, -1)).toBe(4)
  })
  it('returns -1 for an empty list', () => {
    expect(adjacentIndex(0, -1, 1)).toBe(-1)
  })
})
