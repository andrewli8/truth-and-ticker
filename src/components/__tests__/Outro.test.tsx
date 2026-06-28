import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Outro } from '../Outro'
import { markets } from '../../data'
import { seriesByTicker } from '../../lib/stats'
import type { CorrelatedEvent } from '../../lib/types'

const spx = seriesByTicker(markets, 'SPX')!

const events: CorrelatedEvent[] = [
  {
    announcement: {
      id: 'a1', datetime: '2025-06-13T02:00:00-04:00', source: 'Truth Social',
      quote: 'q1', summary: 's1', type: 'strike',
      citationUrl: 'https://e.com/1', citationLabel: 'AP',
    },
    reactions: [{ announcementId: 'a1', ticker: 'SPX', deltaPct: -1.1, fromPrice: 1, toPrice: 1, windowMins: 120 }],
  },
  {
    announcement: {
      id: 'a2', datetime: '2025-06-24T01:00:00-04:00', source: 'Truth Social',
      quote: 'q2', summary: 's2', type: 'ceasefire',
      citationUrl: 'https://e.com/2', citationLabel: 'Reuters',
    },
    reactions: [{ announcementId: 'a2', ticker: 'SPX', deltaPct: 1.2, fromPrice: 1, toPrice: 1, windowMins: 120 }],
  },
]

describe('Outro', () => {
  it('renders one data row per event', () => {
    const { getAllByTestId } = render(<Outro events={events} primaryTicker="SPX" />)
    expect(getAllByTestId('summary-row')).toHaveLength(2)
  })

  it('leads with a "biggest single-day reactions" highlight (top moves, VIX excluded)', () => {
    const { getByLabelText } = render(<Outro events={events} primaryTicker="SPX" />)
    const list = getByLabelText(/Biggest single-day market reactions/i)
    // At most 3 highlight cards, each showing a percentage.
    const cards = list.querySelectorAll('li')
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.length).toBeLessThanOrEqual(3)
    expect(list.textContent).toMatch(/%/)
  })

  it('renders a sparkline per row when a series is provided, none without', () => {
    const withS = render(<Outro events={events} primaryTicker="SPX" series={spx} />)
    expect(withS.container.querySelectorAll('svg[class*="spark"]').length).toBe(events.length)
    const withoutS = render(<Outro events={events} primaryTicker="SPX" />)
    expect(withoutS.container.querySelectorAll('svg[class*="spark"]').length).toBe(0)
  })

  it('omits a row sparkline when the series has no points near that event', () => {
    // Series provided, but its dates don't overlap the events' windows → empty spark path.
    const farSeries = {
      ticker: 'SPX',
      name: 'SPX',
      category: 'index' as const,
      points: [
        { datetime: '2024-01-01T16:00:00-04:00', price: 100, pctFromPrevClose: 0 },
        { datetime: '2024-01-02T16:00:00-04:00', price: 101, pctFromPrevClose: 1 },
      ],
    }
    const { container } = render(<Outro events={events} primaryTicker="SPX" series={farSeries} />)
    // The column header still renders (series is provided) but no row draws a sparkline.
    expect(container.querySelectorAll('svg[class*="spark"]').length).toBe(0)
  })

  it('labels the sparkline column with a visible header describing the window', () => {
    const { getByText } = render(<Outro events={events} primaryTicker="SPX" series={spx} />)
    const header = getByText(/±10d/i)
    expect(header.tagName).toBe('TH')
  })

  it('calls onPickEvent with the event id when a row is activated', () => {
    const onPick = vi.fn()
    const { getByRole } = render(<Outro events={events} primaryTicker="SPX" onPickEvent={onPick} />)
    fireEvent.click(getByRole('button', { name: /s1/i }))
    expect(onPick).toHaveBeenCalledWith('a1')
  })
})
