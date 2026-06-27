import { scaleLinear } from 'd3-scale'
import { line, curveMonotoneX } from 'd3-shape'
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

  const { min, max } = domainFor(points)
  const x = scaleLinear()
    .domain([0, Math.max(1, points.length - 1)])
    .range([PAD, width - PAD])
  const y = scaleLinear()
    .domain([min, max])
    .range([height - PAD, PAD])

  const clamped = Math.max(0, Math.min(1, progress))
  const visibleCount = Math.max(1, Math.ceil(clamped * points.length))
  const visible = points.slice(0, visibleCount)

  const generator = line<Point>()
    .x((_d, i) => x(i))
    .y((d) => y(d.price))
    .curve(curveMonotoneX)

  return generator(visible) ?? ''
}
