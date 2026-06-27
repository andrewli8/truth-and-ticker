import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useInView } from '../useInView'

describe('useInView', () => {
  it('defaults to true when IntersectionObserver is unavailable (jsdom)', () => {
    const { result } = renderHook(() => useInView<HTMLDivElement>())
    expect(result.current.inView).toBe(true)
    expect(result.current.ref).toBeDefined()
  })
})
