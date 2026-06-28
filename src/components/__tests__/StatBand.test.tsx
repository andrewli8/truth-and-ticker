import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { StatBand } from '../StatBand'
import { markets } from '../../data'

describe('StatBand', () => {
  it('renders three stat labels from the dataset', () => {
    const { getByText } = render(<StatBand markets={markets} />)
    expect(getByText('WTI crude')).toBeInTheDocument()
    expect(getByText('Lockheed Martin')).toBeInTheDocument()
    expect(getByText('VIX fear gauge')).toBeInTheDocument()
  })

  it('introduces the whole-term scope (not the 12-day war)', () => {
    const { getByText, queryByText } = render(<StatBand markets={markets} />)
    expect(getByText(/Six months\. Thirty posts\./i)).toBeInTheDocument()
    expect(queryByText(/twelve days/i)).toBeNull()
  })

  it('renders three percentage values (reduced-motion shows final numbers)', () => {
    const { getAllByText } = render(<StatBand markets={markets} />)
    expect(getAllByText(/%/)).toHaveLength(3)
  })

  it('shows the WTI crude drawdown as a negative percent', () => {
    const { getByText } = render(<StatBand markets={markets} />)
    expect(getByText(/^-\d/)).toBeInTheDocument()
  })

  it('does not colour the VIX spike as a gain (neutral tone, not up)', () => {
    const { getByText } = render(<StatBand markets={markets} />)
    const vixCell = getByText('VIX fear gauge').parentElement!
    // A VIX spike is fear/risk-off, not a gain — its value must not be the green 'up' tone.
    expect(vixCell.querySelector('[data-dir]')!.getAttribute('data-dir')).toBe('flat')
    // Sanity: a real gain (Lockheed run-up) still reads 'up'.
    const lmtCell = getByText('Lockheed Martin').parentElement!
    expect(lmtCell.querySelector('[data-dir]')!.getAttribute('data-dir')).toBe('up')
  })

  it('renders "n/a" (not NaN) when the underlying series are missing', () => {
    // No CL/LMT/VIX in the data → each stat value is null → graceful n/a, flat styling.
    const { getAllByText, queryByText } = render(<StatBand markets={[]} />)
    expect(getAllByText(/n\/a/i).length).toBe(3)
    expect(queryByText(/NaN/)).toBeNull()
    // Labels still render so the band keeps its structure.
    expect(queryByText('WTI crude')).toBeInTheDocument()
  })
})
