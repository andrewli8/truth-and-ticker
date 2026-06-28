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

  it('renders a gradient area fill beneath the line', () => {
    const { getByTestId } = render(
      <MarketChart series={series} progress={1} accent="#ff4d3d" />,
    )
    const area = getByTestId('area')
    expect(area.getAttribute('d')).toBeTruthy()
    expect(area.getAttribute('fill')).toBe('url(#chartFill)')
  })

  it('renders the ticker label', () => {
    const { getByText } = render(
      <MarketChart series={series} progress={1} accent="#ff4d3d" />,
    )
    expect(getByText(/S&P 500/)).toBeInTheDocument()
  })

  it('shows the current price at full progress', () => {
    const { getAllByText } = render(<MarketChart series={series} progress={1} accent="#ff4d3d" />)
    // 99.00 = last point's price (also coincides with the low gridline label).
    expect(getAllByText(/99\.00/).length).toBeGreaterThanOrEqual(1)
  })

  it('reveals less of the line at low progress than at full', () => {
    const { getByTestId, rerender } = render(
      <MarketChart series={series} progress={0} accent="#ff4d3d" />,
    )
    const atZero = getByTestId('line').getAttribute('d')!.length
    rerender(<MarketChart series={series} progress={1} accent="#ff4d3d" />)
    const atFull = getByTestId('line').getAttribute('d')!.length
    expect(atZero).toBeLessThan(atFull)
  })

  it('renders the reaction callout with the formatted value when reactionPct is provided', () => {
    const { getByTestId } = render(
      <MarketChart series={series} progress={1} accent="#ff4d3d" reactionPct={0.88} />,
    )
    const callout = getByTestId('reaction-callout')
    expect(callout).toBeInTheDocument()
    expect(callout.textContent).toContain('+0.88%')
    expect(callout.getAttribute('data-dir')).toBe('up')
  })

  it('marks a negative reaction as a down move', () => {
    const { getByTestId } = render(
      <MarketChart series={series} progress={1} accent="#ff4d3d" reactionPct={-1.2} />,
    )
    const callout = getByTestId('reaction-callout')
    expect(callout.textContent).toContain('-1.20%')
    expect(callout.getAttribute('data-dir')).toBe('down')
  })

  it('anchors the reaction callout at the event, independent of scroll progress', () => {
    const eventISO = series.points[1].datetime
    const { getByTestId, rerender } = render(
      <MarketChart series={series} progress={0.2} accent="#ff4d3d" reactionPct={0.88} eventISO={eventISO} />,
    )
    const xLow = getByTestId('reaction-callout').getAttribute('x')
    rerender(
      <MarketChart series={series} progress={1} accent="#ff4d3d" reactionPct={0.88} eventISO={eventISO} />,
    )
    const xFull = getByTestId('reaction-callout').getAttribute('x')
    // Pinned to the event's data point, so it does not slide with the reveal.
    expect(xLow).toBe(xFull)
    // A fixed marker anchors the label at the event point.
    expect(getByTestId('event-dot')).toBeInTheDocument()
  })

  it('falls back to the playhead anchor (no event ring) when eventISO is omitted', () => {
    const { getByTestId, queryByTestId } = render(
      <MarketChart series={series} progress={1} accent="#ff4d3d" reactionPct={0.88} />,
    )
    // The reaction still shows (anchored at the playhead, the legacy behaviour)…
    expect(getByTestId('reaction-callout').textContent).toContain('+0.88%')
    // …but without eventISO there's no fixed event-point ring.
    expect(queryByTestId('event-dot')).toBeNull()
  })

  it('omits the reaction callout when reactionPct is null or absent', () => {
    const { queryByTestId, rerender } = render(
      <MarketChart series={series} progress={1} accent="#ff4d3d" reactionPct={null} />,
    )
    expect(queryByTestId('reaction-callout')).toBeNull()
    rerender(<MarketChart series={series} progress={1} accent="#ff4d3d" />)
    expect(queryByTestId('reaction-callout')).toBeNull()
  })

  it('preserves aspect ratio so slopes are not distorted', () => {
    const { container } = render(
      <MarketChart series={series} progress={1} accent="#ff4d3d" />,
    )
    const svg = container.querySelector('svg')!
    // Non-uniform scaling ("none") would stretch the line and lie about slopes.
    expect(svg.getAttribute('preserveAspectRatio')).not.toBe('none')
  })
})
