import { useEffect, useRef, useState } from 'react'

/**
 * Animate a number up to `target` once `start` is true, easing out over ~1.1s.
 * Re-runs whenever `target` changes (e.g. a new selection), so it doubles as a
 * value-transition. Honors reduced motion by snapping straight to the target,
 * and degrades to the target immediately when `target` is null.
 */
export function useCountUp(target: number | null, reduced: boolean, start: boolean): number {
  const [val, setVal] = useState(reduced || target === null ? (target ?? 0) : 0)
  const ref = useRef<number>(0)

  useEffect(() => {
    if (target === null) return
    if (reduced) {
      setVal(target)
      return
    }
    if (!start) return
    let raf = 0
    const startTime = performance.now()
    const dur = 1100
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      ref.current = target * eased
      setVal(ref.current)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, reduced, start])

  return val
}
