import { scaleLinear } from 'd3-scale'
import { line, area, curveMonotoneX } from 'd3-shape'
import type { Point } from './types'

const PAD = 24

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
