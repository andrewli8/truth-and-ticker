import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { EventDetail } from '../EventDetail'
import type { Announcement } from '../../lib/types'

const event: Announcement = {
  id: 'ceasefire',
  datetime: '2025-06-24T01:08:00-04:00',
  source: 'Truth Social',
  quote: 'IT’S TIME FOR PEACE!',
  summary: 'Trump announces a ceasefire.',
  type: 'ceasefire',
  citationUrl: 'https://example.com/ceasefire',
  citationLabel: 'Reuters, Jun 24 2025',
}

describe('EventDetail', () => {
  it('renders the quote, reaction, and an aria-live region', () => {
    const { getByText, getByTestId } = render(
      <EventDetail event={event} accent="var(--relief)" seriesTicker="SPX" reactionPct={1.2} animatedPct={1.2} />,
    )
    expect(getByText(/IT’S TIME FOR PEACE/)).toBeInTheDocument()
    expect(getByTestId('reaction').textContent).toContain('+1.20%')
    expect(getByTestId('detail').getAttribute('aria-live')).toBe('polite')
  })

  it('copies a deep-link to the event', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    window.location.hash = ''
    const { getByRole } = render(
      <EventDetail event={event} accent="var(--relief)" seriesTicker="SPX" reactionPct={1.2} animatedPct={1.2} />,
    )
    fireEvent.click(getByRole('button', { name: /copy link/i }))
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0][0]).toContain('#event-ceasefire')
    // Await the post-copy state update so it's wrapped in act (button shows confirmation).
    await waitFor(() => expect(getByRole('button').textContent).toMatch(/copied/i))
  })

  it('shows other instruments\' moves but not the already-shown series', () => {
    const moves = [
      { ticker: 'SPX', pct: 1.2 },
      { ticker: 'CL', pct: -2.5 },
      { ticker: 'GLD', pct: 0.8 },
      { ticker: 'VIX', pct: null }, // null moves are skipped
    ]
    const { getByLabelText, queryByText } = render(
      <EventDetail event={event} accent="var(--relief)" seriesTicker="SPX" reactionPct={1.2} animatedPct={1.2} moves={moves} />,
    )
    const strip = getByLabelText(/other instruments/i)
    expect(strip.textContent).toContain('CL')
    expect(strip.textContent).toContain('-2.50%')
    expect(strip.textContent).toContain('GLD')
    // The shown series (SPX) isn't repeated in the strip, and null moves are omitted.
    expect(strip.textContent).not.toContain('SPX')
    expect(strip.textContent).not.toContain('VIX')
    void queryByText
  })

  it('omits the cross-instrument strip when no moves are provided', () => {
    const { queryByLabelText } = render(
      <EventDetail event={event} accent="var(--relief)" seriesTicker="SPX" reactionPct={1.2} animatedPct={1.2} />,
    )
    expect(queryByLabelText(/other instruments/i)).toBeNull()
  })

  it('links to the citation', () => {
    const { getByRole } = render(
      <EventDetail event={event} accent="var(--relief)" seriesTicker="SPX" reactionPct={null} animatedPct={0} />,
    )
    expect((getByRole('link') as HTMLAnchorElement).href).toContain('example.com/ceasefire')
  })

  it('announces that the citation link opens in a new tab', () => {
    const { getByRole } = render(
      <EventDetail event={event} accent="var(--relief)" seriesTicker="SPX" reactionPct={null} animatedPct={0} />,
    )
    const link = getByRole('link', { name: /opens in new tab/i }) as HTMLAnchorElement
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link).toHaveAccessibleName(/Reuters, Jun 24 2025.*opens in new tab/i)
  })
})
