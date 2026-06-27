/** Motion helpers — pure, so the animation decisions stay unit-testable. */

export interface DrawOnVars {
  /** stroke-dasharray to lay down (one full path length). */
  dasharray: number
  /** stroke-dashoffset to start from (fully hidden). */
  from: number
  /** stroke-dashoffset to animate to (fully drawn). */
  to: number
}

/**
 * Dash parameters to "draw on" an SVG path of pixel length `len`. Returns null
 * when there is nothing to draw (non-finite or non-positive length), so callers
 * can skip the animation and leave the path in its natural, fully visible state.
 */
export function drawOnVars(len: number): DrawOnVars | null {
  if (!Number.isFinite(len) || len <= 0) return null
  return { dasharray: len, from: len, to: 0 }
}

/**
 * Next index in `[0, len)` stepping by the sign of `dir`, clamped at both ends.
 * A `current` of -1 (nothing selected) enters from the matching edge. Returns
 * -1 for an empty list. Pure — used for keyboard event-stepping.
 */
export function adjacentIndex(len: number, current: number, dir: number): number {
  if (len <= 0) return -1
  if (current < 0) return dir >= 0 ? 0 : len - 1
  return Math.max(0, Math.min(len - 1, current + Math.sign(dir)))
}
