import { useEffect, useRef, type KeyboardEvent } from 'react'
import { formatPct, formatDay, direction } from '../lib/format'
import { typeLabel } from '../lib/labels'
import { useReducedMotion } from '../lib/useReducedMotion'
import type { CorrelatedEvent } from '../lib/types'
import styles from './HubApp.module.css'

export interface FilmItem {
  event: CorrelatedEvent
  reactionPct: number | null
}

interface Props {
  items: FilmItem[]
  activeIndex: number
  onActivate: (index: number) => void
  onOpen: (index: number) => void
}

/**
 * The horizontal timeline filmstrip: one card per announcement, scroll/drag L–R to
 * travel Jan→Jun. The card nearest the centre is "active"; clicking one opens its
 * zoomed detail. Keyboard: ←/→ step, Home/End jump, Enter opens.
 */
export function Filmstrip({ items, activeIndex, onActivate, onOpen }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])
  const reduced = useReducedMotion()

  // Keep the active card centred when the index changes by keyboard/click.
  useEffect(() => {
    const card = cardRefs.current[activeIndex]
    if (card)
      card.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        inline: 'center',
        block: 'nearest',
      })
  }, [activeIndex, reduced])

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        onActivate(Math.min(items.length - 1, activeIndex + 1))
        break
      case 'ArrowLeft':
        e.preventDefault()
        onActivate(Math.max(0, activeIndex - 1))
        break
      case 'Home':
        e.preventDefault()
        onActivate(0)
        break
      case 'End':
        e.preventDefault()
        onActivate(items.length - 1)
        break
    }
  }

  return (
    <div
      ref={trackRef}
      className={styles.track}
      role="listbox"
      aria-label="Announcements timeline — January to June 2025"
      aria-activedescendant={`film-${activeIndex}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {items.map((it, i) => {
        const dir = direction(it.reactionPct)
        const active = i === activeIndex
        return (
          <button
            key={it.event.announcement.id}
            id={`film-${i}`}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            type="button"
            role="option"
            aria-selected={active}
            data-dir={dir}
            className={`${styles.card} ${active ? styles.cardOn : ''}`}
            onClick={() => (active ? onOpen(i) : onActivate(i))}
            onFocus={() => onActivate(i)}
          >
            <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.cardDate}>{formatDay(it.event.announcement.datetime)}</span>
            <span className={styles.cardType}>{typeLabel(it.event.announcement.type)}</span>
            <span className={styles.cardPct} data-dir={dir}>
              {formatPct(it.reactionPct)}
            </span>
            <span className={styles.cardQuote}>
              {it.event.announcement.quote || it.event.announcement.summary}
            </span>
            {active && <span className={styles.cardOpen}>Click to zoom in →</span>}
          </button>
        )
      })}
    </div>
  )
}
