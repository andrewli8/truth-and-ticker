import { describe, it, expect } from 'vitest'
import { formatPct, formatPrice, formatTime, formatDay, axisFloorLabel, direction } from '../format'

describe('direction', () => {
  it('maps a meaningful positive move to up', () => expect(direction(1.2)).toBe('up'))
  it('maps a meaningful negative move to down', () => expect(direction(-0.5)).toBe('down'))
  it('maps zero and negligible moves (within rounding noise) to flat', () => {
    expect(direction(0)).toBe('flat')
    expect(direction(0.02)).toBe('flat') // e.g. NDX on the Moody's downgrade (+0.023%)
    expect(direction(-0.04)).toBe('flat')
  })
  it('respects a custom flatBelow threshold', () => {
    expect(direction(0.02, 0)).toBe('up') // pure sign when threshold is 0
    expect(direction(0.4, 0.5)).toBe('flat')
  })
  it('maps null / undefined / NaN to flat', () => {
    expect(direction(null)).toBe('flat')
    expect(direction(undefined)).toBe('flat')
    expect(direction(NaN)).toBe('flat')
  })
})

describe('formatPct', () => {
  it('signs positive', () => expect(formatPct(1.337)).toBe('+1.34%'))
  it('signs negative', () => expect(formatPct(-0.5)).toBe('-0.50%'))
  it('zero is signed positive', () => expect(formatPct(0)).toBe('+0.00%'))
  it('handles NaN', () => expect(formatPct(NaN)).toBe('n/a'))
  it('handles null', () => expect(formatPct(null)).toBe('n/a'))
})

describe('axisFloorLabel', () => {
  it('names the floor price and flags it as not zero-based', () => {
    const s = axisFloorLabel(5994.57)
    expect(s).toContain('5,994.57')
    expect(s).toContain('not zero-based')
  })
  it('is empty when there is no floor', () => {
    expect(axisFloorLabel(null)).toBe('')
    expect(axisFloorLabel(NaN)).toBe('')
  })
})

describe('formatPrice', () => {
  it('groups thousands', () => expect(formatPrice(5432.1)).toBe('5,432.10'))
  it('handles null', () => expect(formatPrice(null)).toBe('n/a'))
})

describe('formatTime', () => {
  it('formats to an ET clock label', () => {
    const out = formatTime('2025-06-21T21:48:00-04:00')
    expect(out).toMatch(/Jun 21/)
    expect(out).toMatch(/ET/)
  })
  it('returns n/a for an unparseable datetime (no crash)', () => {
    expect(formatTime('not-a-date')).toBe('n/a')
  })
})

describe('formatDay', () => {
  it('formats a short ET day', () => {
    expect(formatDay('2025-06-21T21:48:00-04:00')).toBe('Jun 21')
  })
  it('handles invalid input', () => {
    expect(formatDay('nope')).toBe('n/a')
  })
})
