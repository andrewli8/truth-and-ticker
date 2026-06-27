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
