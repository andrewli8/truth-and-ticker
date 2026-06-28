import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'
import { BreakdownZoom } from '../BreakdownZoom'
import { correlateAll, REACTION_WINDOW_MINS } from '../../lib/correlate'
import { seriesByTicker } from '../../lib/stats'
import { announcements, markets } from '../../data'

const events = correlateAll(announcements, markets, REACTION_WINDOW_MINS)
const series = seriesByTicker(markets, 'SPX')!

function setup(view: 'category' | 'spread' | 'ledger', overrides = {}) {
  const onClose = vi.fn()
  const onPickEvent = vi.fn()
  const utils = render(
    <BreakdownZoom
      view={view}
      events={events}
      ticker="SPX"
      instrumentName="S&P 500"
      series={series}
      onPickEvent={onPickEvent}
      onClose={onClose}
      {...overrides}
    />,
  )
  return { ...utils, onClose, onPickEvent }
}

describe('BreakdownZoom', () => {
  it('renders the category breakdown view', () => {
    const { getByRole } = setup('category')
    expect(within(getByRole('dialog')).getByText(/which posts moved/i)).toBeInTheDocument()
  })

  it('renders the reaction-spread view', () => {
    const { getByRole } = setup('spread')
    // ReactionSpread renders an SVG chart with a data-rich accessible name.
    expect(within(getByRole('dialog')).getByRole('img')).toBeInTheDocument()
  })

  it('renders the ledger view and forwards row picks', () => {
    const { getByRole, onPickEvent } = setup('ledger')
    const dialog = getByRole('dialog')
    expect(within(dialog).getByRole('table')).toBeInTheDocument()
    const pick = within(dialog).getAllByRole('button', { name: /view on the timeline/i })[0]
    fireEvent.click(pick)
    expect(onPickEvent).toHaveBeenCalledTimes(1)
  })

  it('closes via the close button, Escape, and the backdrop', () => {
    const { getByRole, onClose } = setup('category')
    fireEvent.click(getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
    fireEvent.click(getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
