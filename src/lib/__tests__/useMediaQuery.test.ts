import { describe, it, expect, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMediaQuery } from '../useMediaQuery'

const original = window.matchMedia

function mockMatchMedia(matches: boolean) {
  window.matchMedia = ((query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
}

afterEach(() => {
  window.matchMedia = original
})

describe('useMediaQuery', () => {
  it('returns true when the query matches', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 100px)'))
    expect(result.current).toBe(true)
  })

  it('returns false when the query does not match', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 9999px)'))
    expect(result.current).toBe(false)
  })

  it('is SSR-safe: returns false when matchMedia is unavailable', () => {
    // @ts-expect-error simulate an environment without matchMedia
    delete window.matchMedia
    const { result } = renderHook(() => useMediaQuery('(min-width: 100px)'))
    expect(result.current).toBe(false)
  })
})
