/**
 * Document scrollY that lands mid-way through step `i` of a pinned stage.
 *
 * The stage is pinned while the page scrolls from `offsetTop` (container top at
 * viewport top) to `offsetTop + containerHeight - innerHeight` (container bottom
 * at viewport bottom). Progress is linear across that range, so step `i` of
 * `steps` is centered at p = (i + 0.5) / steps.
 */
export function stepScrollTarget(
  i: number,
  steps: number,
  offsetTop: number,
  containerHeight: number,
  innerHeight: number,
): number {
  if (steps <= 0) return offsetTop
  const range = Math.max(0, containerHeight - innerHeight)
  const p = Math.min(1, Math.max(0, (i + 0.5) / steps))
  return offsetTop + p * range
}

/**
 * Convert whole-scrolly progress (0–1 across all steps) into progress WITHIN the
 * active step (0→1), so each panel's content animates over its own screen rather
 * than over the whole stage. The mobile encoding global = (i+1)/steps maps to 1.
 * Pure.
 */
export function localProgress(global: number, steps: number, step: number): number {
  if (steps <= 0) return 0
  return Math.min(1, Math.max(0, global * steps - step))
}
