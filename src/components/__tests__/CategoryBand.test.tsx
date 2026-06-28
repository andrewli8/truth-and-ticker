import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CategoryBand } from '../CategoryBand'
import { announcements, markets } from '../../data'
import { correlateAll } from '../../lib/correlate'

const events = correlateAll(announcements, markets, 120)

describe('CategoryBand', () => {
  it('renders a labelled row per announcement type with a signed percentage', () => {
    const { getByText, getAllByText, getByLabelText } = render(
      <CategoryBand events={events} ticker="SPX" tickerLabel="S&P 500" />,
    )
    // Section is announced for assistive tech.
    expect(getByLabelText(/Average S&P 500 reaction by announcement type/i)).toBeInTheDocument()
    // Known type labels appear.
    expect(getByText('Tariff')).toBeInTheDocument()
    expect(getByText('Ceasefire')).toBeInTheDocument()
    // Several percentage values render.
    expect(getAllByText(/%/).length).toBeGreaterThan(1)
    // Sample-size annotations render.
    expect(getAllByText(/^n=\d+$/).length).toBeGreaterThan(1)
  })

  it('notes the cross-instrument caveat and points to the switcher', () => {
    const { getByText } = render(
      <CategoryBand events={events} ticker="SPX" tickerLabel="S&P 500" />,
    )
    expect(getByText(/move different\s+markets very differently/i)).toBeInTheDocument()
    expect(getByText(/switch instruments to compare/i)).toBeInTheDocument()
  })

  it('renders nothing breaking when there are no events', () => {
    const { container, queryAllByText } = render(
      <CategoryBand events={[]} ticker="SPX" tickerLabel="S&P 500" />,
    )
    expect(container.querySelector('section')).toBeTruthy()
    expect(queryAllByText(/^n=\d+$/)).toHaveLength(0)
  })
})
