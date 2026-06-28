import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
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

  it('copies a deep-link to the event', () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    window.location.hash = ''
    const { getByRole } = render(
      <EventDetail event={event} accent="var(--relief)" seriesTicker="SPX" reactionPct={1.2} animatedPct={1.2} />,
    )
    fireEvent.click(getByRole('button', { name: /copy link/i }))
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0][0]).toContain('#event-ceasefire')
  })

  it('links to the citation', () => {
    const { getByRole } = render(
      <EventDetail event={event} accent="var(--relief)" seriesTicker="SPX" reactionPct={null} animatedPct={0} />,
    )
    expect((getByRole('link') as HTMLAnchorElement).href).toContain('example.com/ceasefire')
  })
})
