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

  it('opens a breakdown zoom layer from a topic chip', () => {
    const { getByRole, queryByRole } = render(<App />)
    expect(queryByRole('dialog')).toBeNull()
    fireEvent.click(getByRole('button', { name: /which posts moved/i }))
    const dialog = getByRole('dialog')
    expect(within(dialog).getByText(/which posts moved/i)).toBeInTheDocument()
  })

  it('switches the charted instrument across the summary and cards', () => {
    const { getByRole } = render(<App />)
    const group = getByRole('group', { name: /choose the instrument/i })
    const oil = within(group).getByRole('button', { name: 'Oil' })
    expect(oil.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(oil)
    expect(oil.getAttribute('aria-pressed')).toBe('true')
  })

  it('activates a non-active card, then opens it, then closes the zoom', () => {
    const { getByRole, queryByRole } = render(<App />)
    const strip = getByRole('listbox', { name: /timeline/i })
    const options = within(strip).getAllByRole('option')
    // Pick a card that isn't the default selection, then open it.
    const other = options.find((o) => o.getAttribute('aria-selected') === 'false')!
    fireEvent.click(other) // activates (onActivate)
    expect(other.getAttribute('aria-selected')).toBe('true')
    fireEvent.click(other) // now active → opens (onOpen)
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: /close/i }))
    expect(queryByRole('dialog')).toBeNull()
  })

  it('opens an event detail from a ledger row in the breakdown', () => {
    const { getByRole } = render(<App />)
    fireEvent.click(getByRole('button', { name: /full ledger/i }))
    const ledger = getByRole('dialog', { name: /ledger/i })
    const pick = within(ledger).getAllByRole('button', { name: /view on the timeline/i })[0]
    fireEvent.click(pick)
    // The ledger closes and that event's detail (with the chart) opens.
    const detail = getByRole('dialog')
    expect(within(detail).getByRole('img')).toBeInTheDocument()
  })
})
