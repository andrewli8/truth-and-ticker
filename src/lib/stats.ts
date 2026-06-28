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

/** Net return from the first to the last point, as a percent. Null if empty. */
export function netReturnPct(series: Series): number | null {
  const pts = series.points
  if (pts.length === 0) return null
  const first = pts[0].price
  if (first === 0) return null
  return ((pts[pts.length - 1].price - first) / first) * 100
}

export interface Drawdown {
  /** Decline from the running peak to the trough, as a percent (≤ 0). */
  pct: number
  /** ISO datetime of the trough where the deepest drawdown bottomed. */
  troughISO: string
}

/**
 * Deepest drawdown: the largest decline from a running peak to a LATER trough,
 * with the trough's date. A running-maximum sweep — the standard risk measure.
 * Null for an empty series.
 */
export function maxDrawdown(series: Series): Drawdown | null {
  if (series.points.length === 0) return null
  let peak = series.points[0].price
  let worst = 0
  let troughISO = series.points[0].datetime
  for (const p of series.points) {
    if (p.price > peak) peak = p.price
    if (peak > 0) {
      const dd = ((p.price - peak) / peak) * 100
      if (dd < worst) {
        worst = dd
        troughISO = p.datetime
      }
    }
  }
  return { pct: worst, troughISO }
}

/** Convenience lookup by ticker. */
export function seriesByTicker(markets: Series[], ticker: string): Series | undefined {
  return markets.find((m) => m.ticker === ticker)
}

/** A single (announcement × instrument) close-to-close reaction. */
export interface RankedReaction {
  announcement: CorrelatedEvent['announcement']
  ticker: string
  deltaPct: number
}

/**
 * The `n` most dramatic single-day reactions across every announcement and instrument,
 * ranked by absolute move (null reactions skipped). `exclude` drops instruments by ticker
 * (e.g. the VIX volatility gauge, so the list reads as price moves). Pure; immutable.
 */
export function topReactions(
  events: CorrelatedEvent[],
  n: number,
  exclude: string[] = [],
  diverse = false,
): RankedReaction[] {
  const skip = new Set(exclude)
  // Same-day posts share one close-to-close reaction; collapse to one per ticker+day so
  // the ranking shows distinct market moments, not the same move repeated.
  const seen = new Set<string>()
  const all: RankedReaction[] = []
  for (const e of events) {
    const day = e.announcement.datetime.slice(0, 10)
    for (const r of e.reactions) {
      if (r.deltaPct === null || skip.has(r.ticker)) continue
      const key = `${r.ticker}@${day}`
      if (seen.has(key)) continue
      seen.add(key)
      all.push({ announcement: e.announcement, ticker: r.ticker, deltaPct: r.deltaPct })
    }
  }
  const ranked = all.sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct))
  if (!diverse) return ranked.slice(0, n)
  // diverse: greedily take the biggest moves while keeping each ticker AND each day
  // unique, so a highlight set reads as distinct moments (no repeated symbol or summary).
  const tickers = new Set<string>()
  const days = new Set<string>()
  const out: RankedReaction[] = []
  for (const r of ranked) {
    const day = r.announcement.datetime.slice(0, 10)
    if (tickers.has(r.ticker) || days.has(day)) continue
    tickers.add(r.ticker)
    days.add(day)
    out.push(r)
    if (out.length === n) break
  }
  return out
}

/** Mean reaction (and sample size) for one announcement type on one instrument. */
export interface TypeAggregate {
  type: AnnType
  avgPct: number
  count: number
}

/**
 * Average close-to-close reaction of `ticker` grouped by announcement type, sorted
 * most-positive first. Null reactions (and types with no usable data) are skipped.
 * Pure; never mutates its inputs. Answers "which kinds of posts moved markets, and
 * which way, on average".
 */
export function reactionByType(events: CorrelatedEvent[], ticker: string): TypeAggregate[] {
  const sums = new Map<AnnType, { total: number; count: number }>()
  for (const e of events) {
    const r = e.reactions.find((x) => x.ticker === ticker)
    if (!r || r.deltaPct === null) continue
    const acc = sums.get(e.announcement.type) ?? { total: 0, count: 0 }
    sums.set(e.announcement.type, { total: acc.total + r.deltaPct, count: acc.count + 1 })
  }
  return [...sums.entries()]
    .map(([type, { total, count }]) => ({ type, avgPct: total / count, count }))
    .sort((a, b) => b.avgPct - a.avgPct)
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
