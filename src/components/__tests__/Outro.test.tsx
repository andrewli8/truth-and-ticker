import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Outro } from '../Outro'
import type { CorrelatedEvent } from '../../lib/types'

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
})
