import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MasterTimeline } from '../MasterTimeline'
import { announcements, markets } from '../../data'
import { seriesByTicker } from '../../lib/stats'
import type { Announcement } from '../../lib/types'

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

  it('leaves the line fully drawn (no dash offset) under reduced motion', () => {
    const { container } = render(
      <MasterTimeline series={spx} announcements={announcements} accentFor={() => 'var(--risk)'} />,
    )
    const line = container.querySelector('path[data-line]') as SVGPathElement
    expect(line).toBeTruthy()
    expect(line.getAttribute('d')).toBeTruthy()
    // The reveal must never strand the line hidden when motion is disabled.
    expect(line.style.strokeDashoffset === '' || line.style.strokeDashoffset === '0').toBe(true)
  })

  it('renders the detail quote with an aria-hidden decorative mark', () => {
    const withQuote: Announcement[] = [
      {
        id: 'x',
        datetime: '2025-03-01T12:00:00-05:00',
        source: 'Truth Social',
        quote: 'TARIFFS ARE COMING',
        summary: 'context',
        type: 'tariff',
        citationUrl: 'https://example.com',
        citationLabel: 'L',
      },
    ]
    const { container, getByText } = render(
      <MasterTimeline series={spx} announcements={withQuote} accentFor={() => 'var(--risk)'} />,
    )
    const mark = container.querySelector('article [aria-hidden="true"]')
    expect(mark?.textContent).toContain('“')
    // The decorative mark is separate from the verbatim words.
    const words = getByText('TARIFFS ARE COMING')
    expect(words.getAttribute('aria-hidden')).toBeNull()
  })

  it('shows the index reaction for the selected event', () => {
    const { getByTestId } = render(
      <MasterTimeline series={spx} announcements={announcements} accentFor={() => 'var(--risk)'} />,
    )
    const reaction = getByTestId('reaction')
    expect(reaction).toBeInTheDocument()
    // A signed percentage (or n/a when the series lacks coverage) renders.
    expect(reaction.textContent).toMatch(/[+\-−]?\d|n\/a/)
    expect(reaction.textContent).toContain(spx.ticker)
  })

  it('steps the selected event with the arrow keys', () => {
    const { getAllByTestId } = render(
      <MasterTimeline series={spx} announcements={announcements} accentFor={() => 'var(--risk)'} />,
    )
    const markers = getAllByTestId('marker')
    // The last announcement is selected by default (aria-pressed).
    const lastIdx = announcements.length - 1
    expect(markers[lastIdx].getAttribute('aria-pressed')).toBe('true')
    // ArrowLeft from the last marker selects its predecessor.
    fireEvent.keyDown(markers[lastIdx], { key: 'ArrowLeft' })
    expect(getAllByTestId('marker')[lastIdx - 1].getAttribute('aria-pressed')).toBe('true')
    expect(getAllByTestId('marker')[lastIdx].getAttribute('aria-pressed')).toBe('false')
  })

  it('filters markers when a legend category is toggled off', () => {
    const { getByRole, getAllByTestId } = render(
      <MasterTimeline series={spx} announcements={announcements} accentFor={() => 'var(--risk)'} />,
    )
    const before = getAllByTestId('marker').length
    const riskBtn = getByRole('button', { name: /risk-off/i })
    expect(riskBtn.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(riskBtn)
    expect(riskBtn.getAttribute('aria-pressed')).toBe('false')
    expect(getAllByTestId('marker').length).toBeLessThan(before)
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
