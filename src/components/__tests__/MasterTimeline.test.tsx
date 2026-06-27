import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
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

  it('reveals a live scrub crosshair on pointer move', () => {
    const { container, queryByTestId, getByTestId } = render(
      <MasterTimeline series={spx} announcements={announcements} accentFor={() => 'var(--risk)'} />,
    )
    const svg = container.querySelector('svg')!
    // jsdom reports a zero-size rect; mock a real layout so scrub() maps the cursor.
    svg.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 1000, height: 420, right: 1000, bottom: 420, x: 0, y: 0, toJSON() {} }) as DOMRect

    expect(queryByTestId('scrub')).toBeNull()
    // jsdom's PointerEvent doesn't carry clientX from init, so define it explicitly.
    const move = new Event('pointermove', { bubbles: true })
    Object.defineProperty(move, 'clientX', { value: 500 })
    Object.defineProperty(move, 'clientY', { value: 120 })
    fireEvent(svg, move)
    expect(getByTestId('scrub')).toBeInTheDocument()
    fireEvent.pointerLeave(svg)
    expect(queryByTestId('scrub')).toBeNull()
  })
})
