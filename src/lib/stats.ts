import { domainFor } from './scales'
import type { Series } from './types'

/** Peak-to-trough move as a percent of the peak (negative = a drawdown). */
export function peakToTroughPct(series: Series): number | null {
  if (series.points.length === 0) return null
  const { min, max } = domainFor(series.points)
  if (max === 0) return null
  return ((min - max) / max) * 100
}

/** Largest run-up from the first point to the window high, as a percent. */
export function maxRunupPct(series: Series): number | null {
  if (series.points.length === 0) return null
  const first = series.points[0].price
  const { max } = domainFor(series.points)
  if (first === 0) return null
  return ((max - first) / first) * 100
}

/** Convenience lookup by ticker. */
export function seriesByTicker(markets: Series[], ticker: string): Series | undefined {
  return markets.find((m) => m.ticker === ticker)
}
