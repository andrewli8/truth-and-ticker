import { describe, it, expect } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'
import App from '../../App'
import { announcements } from '../../data'

describe('App (one-screen hub)', () => {
  it('renders the masthead, summary, and the timeline filmstrip', () => {
    const { getByText, getByRole } = render(<App />)
    expect(getByText(/Truth/i)).toBeInTheDocument()
    expect(getByText(/announcements/i)).toBeInTheDocument()
    // One option per announcement in the timeline listbox.
    const strip = getByRole('listbox', { name: /timeline/i })
    expect(within(strip).getAllByRole('option')).toHaveLength(announcements.length)
  })

  it('provides a skip-to-content link targeting the main region', () => {
    const { getByText } = render(<App />)
    const skip = getByText('Skip to content') as HTMLAnchorElement
    expect(skip.getAttribute('href')).toBe('#main-content')
  })

  it('links to the standalone POC concept', () => {
    const { getByRole } = render(<App />)
    expect(getByRole('link', { name: /concept/i }).getAttribute('href')).toBe('/poc.html')
  })

  it('opens a zoom detail dialog when the active moment is clicked', () => {
    const { getByRole, queryByRole } = render(<App />)
    expect(queryByRole('dialog')).toBeNull()
    const strip = getByRole('listbox', { name: /timeline/i })
    // The active option defaults to the biggest swing; clicking it zooms in.
    const active = within(strip).getByRole('option', { selected: true })
    fireEvent.click(active)
    const dialog = getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    // The dialog carries the move quote and a close control.
    expect(within(dialog).getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('switches the charted instrument across the summary and cards', () => {
    const { getByRole } = render(<App />)
    const group = getByRole('group', { name: /choose the instrument/i })
    const oil = within(group).getByRole('button', { name: 'Oil' })
    expect(oil.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(oil)
    expect(oil.getAttribute('aria-pressed')).toBe('true')
  })
})
