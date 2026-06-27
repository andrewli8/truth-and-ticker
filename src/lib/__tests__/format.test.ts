import { describe, it, expect } from 'vitest'
import { formatPct, formatPrice, formatTime } from '../format'

describe('formatPct', () => {
  it('signs positive', () => expect(formatPct(1.337)).toBe('+1.34%'))
  it('signs negative', () => expect(formatPct(-0.5)).toBe('-0.50%'))
  it('zero is signed positive', () => expect(formatPct(0)).toBe('+0.00%'))
  it('handles NaN', () => expect(formatPct(NaN)).toBe('n/a'))
  it('handles null', () => expect(formatPct(null)).toBe('n/a'))
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
})
