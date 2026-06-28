import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'
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

  it('links to the interactive POC concept', () => {
    const { getByRole } = render(<Outro events={events} primaryTicker="SPX" />)
    const link = getByRole('link', { name: /concept/i })
    expect(link).toHaveAttribute('href', '/poc.html')
  })

  it('exposes the ledger as an accessible data table (caption + col-scoped headers)', () => {
    const { container } = render(<Outro events={events} primaryTicker="SPX" series={spx} />)
    expect(container.querySelector('table > caption')).toBeTruthy()
    const headers = container.querySelectorAll('thead th')
    expect(headers.length).toBeGreaterThan(0)
    headers.forEach((th) => expect(th.getAttribute('scope')).toBe('col'))
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

  it('calls onPickEvent with the event id when a ledger row is activated', () => {
    const onPick = vi.fn()
    const { getByRole } = render(<Outro events={events} primaryTicker="SPX" onPickEvent={onPick} />)
    fireEvent.click(within(getByRole('table')).getByRole('button', { name: /s1/i }))
    expect(onPick).toHaveBeenCalledWith('a1')
  })

  it('calls onPickEvent when a highlight card is activated', () => {
    const onPick = vi.fn()
    const { getByRole } = render(<Outro events={events} primaryTicker="SPX" onPickEvent={onPick} />)
    const highlights = getByRole('list', { name: /Biggest single-day market reactions/i })
    // The diverse highlight set keeps one move per ticker — the biggest SPX move (s2/a2).
    fireEvent.click(within(highlights).getByRole('button', { name: /s2/i }))
    expect(onPick).toHaveBeenCalledWith('a2')
  })

  it('renders highlights as static (non-button) when no onPickEvent is provided', () => {
    const { getByRole } = render(<Outro events={events} primaryTicker="SPX" />)
    const highlights = getByRole('list', { name: /Biggest single-day market reactions/i })
    expect(within(highlights).queryAllByRole('button')).toHaveLength(0)
  })
})
