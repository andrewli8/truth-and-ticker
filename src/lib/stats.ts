import { domainFor } from './scales'
import type { Series, AnnType, CorrelatedEvent } from './types'

export interface TickerMove {
  ticker: string
  pct: number | null
}

/**
 * Each instrument's move for an event, ordered biggest-absolute-move first so the
 * ticker rail leads with what actually moved (nulls last). Pure; never mutates.
 */
export function eventMoves(event: CorrelatedEvent): TickerMove[] {
  return event.reactions
    .map((r) => ({ ticker: r.ticker, pct: r.deltaPct }))
    .sort((a, b) => {
      const av = a.pct === null ? -1 : Math.abs(a.pct)
      const bv = b.pct === null ? -1 : Math.abs(b.pct)
      return bv - av
    })
}

/** The instrument that best tells each announcement's story. */
export function spotlightTicker(type: AnnType): string {
  switch (type) {
    case 'market-jawbone':
      return 'CL' // oil — the thing being jawboned
    case 'strike':
      return 'LMT' // defense — the war trade
    case 'tariff':
    case 'trade-deal':
      return 'NDX' // tariffs hit the tech-heavy Nasdaq hardest
    case 'threat':
    case 'ceasefire':
    case 'fed':
    case 'policy':
    default:
      return 'SPX' // the broad market
  }
}

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
