import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MarketChart } from '../MarketChart'
import type { Series } from '../../lib/types'

const series: Series = {
  ticker: 'SPX',
  name: 'S&P 500',
  category: 'index',
  points: [
    { datetime: '2025-06-24T09:00:00-04:00', price: 100, pctFromPrevClose: 0 },
    { datetime: '2025-06-24T10:00:00-04:00', price: 102, pctFromPrevClose: 2 },
    { datetime: '2025-06-24T11:00:00-04:00', price: 99, pctFromPrevClose: -1 },
  ],
}

describe('MarketChart', () => {
  it('renders an svg with a non-empty line path at full progress', () => {
    const { getByTestId } = render(
      <MarketChart series={series} progress={1} accent="#ff4d3d" />,
    )
    const path = getByTestId('line')
    expect(path.getAttribute('d')).toBeTruthy()
    expect(path.getAttribute('d')!.startsWith('M')).toBe(true)
  })

  it('renders the ticker label', () => {
    const { getByText } = render(
      <MarketChart series={series} progress={1} accent="#ff4d3d" />,
    )
    expect(getByText(/S&P 500/)).toBeInTheDocument()
  })
})
