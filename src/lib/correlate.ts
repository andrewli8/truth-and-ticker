import type { Announcement, Series, Reaction, CorrelatedEvent, Point } from './types'

/** First point at or after the given epoch ms, or null. Assumes points sorted ascending. */
function pointAtOrAfter(points: Point[], targetMs: number): Point | null {
  for (const p of points) {
    if (Date.parse(p.datetime) >= targetMs) return p
  }
  return null
}

/**
 * Market reaction to an announcement: price at announcement time (or just after)
 * vs. price `windowMins` later. Missing data yields null deltas, never NaN.
 */
export function reactionFor(a: Announcement, s: Series, windowMins: number): Reaction {
  const startMs = Date.parse(a.datetime)
  const from = pointAtOrAfter(s.points, startMs)
  const to = pointAtOrAfter(s.points, startMs + windowMins * 60_000)

  const fromPrice = from ? from.price : null
  const toPrice = to ? to.price : null
  const deltaPct =
    fromPrice !== null && toPrice !== null && fromPrice !== 0
      ? ((toPrice - fromPrice) / fromPrice) * 100
      : null

  return {
    announcementId: a.id,
    ticker: s.ticker,
    deltaPct,
    fromPrice,
    toPrice,
    windowMins,
  }
}

/** Correlate every announcement against every tracked series. Order-preserving, immutable. */
export function correlateAll(
  announcements: Announcement[],
  markets: Series[],
  windowMins: number,
): CorrelatedEvent[] {
  return announcements.map((a) => ({
    announcement: a,
    reactions: markets.map((s) => reactionFor(a, s, windowMins)),
  }))
}
