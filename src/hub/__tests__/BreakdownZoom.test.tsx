import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'
import { BreakdownZoom } from '../BreakdownZoom'
import { correlateAll, REACTION_WINDOW_MINS } from '../../lib/correlate'
import { announcements, markets } from '../../data'

const events = correlateAll(announcements, markets, REACTION_WINDOW_MINS)

function setup(initialView: 'category' | 'spread' | 'ledger' = 'category') {
  const onClose = vi.fn()
  const onPickEvent = vi.fn()
  const utils = render(
    <BreakdownZoom
      initialView={initialView}
      initialTicker="SPX"
      events={events}
      onPickEvent={onPickEvent}
      onClose={onClose}
    />,
  )
  return { ...utils, onClose, onPickEvent }
}

describe('BreakdownZoom', () => {
  it('opens on the requested view and switches views via the tabs', () => {
    const { getByRole } = setup('category')
    const dialog = getByRole('dialog')
    expect(within(dialog).getByText(/which posts moved/i)).toBeInTheDocument()
    // Switch to the distribution view without reopening.
    fireEvent.click(within(dialog).getByRole('tab', { name: /distribution/i }))
    expect(within(dialog).getByText(/most posts nudge/i)).toBeInTheDocument()
    // Switch to the ledger view.
    fireEvent.click(within(dialog).getByRole('tab', { name: /ledger/i }))
    expect(within(dialog).getByRole('table')).toBeInTheDocument()
  })

  it('re-titles the category view when the instrument switcher changes', () => {
    const { getByRole } = setup('category')
    const dialog = getByRole('dialog')
    expect(within(dialog).getByText(/which posts moved/i).textContent).toMatch(/S&P 500/)
    const group = within(dialog).getByRole('group', { name: /choose the instrument/i })
    fireEvent.click(within(group).getByRole('button', { name: 'Oil' }))
    expect(within(dialog).getByText(/which posts moved/i).textContent).toMatch(/Oil/)
  })

  it('forwards ledger row picks', () => {
    const { getByRole, onPickEvent } = setup('ledger')
    const dialog = getByRole('dialog')
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
