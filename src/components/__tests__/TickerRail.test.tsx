import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { TickerRail } from '../TickerRail'
import type { TickerMove } from '../../lib/stats'

// Force motion on so the marquee-duplicate branch is exercised (the jsdom test env
// otherwise reports reduced-motion, which skips the duplicate set).
vi.mock('../../lib/useReducedMotion', () => ({ useReducedMotion: () => false }))

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

  it('renders the duplicated marquee set (live, aria-hidden) when motion is allowed', () => {
    const { getAllByText, container } = render(<TickerRail moves={moves} />)
    // Original + seamless-loop duplicate ⇒ each symbol appears exactly twice.
    expect(getAllByText('CL')).toHaveLength(2)
    const rail = container.firstChild as HTMLElement
    expect(rail.className).toMatch(/live/)
    expect(rail.getAttribute('aria-hidden')).toBe('true')
  })
})
