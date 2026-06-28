import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../useTheme'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('useTheme', () => {
  it('defaults to light with no data-theme attribute', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
  })

  it('toggling to dark sets the attribute and persists', () => {
    const { result } = renderHook(() => useTheme())
    act(() => result.current.toggle())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('reads a persisted dark theme on init', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('honors the OS dark preference when no choice is stored', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('dark'), media: q, addEventListener() {}, removeEventListener() {},
    }))
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('an explicit stored light choice overrides the OS dark preference', () => {
    localStorage.setItem('theme', 'light')
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('dark'), media: q, addEventListener() {}, removeEventListener() {},
    }))
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('defaults to light without throwing when localStorage is unavailable (SSR guard)', () => {
    vi.stubGlobal('localStorage', undefined)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })
})
