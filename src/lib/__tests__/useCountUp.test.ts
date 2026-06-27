import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
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
})
