import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { TickerRail } from '../TickerRail'
import type { TickerMove } from '../../lib/stats'

const moves: TickerMove[] = [
  { ticker: 'CL', pct: 7.3 },
  { ticker: 'LMT', pct: 3.2 },
  { ticker: 'SPX', pct: null },
]

describe('TickerRail', () => {
  it('renders a chip per move with its symbol and percentage', () => {
    const { getAllByText } = render(<TickerRail moves={moves} />)
    // The marquee duplicates the set, so each symbol appears at least once.
    expect(getAllByText('CL').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText('LMT').length).toBeGreaterThanOrEqual(1)
    expect(getAllByText(/7\.30%/).length).toBeGreaterThanOrEqual(1)
  })
})
