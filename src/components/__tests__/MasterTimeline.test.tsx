import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MasterTimeline } from '../MasterTimeline'
import { announcements, markets } from '../../data'
import { seriesByTicker } from '../../lib/stats'
import type { Announcement } from '../../lib/types'

const spx = seriesByTicker(markets, 'SPX')!

const twoEvents: Announcement[] = [
  { id: 'a', datetime: '2025-03-01T16:00:00-05:00', source: 's', quote: 'Q', summary: 'first', type: 'tariff', citationUrl: '', citationLabel: '' },
  { id: 'b', datetime: '2025-04-01T16:00:00-04:00', source: 's', quote: 'Q2', summary: 'second', type: 'policy', citationUrl: '', citationLabel: '' },
]

afterEach(() => {
  window.location.hash = ''
})

describe('MasterTimeline', () => {
  it('plots one marker per announcement', () => {
    const { getAllByTestId } = render(
      <MasterTimeline series={spx} announcements={announcements} accentFor={() => 'var(--risk)'} />,
    )
    expect(getAllByTestId('marker')).toHaveLength(announcements.length)
  })

  it('exposes the interactive chart as a group (not a leaf image)', () => {
    const { container } = render(
      <MasterTimeline series={spx} announcements={announcements} accentFor={() => 'var(--risk)'} />,
    )
    // role="group" keeps the focusable marker buttons exposed to assistive tech.
    const svg = container.querySelector('svg[role="group"]')
    expect(svg).toBeTruthy()
    expect(svg!.getAttribute('aria-label')).toBeTruthy()
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

  it('jumps to the deep-dive only when a featured marker is activated', () => {
    const anns: Announcement[] = [
      { id: 'f', datetime: '2025-03-01T16:00:00-05:00', source: 's', quote: 'Q', summary: 'feat', type: 'tariff', citationUrl: '', citationLabel: '', featured: true },
      { id: 'n', datetime: '2025-04-01T16:00:00-04:00', source: 's', quote: 'Q2', summary: 'plain', type: 'policy', citationUrl: '', citationLabel: '' },
    ]
    const onJump = vi.fn()
    const { getAllByTestId } = render(
      <MasterTimeline series={spx} announcements={anns} accentFor={() => 'var(--risk)'} onJump={onJump} />,
    )
    const markers = getAllByTestId('marker')
    fireEvent.click(markers[0]) // featured → jumps
    expect(onJump).toHaveBeenCalledWith('f')
    onJump.mockClear()
    fireEvent.click(markers[1]) // not featured → no jump
    expect(onJump).not.toHaveBeenCalled()
  })

  it('opens the event named in the URL hash on load', () => {
    window.location.hash = '#event-a'
    const { getAllByTestId } = render(
      <MasterTimeline series={spx} announcements={twoEvents} accentFor={() => 'var(--risk)'} />,
    )
    const markers = getAllByTestId('marker')
    expect(markers[0].getAttribute('aria-pressed')).toBe('true') // 'a', not the default last
    expect(markers[1].getAttribute('aria-pressed')).toBe('false')
  })

  it('writes the selected event to the URL hash on activation', () => {
    const { getAllByTestId } = render(
      <MasterTimeline series={spx} announcements={twoEvents} accentFor={() => 'var(--risk)'} />,
    )
    fireEvent.click(getAllByTestId('marker')[0])
    expect(window.location.hash).toBe('#event-a')
  })

  it('re-selects when the URL hash changes after load', () => {
    const { getAllByTestId } = render(
      <MasterTimeline series={spx} announcements={twoEvents} accentFor={() => 'var(--risk)'} />,
    )
    // Default selection is the last event ('b').
    expect(getAllByTestId('marker')[1].getAttribute('aria-pressed')).toBe('true')
    window.location.hash = '#event-a'
    fireEvent(window, new Event('hashchange'))
    expect(getAllByTestId('marker')[0].getAttribute('aria-pressed')).toBe('true')
    // An unknown hash is ignored (selection unchanged).
    window.location.hash = '#event-zzz'
    fireEvent(window, new Event('hashchange'))
    expect(getAllByTestId('marker')[0].getAttribute('aria-pressed')).toBe('true')
  })

  it('announces selection changes via an aria-live detail region', () => {
    const { getByTestId } = render(
      <MasterTimeline series={spx} announcements={twoEvents} accentFor={() => 'var(--risk)'} />,
    )
    expect(getByTestId('detail').getAttribute('aria-live')).toBe('polite')
  })

  it('copies a deep-link to the selected event', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    window.location.hash = '#event-a'
    const { getByRole } = render(
      <MasterTimeline series={spx} announcements={twoEvents} accentFor={() => 'var(--risk)'} />,
    )
    fireEvent.click(getByRole('button', { name: /copy link/i }))
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText.mock.calls[0][0]).toContain('#event-a')
  })

  it('overlays the benchmark when "compare" is toggled (and only for other instruments)', () => {
    const cl = seriesByTicker(markets, 'CL')!
    const { getByRole, queryByTestId } = render(
      <MasterTimeline
        series={cl}
        announcements={announcements}
        accentFor={() => 'var(--risk)'}
        benchmark={spx}
      />,
    )
    expect(queryByTestId('compare-line')).toBeNull()
    fireEvent.click(getByRole('button', { name: /vs S&P 500/i }))
    expect(queryByTestId('compare-line')).toBeTruthy()
  })

  it('hides the compare control when viewing the benchmark itself', () => {
    const { queryByRole } = render(
      <MasterTimeline
        series={spx}
        announcements={announcements}
        accentFor={() => 'var(--risk)'}
        benchmark={spx}
      />,
    )
    expect(queryByRole('button', { name: /vs S&P 500/i })).toBeNull()
  })

  it('offers an instrument switcher and reports picks', () => {
    const onPick = vi.fn()
    const instruments = [
      { ticker: 'SPX', name: 'S&P 500' },
      { ticker: 'CL', name: 'Oil' },
    ]
    const { getByRole } = render(
      <MasterTimeline
        series={spx}
        announcements={twoEvents}
        accentFor={() => 'var(--risk)'}
        instruments={instruments}
        onPickInstrument={onPick}
      />,
    )
    const spxBtn = getByRole('button', { name: 'S&P 500' })
    expect(spxBtn.getAttribute('aria-pressed')).toBe('true') // active = series.ticker
    fireEvent.click(getByRole('button', { name: 'Oil' }))
    expect(onPick).toHaveBeenCalledWith('CL')
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
