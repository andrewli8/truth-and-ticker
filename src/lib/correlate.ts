import type { Announcement, Series, Reaction, CorrelatedEvent, Point } from './types'

/**
 * Default comparison basis for a market reaction, in minutes. Retained as metadata
 * on each {@link Reaction}; the overview and deep-dive must share it so their
 * correlations never silently diverge.
 */
export const REACTION_WINDOW_MINS = 120

/** Last point strictly before the given epoch ms, or null. Assumes points sorted ascending. */
function lastPointBefore(points: Point[], targetMs: number): Point | null {
  let found: Point | null = null
  for (const p of points) {
    if (Date.parse(p.datetime) < targetMs) found = p
    else break
  }
  return found
}

/** First point at or after the given epoch ms, or null. Assumes points sorted ascending. */
function firstPointAtOrAfter(points: Point[], targetMs: number): Point | null {
  for (const p of points) {
    if (Date.parse(p.datetime) >= targetMs) return p
  }
  return null
}

/**
 * Market reaction to an announcement, measured close-to-close: the price recorded
 * just BEFORE the announcement (the prior close) vs. the first price recorded ON OR
 * AFTER it (the reaction close — the next session for after-hours/weekend news).
 * Missing data on either side yields a null delta, never NaN. `windowMins` is retained
 * as metadata describing the comparison basis.
 */
export function reactionFor(a: Announcement, s: Series, windowMins: number): Reaction {
  const annMs = Date.parse(a.datetime)
  const from = lastPointBefore(s.points, annMs)
  const to = firstPointAtOrAfter(s.points, annMs)

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
