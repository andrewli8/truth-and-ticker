import { describe, it, expect } from 'vitest'
import { drawOnVars } from '../motion'

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
