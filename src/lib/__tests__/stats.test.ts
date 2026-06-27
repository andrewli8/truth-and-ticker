import { describe, it, expect } from 'vitest'
import { peakToTroughPct, maxRunupPct, seriesByTicker } from '../stats'
import type { Series } from '../types'

const s = (ticker: string, prices: number[]): Series => ({
  ticker,
  name: ticker,
  category: 'index',
  points: prices.map((price, i) => ({
    datetime: `2025-06-${12 + i}T16:00:00-04:00`,
    price,
    pctFromPrevClose: 0,
  })),
})

describe('peakToTroughPct', () => {
  it('computes the drawdown from peak to trough', () => {
    // peak 100, trough 80 => -20%
    expect(peakToTroughPct(s('X', [90, 100, 80, 85]))).toBeCloseTo(-20)
  })
  it('returns null on empty series', () => {
    expect(peakToTroughPct({ ...s('X', []), points: [] })).toBeNull()
  })
})

describe('maxRunupPct', () => {
  it('computes run-up from first point to window high', () => {
    // first 100, high 110 => +10%
    expect(maxRunupPct(s('X', [100, 105, 110, 90]))).toBeCloseTo(10)
  })
})

describe('seriesByTicker', () => {
  it('finds a series', () => {
    expect(seriesByTicker([s('A', [1]), s('B', [2])], 'B')?.ticker).toBe('B')
  })
  it('returns undefined when missing', () => {
    expect(seriesByTicker([s('A', [1])], 'Z')).toBeUndefined()
  })
})
