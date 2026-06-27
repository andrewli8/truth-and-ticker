import { describe, it, expect } from 'vitest'
import { stepScrollTarget, localProgress } from '../scroll'

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

describe('localProgress', () => {
  it('maps the start of a step to 0 and the end to 1', () => {
    expect(localProgress(0, 11, 0)).toBe(0)
    expect(localProgress(1 / 11, 11, 0)).toBeCloseTo(1)
  })
  it('runs 0→1 within an interior step', () => {
    expect(localProgress(5 / 11, 11, 5)).toBeCloseTo(0)
    expect(localProgress(5.5 / 11, 11, 5)).toBeCloseTo(0.5)
  })
  it('maps the mobile (i+1)/steps encoding to a full reveal', () => {
    expect(localProgress(2 / 11, 11, 1)).toBeCloseTo(1)
    expect(localProgress(11 / 11, 11, 10)).toBeCloseTo(1)
  })
  it('clamps to [0,1] and guards zero steps', () => {
    expect(localProgress(2, 11, 0)).toBe(1)
    expect(localProgress(-1, 11, 0)).toBe(0)
    expect(localProgress(0.5, 0, 0)).toBe(0)
  })
})
