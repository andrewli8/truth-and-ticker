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

  it('renders a sparkline per row when a series is provided, none without', () => {
    const withS = render(<Outro events={events} primaryTicker="SPX" series={spx} />)
    expect(withS.container.querySelectorAll('svg[class*="spark"]').length).toBe(events.length)
    const withoutS = render(<Outro events={events} primaryTicker="SPX" />)
    expect(withoutS.container.querySelectorAll('svg[class*="spark"]').length).toBe(0)
  })

  it('calls onPickEvent with the event id when a row is activated', () => {
    const onPick = vi.fn()
    const { getByRole } = render(<Outro events={events} primaryTicker="SPX" onPickEvent={onPick} />)
    fireEvent.click(getByRole('button', { name: /s1/i }))
    expect(onPick).toHaveBeenCalledWith('a1')
  })
})
