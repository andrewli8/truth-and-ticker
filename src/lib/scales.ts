import { scaleLinear, scaleTime } from 'd3-scale'
import { line, area, curveMonotoneX } from 'd3-shape'
import type { Point } from './types'

const PAD = 24

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
    .curve(curveMonotoneX)
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
    .curve(curveMonotoneX)
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
  const visible = points.slice(0, visibleCount)
  const positions = pointPositions(points, width, height).slice(0, visibleCount)

  const generator = line<PointPos>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(curveMonotoneX)

  return generator(visible.map((_p, i) => positions[i])) ?? ''
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
    .curve(curveMonotoneX)

  return generator(positions) ?? ''
}
