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

  it('does not persist a derived (OS) default — only explicit choices are stored', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q.includes('dark'), media: q, addEventListener() {}, removeEventListener() {},
    }))
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark') // followed the OS…
    expect(localStorage.getItem('theme')).toBeNull() // …but didn't freeze it as a choice
    act(() => result.current.toggle()) // an explicit choice DOES persist
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('toggles without throwing when localStorage.setItem fails (e.g. private mode)', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => { throw new Error('QuotaExceeded') },
      removeItem: () => {},
      clear: () => {},
    })
    const { result } = renderHook(() => useTheme())
    expect(() => act(() => result.current.toggle())).not.toThrow()
    expect(result.current.theme).toBe('dark')
  })

  it('defaults to light without throwing when localStorage is unavailable (SSR guard)', () => {
    vi.stubGlobal('localStorage', undefined)
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })
})
