import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MasterTimeline } from '../MasterTimeline'
import { announcements, markets } from '../../data'
import { seriesByTicker } from '../../lib/stats'

const spx = seriesByTicker(markets, 'SPX')!

describe('MasterTimeline', () => {
  it('plots one marker per announcement', () => {
    const { getAllByTestId } = render(
      <MasterTimeline series={spx} announcements={announcements} accentFor={() => 'var(--risk)'} />,
    )
    expect(getAllByTestId('marker')).toHaveLength(announcements.length)
  })

  it('renders the series name and a default detail', () => {
    const { getByText, container } = render(
      <MasterTimeline series={spx} announcements={announcements} accentFor={() => 'var(--risk)'} />,
    )
    expect(getByText(new RegExp(spx.name.replace('&', '&')))).toBeInTheDocument()
    expect(container.querySelector('blockquote, p')).toBeTruthy()
  })
})
