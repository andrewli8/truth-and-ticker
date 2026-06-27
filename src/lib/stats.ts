import { domainFor } from './scales'
import { formatPrice, formatPct, formatDay } from './format'
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

/**
 * Largest run-up in the series: the biggest rise from a trough to any LATER high,
 * as a percent of that trough. Found with a running-minimum sweep. Null for an
 * empty series. (Not just first→high — the trough can occur anywhere.)
 */
export function maxRunupPct(series: Series): number | null {
  if (series.points.length === 0) return null
  let lowSoFar = series.points[0].price
  let best = 0
  for (const p of series.points) {
    if (lowSoFar > 0) {
      const runup = ((p.price - lowSoFar) / lowSoFar) * 100
      if (runup > best) best = runup
    }
    if (p.price < lowSoFar) lowSoFar = p.price
  }
  return best
}

/** Convenience lookup by ticker. */
export function seriesByTicker(markets: Series[], ticker: string): Series | undefined {
  return markets.find((m) => m.ticker === ticker)
}

/**
 * A spoken-language accessible name for a chart: the instrument, the window it
 * covers, and its first→last move — so screen readers get the data, not just
 * "price line". Pure.
 */
export function chartAriaLabel(series: Series, momentLabel?: string): string {
  const pts = series.points
  if (pts.length === 0) return `${series.name} price chart`
  const first = pts[0].price
  const last = pts[pts.length - 1].price
  const pct = first ? ((last - first) / first) * 100 : null
  const moment = momentLabel ? `, ${momentLabel} window` : ''
  return `${series.name}${moment}: ${formatPrice(first)} to ${formatPrice(last)}, ${formatPct(pct)}`
}

/**
 * Accessible name for the full-period overview chart: the instrument, the dates it
 * spans, and its overall first→last move. Pure.
 */
export function timelineAriaLabel(series: Series): string {
  const pts = series.points
  if (pts.length === 0) return `${series.name} timeline`
  const first = pts[0]
  const last = pts[pts.length - 1]
  const pct = first.price ? ((last.price - first.price) / first.price) * 100 : null
  return `${series.name}, ${formatDay(first.datetime)} to ${formatDay(last.datetime)}: ${formatPct(pct)} over the period`
}
