import { describe, it, expect, afterEach } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'
import App from '../../App'
import { announcements } from '../../data'

afterEach(() => {
  window.location.hash = ''
})

describe('App', () => {
  it('renders the hero thesis and the outro ledger without throwing', () => {
    const { getByText, getAllByTestId } = render(<App />)
    expect(getByText(/The timing is the story/i)).toBeInTheDocument()
    expect(getAllByTestId('summary-row').length).toBeGreaterThanOrEqual(6)
  })

  it('provides a skip-to-content link targeting the main region', () => {
    const { getByText } = render(<App />)
    const skip = getByText('Skip to content') as HTMLAnchorElement
    expect(skip.getAttribute('href')).toBe('#main-content')
  })

  it('ledger → deep-link → timeline selection flows end to end', () => {
    const { getAllByTestId, getByTestId } = render(<App />)
    const first = announcements[0]
    // Activate the first ledger row's "view on the timeline" button.
    const rows = getAllByTestId('summary-row')
    const btn = within(rows[0]).getByRole('button')
    fireEvent.click(btn)
    // The App wires the row to a deep-link for that exact event (the timeline's
    // re-selection on hashchange is covered in MasterTimeline's own tests).
    expect(window.location.hash).toBe(`#event-${first.id}`)
    expect(getByTestId('detail')).toBeInTheDocument()
  })
})
