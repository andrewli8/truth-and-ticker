import { describe, it, expect } from 'vitest'
import { stepScrollTarget } from '../scroll'

describe('stepScrollTarget', () => {
  // offsetTop 1000, container 11000, innerHeight 1000 => range 10000, 10 steps
  it('centers the first step', () => {
    expect(stepScrollTarget(0, 10, 1000, 11000, 1000)).toBeCloseTo(1000 + 0.05 * 10000)
  })
  it('centers the last step', () => {
    expect(stepScrollTarget(9, 10, 1000, 11000, 1000)).toBeCloseTo(1000 + 0.95 * 10000)
  })
  it('never exceeds the pin range', () => {
    expect(stepScrollTarget(100, 10, 1000, 11000, 1000)).toBeLessThanOrEqual(11000)
  })
  it('handles a container shorter than the viewport', () => {
    expect(stepScrollTarget(2, 10, 500, 800, 1000)).toBe(500)
  })
  it('guards against zero steps', () => {
    expect(stepScrollTarget(0, 0, 1000, 11000, 1000)).toBe(1000)
  })
})
