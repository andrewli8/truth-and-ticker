import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { AnnouncementCard } from '../AnnouncementCard'
import type { CorrelatedEvent } from '../../lib/types'

const event: CorrelatedEvent = {
  announcement: {
    id: 'ceasefire',
    datetime: '2025-06-24T01:08:00-04:00',
    source: 'Truth Social',
    quote: 'CONGRATULATIONS WORLD, IT’S TIME FOR PEACE!',
    summary: 'Trump announces a complete and total ceasefire.',
    type: 'ceasefire',
    citationUrl: 'https://example.com/ceasefire',
    citationLabel: 'Reuters, Jun 24 2025',
  },
  reactions: [
    { announcementId: 'ceasefire', ticker: 'SPX', deltaPct: 1.2, fromPrice: 6000, toPrice: 6072, windowMins: 120 },
    { announcementId: 'ceasefire', ticker: 'CL', deltaPct: -7.2, fromPrice: 74, toPrice: 68.7, windowMins: 120 },
  ],
}

describe('AnnouncementCard', () => {
  it('renders the verbatim quote', () => {
    const { getByText } = render(<AnnouncementCard event={event} primaryTicker="SPX" />)
    expect(getByText(/IT’S TIME FOR PEACE/)).toBeInTheDocument()
  })

  it('renders a positive delta badge for the primary ticker', () => {
    const { getByTestId } = render(<AnnouncementCard event={event} primaryTicker="SPX" />)
    const badge = getByTestId('delta-badge')
    expect(badge.textContent).toContain('+1.20%')
    expect(badge.className).toMatch(/up/)
  })

  it('hides the decorative quote mark from assistive tech but keeps the words readable', () => {
    const { container, getByText } = render(<AnnouncementCard event={event} primaryTicker="SPX" />)
    const mark = container.querySelector('[aria-hidden="true"]')
    expect(mark).toBeTruthy()
    expect(mark!.textContent).toContain('“')
    // The verbatim quote is its own node, not swallowed by the decorative mark.
    expect(getByText(/IT’S TIME FOR PEACE/).getAttribute('aria-hidden')).toBeNull()
  })

  it('shows secondary instrument reactions and the summary', () => {
    const { getByText } = render(<AnnouncementCard event={event} primaryTicker="SPX" />)
    // CL is a curated secondary ticker present in the reactions.
    expect(getByText('CL')).toBeInTheDocument()
    expect(getByText(/-7\.20%/)).toBeInTheDocument()
    expect(getByText(/complete and total ceasefire/i)).toBeInTheDocument()
  })

  it('links to the citation', () => {
    const { getByRole } = render(<AnnouncementCard event={event} primaryTicker="SPX" />)
    const link = getByRole('link') as HTMLAnchorElement
    expect(link.href).toContain('example.com/ceasefire')
  })

  it('tells assistive tech the citation opens in a new tab', () => {
    const { getByRole } = render(<AnnouncementCard event={event} primaryTicker="SPX" />)
    const link = getByRole('link', { name: /opens in new tab/i }) as HTMLAnchorElement
    expect(link.getAttribute('target')).toBe('_blank')
    // Accessible name keeps the source label and drops the decorative arrow.
    expect(link).toHaveAccessibleName(/Reuters, Jun 24 2025.*opens in new tab/i)
  })
})
