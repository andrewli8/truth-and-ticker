/** Formatting helpers. Pure; null/NaN always degrade to 'n/a'. */

const NA = 'n/a'

function isBad(n: number | null | undefined): n is null | undefined {
  return n === null || n === undefined || Number.isNaN(n)
}

/** Signed percentage to 2 decimals, e.g. +1.34% / -0.50%. */
export function formatPct(n: number | null | undefined): string {
  if (isBad(n)) return NA
  const sign = n >= 0 ? '+' : '-'
  return `${sign}${Math.abs(n).toFixed(2)}%`
}

/** Price with thousands grouping and 2 decimals. */
export function formatPrice(n: number | null | undefined): string {
  if (isBad(n)) return NA
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

/**
 * A short cue that a zoomed chart's y-axis floor is the data low, not zero — so
 * the move isn't read as bigger than it is. Empty string when there's no floor.
 */
export function axisFloorLabel(min: number | null | undefined): string {
  if (isBad(min)) return ''
  return `Axis floor ${formatPrice(min)} · not zero-based`
}

const TIME_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const DAY_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  month: 'short',
  day: 'numeric',
})

/** Short Eastern-time day label, e.g. "Jun 21". */
export function formatDay(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return NA
  return DAY_FMT.format(d)
}

/** Render an ISO datetime as an Eastern-time clock label, e.g. "Jun 21, 9:48 PM ET". */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return NA
  const parts = TIME_FMT.formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const month = get('month')
  const day = get('day')
  const hour = get('hour')
  const minute = get('minute')
  const period = get('dayPeriod')
  return `${month} ${day}, ${hour}:${minute} ${period} ET`
}
