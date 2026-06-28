import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountUp } from '../useCountUp'

describe('useCountUp', () => {
  it('snaps straight to the target under reduced motion', () => {
    const { result } = renderHook(() => useCountUp(42, true, true))
    expect(result.current).toBe(42)
  })
  it('reports the target (not NaN) when given null', () => {
    const { result } = renderHook(() => useCountUp(null, true, true))
    expect(result.current).toBe(0)
  })
  it('starts from 0 when motion is allowed and not yet started', () => {
    const { result } = renderHook(() => useCountUp(99, false, false))
    expect(result.current).toBe(0)
  })

  describe('animation path (rAF driven)', () => {
    const origRaf = globalThis.requestAnimationFrame
    const origCancel = globalThis.cancelAnimationFrame
    const origNow = performance.now
    afterEach(() => {
      globalThis.requestAnimationFrame = origRaf
      globalThis.cancelAnimationFrame = origCancel
      performance.now = origNow
      vi.restoreAllMocks()
    })

    it('eases up to the target across frames when motion is allowed', () => {
      const frames: FrameRequestCallback[] = []
      let now = 0
      globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
        frames.push(cb)
        return frames.length
      }) as typeof requestAnimationFrame
      globalThis.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame
      performance.now = () => now

      const { result } = renderHook(() => useCountUp(100, false, true))
      expect(result.current).toBe(0) // pre-animation

      // Drive a mid frame, then the final frame at the end of the ~1.1s ease.
      act(() => {
        now = 550
        frames.shift()?.(now)
      })
      expect(result.current).toBeGreaterThan(0)
      expect(result.current).toBeLessThan(100)

      act(() => {
        now = 1100
        frames.shift()?.(now)
      })
      expect(result.current).toBeCloseTo(100, 0)
    })
  })
})
