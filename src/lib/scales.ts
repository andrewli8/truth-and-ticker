import { scaleLinear, scaleTime } from 'd3-scale'
import { line, area, curveLinear } from 'd3-shape'
import type { Point } from './types'

const PAD = 24
// Daily closes are discrete; straight segments between them tell the truth.
// A smoothing curve (e.g. monotoneX) would imply intraday motion the data lacks.
const CURVE = curveLinear

/** [minMs, maxMs] epoch range spanning a series' points (fallback to a unit range). */
export function dateDomainOf(points: Point[]): [number, number] {
  if (points.length === 0) return [0, 1]
  const t = points.map((p) => Date.parse(p.datetime))
  return [Math.min(...t), Math.max(...t)]
}

/** X coordinate for an epoch ms within a time domain, padded. */
export function timeX(ms: number, width: number, domain: [number, number]): number {
  return scaleTime().domain(domain).range([PAD, width - PAD])(new Date(ms))
}

/**
 * Inverse of {@link timeX}: the epoch ms under an x coordinate. The x is clamped
 * to the padded plot range so scrubbing past either edge reads the nearest end.
 * Pure.
 */
export function msAtX(x: number, width: number, domain: [number, number]): number {
  const clampedX = Math.max(PAD, Math.min(width - PAD, x))
  return scaleTime().domain(domain).range([PAD, width - PAD]).invert(clampedX).getTime()
}

/** Y coordinate for a price within a value domain, padded (higher price = smaller y). */
export function priceY(price: number, height: number, domain: Domain): number {
  return scaleLinear().domain([domain.min, domain.max]).range([height - PAD, PAD])(price)
}

/**
 * Slice a series to the points within `days` either side of `datetimeISO` — the
 * market action around one event. Pure; preserves order; clamps naturally at the
 * data's edges (fewer points near the start/end). Returns [] for empty input and
 * the whole series (copy) for an unparseable date.
 */
export function windowAround(points: Point[], datetimeISO: string, days: number): Point[] {
  if (points.length === 0) return []
  const center = Date.parse(datetimeISO)
  if (Number.isNaN(center)) return points.slice()
  const half = Math.max(0, days) * 24 * 60 * 60 * 1000
  return points.filter((p) => {
    const t = Date.parse(p.datetime)
    return t >= center - half && t <= center + half
  })
}

/**
 * Nudge an ascending list of 1-D positions so neighbours sit at least `minGap`
 * apart, staying within [min, max]. Non-overlapping inputs pass through
 * unchanged; tight clusters fan out, and a cluster against the upper bound fans
 * back down off `max`. Pure, order-stable, and idempotent.
 */
export function decollide(
  xs: number[],
  minGap: number,
  min = -Infinity,
  max = Infinity,
): number[] {
  if (xs.length === 0) return []
  const out = xs.slice()
  // Forward pass: push right to open up `minGap`.
  for (let i = 1; i < out.length; i++) {
    if (out[i] - out[i - 1] < minGap) out[i] = out[i - 1] + minGap
  }
  // If we ran past the upper bound, pin the last and fan back leftward.
  if (out[out.length - 1] > max) {
    out[out.length - 1] = max
    for (let i = out.length - 2; i >= 0; i--) {
      if (out[i + 1] - out[i] < minGap) out[i] = out[i + 1] - minGap
    }
  }
  // If we crossed the lower bound, pin the first and fan back rightward (mirror of
  // the upper-bound pass) so the min gap is preserved instead of naively clamped.
  if (out[0] < min) {
    out[0] = min
    for (let i = 1; i < out.length; i++) {
      if (out[i] - out[i - 1] < minGap) out[i] = out[i - 1] + minGap
    }
  }
  return out
}

/** Index of the point whose datetime is closest to `ms`, or -1 if none. Pure. */
export function nearestPointIndex(points: Point[], ms: number): number {
  if (points.length === 0) return -1
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < points.length; i++) {
    const dist = Math.abs(Date.parse(points[i].datetime) - ms)
    if (dist < bestDist) {
      bestDist = dist
      best = i
    }
  }
  return best
}

