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
