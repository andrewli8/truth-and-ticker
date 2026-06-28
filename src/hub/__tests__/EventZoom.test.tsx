import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'
import { EventZoom } from '../EventZoom'
import { correlateAll, REACTION_WINDOW_MINS } from '../../lib/correlate'
import { eventMoves } from '../../lib/stats'
import { seriesByTicker } from '../../lib/stats'
import { announcements, markets } from '../../data'

const events = correlateAll(announcements, markets, REACTION_WINDOW_MINS)
const event = events[5]
const series = seriesByTicker(markets, 'SPX')!
const moves = eventMoves(event)

function setup(onClose = vi.fn()) {
  const utils = render(
    <EventZoom
      event={event}
      instrumentName="S&P 500"
      reactionPct={event.reactions.find((r) => r.ticker === 'SPX')?.deltaPct ?? null}
      accent="var(--relief)"
      series={series}
      moves={moves}
      onClose={onClose}
    />,
  )
  return { ...utils, onClose }
}

describe('EventZoom', () => {
  it('renders a modal dialog with the quote, the chart, and every move', () => {
    const { getByRole } = setup()
    const dialog = getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    const text = event.announcement.quote || event.announcement.summary
    expect(dialog.textContent).toContain(text.slice(0, 20))
    expect(within(dialog).getByRole('img')).toBeInTheDocument() // the MarketChart
    const nonNull = moves.filter((m) => m.pct !== null).length
    expect(within(dialog).getByRole('list').querySelectorAll('li')).toHaveLength(nonNull)
  })

  it('closes via the close button, Escape, and the backdrop (but not the panel)', () => {
    const { getByRole, onClose } = setup()
    fireEvent.click(getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)

    // Clicking the panel itself must NOT close (stopPropagation).
    const dialog = getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('img'))
    expect(onClose).toHaveBeenCalledTimes(2)
    // Clicking the backdrop closes.
    fireEvent.click(dialog)
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
