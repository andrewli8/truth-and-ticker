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

  it('renders three percentage values (reduced-motion shows final numbers)', () => {
    const { getAllByText } = render(<StatBand markets={markets} />)
    expect(getAllByText(/%/)).toHaveLength(3)
  })

  it('shows the WTI crude drawdown as a negative percent', () => {
    const { getByText } = render(<StatBand markets={markets} />)
    expect(getByText(/^-\d/)).toBeInTheDocument()
  })
})
