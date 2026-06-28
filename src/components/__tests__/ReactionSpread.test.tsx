import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ReactionSpread } from '../ReactionSpread'
import type { CorrelatedEvent } from '../../lib/types'

function ev(id: string, spx: number | null): CorrelatedEvent {
  return {
    announcement: {
      id, datetime: '2025-01-01T00:00:00-05:00', source: 's', quote: '', summary: `sum-${id}`,
      type: 'tariff', citationUrl: 'https://e.com', citationLabel: 'e',
    },
    reactions: [{ announcementId: id, ticker: 'SPX', deltaPct: spx, fromPrice: 1, toPrice: 1, windowMins: 120 }],
  }
}

const events = [ev('a', 2), ev('b', -1.5), ev('c', null), ev('d', 0.2)]

describe('ReactionSpread', () => {
  it('plots one dot per non-null reaction, coloured by direction', () => {
    const { getAllByTestId } = render(
      <ReactionSpread events={events} ticker="SPX" tickerLabel="S&P 500" />,
    )
    const dots = getAllByTestId('spread-dot')
    expect(dots).toHaveLength(3) // null skipped
    const dirs = dots.map((d) => d.getAttribute('data-dir'))
    expect(dirs).toContain('up')
    expect(dirs).toContain('down')
  })

  it('exposes a descriptive accessible name with the range', () => {
    const { container } = render(
      <ReactionSpread events={events} ticker="SPX" tickerLabel="S&P 500" />,
    )
    const svg = container.querySelector('svg[role="img"]')!
    expect(svg.getAttribute('aria-label')).toMatch(/3 S&P 500 close-to-close reactions/)
    expect(svg.getAttribute('aria-label')).toContain('+2.00%')
  })

  it('renders nothing when no instrument reactions exist', () => {
    const { container } = render(
      <ReactionSpread events={[ev('z', null)]} ticker="SPX" tickerLabel="S&P 500" />,
    )
    expect(container.querySelector('svg')).toBeNull()
  })
})