/**
 * SVG path for a compact sparkline of the market action within `days` of an
 * event — the series windowed around `datetimeISO`, drawn full. '' if too sparse.
 * Pure (composes {@link windowAround} + {@link buildLinePath}).
 */
export function sparklinePath(
  points: Point[],
  datetimeISO: string,
  days: number,
  width: number,
  height: number,
): string {
  const win = windowAround(points, datetimeISO, days)
  if (win.length < 2) return ''
  return buildLinePath(win, width, height, 1)
}

/** Price of the last point at or before `ms` (step-hold), or null if none. */
export function valueAt(points: Point[], ms: number): number | null {
  let v: number | null = null
  for (const p of points) {
    if (Date.parse(p.datetime) <= ms) v = p.price
    else break
  }
  return v
}

/** Time-axis SVG line path across the full series. Pure. */
export function timeLinePath(points: Point[], width: number, height: number): string {
  if (points.length === 0) return ''
  const domain = dateDomainOf(points)
  const dom = domainFor(points)
  const gen = line<Point>()
    .x((p) => timeX(Date.parse(p.datetime), width, domain))
    .y((p) => priceY(p.price, height, dom))
    .curve(CURVE)
  return gen(points) ?? ''
}

/** Time-axis SVG area path (filled to baseline) across the full series. Pure. */
export function timeAreaPath(points: Point[], width: number, height: number): string {
  if (points.length === 0) return ''
  const domain = dateDomainOf(points)
  const dom = domainFor(points)
  const gen = area<Point>()
    .x((p) => timeX(Date.parse(p.datetime), width, domain))
    .y0(height - PAD)
    .y1((p) => priceY(p.price, height, dom))
    .curve(CURVE)
  return gen(points) ?? ''
}

export interface Domain {
  min: number
  max: number
}

/** Price min/max for a series; sensible fallback for an empty series. */
export function domainFor(points: Point[]): Domain {
  if (points.length === 0) return { min: 0, max: 1 }
  let min = Infinity
  let max = -Infinity
  for (const p of points) {
    if (p.price < min) min = p.price
    if (p.price > max) max = p.price
  }
  return { min, max }
}

export interface PointPos {
  x: number
  y: number
}

/** Screen-space coordinates for every point, with consistent padding. Pure. */
export function pointPositions(points: Point[], width: number, height: number): PointPos[] {
  if (points.length === 0) return []
  const { min, max } = domainFor(points)
  const x = scaleLinear()
    .domain([0, Math.max(1, points.length - 1)])
    .range([PAD, width - PAD])
  const y = scaleLinear()
    .domain([min, max])
    .range([height - PAD, PAD])
  return points.map((p, i) => ({ x: x(i), y: y(p.price) }))
}

/**
 * SVG path `d` for the visible fraction (`progress` 0–1) of the series.
 * X is time-ordered index across the full width; Y is price within [min,max].
 * Pure — never mutates the input array.
 */
export function buildLinePath(
  points: Point[],
  width: number,
  height: number,
  progress: number,
): string {
  if (points.length === 0) return ''

  const clamped = Math.max(0, Math.min(1, progress))
  const visibleCount = Math.max(1, Math.ceil(clamped * points.length))
  const positions = pointPositions(points, width, height).slice(0, visibleCount)

  const generator = line<PointPos>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(CURVE)

  return generator(positions) ?? ''
}

/**
 * SVG path `d` for the filled area under the visible fraction of the series,
 * closed to a flat baseline at `height - PAD`. Same geometry as
 * {@link buildLinePath} so the fill sits exactly beneath the line. Pure.
 */
export function buildAreaPath(
  points: Point[],
  width: number,
  height: number,
  progress: number,
): string {
  if (points.length === 0) return ''

  const clamped = Math.max(0, Math.min(1, progress))
  const visibleCount = Math.max(1, Math.ceil(clamped * points.length))
  const positions = pointPositions(points, width, height).slice(0, visibleCount)
  const baseline = height - PAD

  const generator = area<PointPos>()
    .x((d) => d.x)
    .y0(baseline)
    .y1((d) => d.y)
    .curve(CURVE)

  return generator(positions) ?? ''
}
