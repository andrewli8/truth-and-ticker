import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, within } from '@testing-library/react'
import { Filmstrip, type FilmItem } from '../Filmstrip'
import { correlateAll, REACTION_WINDOW_MINS } from '../../lib/correlate'
import { announcements, markets } from '../../data'

const events = correlateAll(announcements, markets, REACTION_WINDOW_MINS)
const items: FilmItem[] = events.map((event) => ({
  event,
  reactionPct: event.reactions.find((r) => r.ticker === 'SPX')?.deltaPct ?? null,
}))

describe('Filmstrip', () => {
  it('renders one option per announcement with the active one selected', () => {
    const { getByRole } = render(
      <Filmstrip items={items} activeIndex={2} onActivate={() => {}} onOpen={() => {}} />,
    )
    const list = getByRole('listbox')
    expect(within(list).getAllByRole('option')).toHaveLength(items.length)
    expect(within(list).getByRole('option', { selected: true })).toHaveAttribute('id', 'film-2')
  })

  it('steps the active index with the arrow keys, Home and End', () => {
    const onActivate = vi.fn()
    const { getByRole } = render(
      <Filmstrip items={items} activeIndex={2} onActivate={onActivate} onOpen={() => {}} />,
    )
    const list = getByRole('listbox')
    fireEvent.keyDown(list, { key: 'ArrowRight' })
    expect(onActivate).toHaveBeenLastCalledWith(3)
    fireEvent.keyDown(list, { key: 'ArrowLeft' })
    expect(onActivate).toHaveBeenLastCalledWith(1)
    fireEvent.keyDown(list, { key: 'Home' })
    expect(onActivate).toHaveBeenLastCalledWith(0)
    fireEvent.keyDown(list, { key: 'End' })
    expect(onActivate).toHaveBeenLastCalledWith(items.length - 1)
  })

  it('opens the active card on click, but only activates a non-active one', () => {
    const onActivate = vi.fn()
    const onOpen = vi.fn()
    const { getByRole, getAllByRole } = render(
      <Filmstrip items={items} activeIndex={2} onActivate={onActivate} onOpen={onOpen} />,
    )
    const options = getAllByRole('option')
    // Clicking the active card zooms in.
    fireEvent.click(getByRole('option', { selected: true }))
    expect(onOpen).toHaveBeenCalledWith(2)
    // Clicking a different card just activates it (onClick path).
    onActivate.mockClear()
    fireEvent.click(options[5])
    expect(onActivate).toHaveBeenCalledWith(5)
  })
})
