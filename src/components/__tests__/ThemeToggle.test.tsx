import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ThemeToggle } from '../ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to light (no dark attribute, offers Dark)', () => {
    const { getByRole } = render(<ThemeToggle />)
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
    expect(getByRole('button').textContent).toContain('Dark')
  })

  it('toggles to dark and persists', () => {
    const { getByRole } = render(<ThemeToggle />)
    fireEvent.click(getByRole('button'))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('toggles back to light', () => {
    const { getByRole } = render(<ThemeToggle />)
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('button'))
    expect(document.documentElement.getAttribute('data-theme')).toBeNull()
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
