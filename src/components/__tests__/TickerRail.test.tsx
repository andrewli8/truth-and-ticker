import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { TickerRail } from '../TickerRail'
import type { Series } from '../../lib/types'

const markets: Series[] = [
  {
    ticker: 'LMT',
    name: 'Lockheed Martin',
    category: 'defense',
    points: [
      { datetime: '2025-06-13T09:30:00-04:00', price: 470, pctFromPrevClose: 0 },
      { datetime: '2025-06-13T16:00:00-04:00', price: 485, pctFromPrevClose: 3.2 },
    ],
  },
  {
    ticker: 'CL',
    name: 'WTI Crude',
    category: 'oil',
    points: [
      { datetime: '2025-06-13T09:30:00-04:00', price: 68, pctFromPrevClose: 0 },
      { datetime: '2025-06-13T16:00:00-04:00', price: 73, pctFromPrevClose: 7.3 },
    ],
  },
]

describe('TickerRail', () => {
  it('renders a chip per market with its symbol', () => {
    const { getByText } = render(<TickerRail markets={markets} progress={1} />)
    expect(getByText('LMT')).toBeInTheDocument()
    expect(getByText('CL')).toBeInTheDocument()
  })
})
