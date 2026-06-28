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

  it('renders "n/a" (not NaN) when the underlying series are missing', () => {
    // No CL/LMT/VIX in the data → each stat value is null → graceful n/a, flat styling.
    const { getAllByText, queryByText } = render(<StatBand markets={[]} />)
    expect(getAllByText(/n\/a/i).length).toBe(3)
    expect(queryByText(/NaN/)).toBeNull()
    // Labels still render so the band keeps its structure.
    expect(queryByText('WTI crude')).toBeInTheDocument()
  })
})
