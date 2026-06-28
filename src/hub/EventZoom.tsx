import { useEffect, useRef } from 'react'
import { MarketChart } from '../components/MarketChart'
import { formatPct, formatDay, direction } from '../lib/format'
import { typeLabel } from '../lib/labels'
import { INSTRUMENTS } from '../lib/instruments'
import type { TickerMove } from '../lib/stats'
import type { CorrelatedEvent, Series } from '../lib/types'
import styles from './HubApp.module.css'

interface Props {
  event: CorrelatedEvent
  instrumentName: string
  reactionPct: number | null
  accent: string
  /** Windowed series around the event (full reveal). */
  series: Series
  moves: TickerMove[]
  onClose: () => void
}

const NAME_BY_TICKER = new Map(INSTRUMENTS.map((i) => [i.ticker, i.name]))

/**
 * The zoomed detail layer for one announcement: the windowed market chart with the
 * reaction labelled on the line, the full quote, and every instrument's move. A modal
 * dialog — Escape and the backdrop close it; focus is trapped to the close button.
 */
export function EventZoom({ event, instrumentName, reactionPct, accent, series, moves, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const a = event.announcement

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={styles.zoomBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`${formatDay(a.datetime)} — ${typeLabel(a.type)}`}
      onClick={onClose}
    >
      <div
        className={styles.zoom}
        style={{ '--sel': accent } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className={styles.zoomClose} onClick={onClose}>
          Close ✕
        </button>

        <div className={styles.zoomChart}>
          <MarketChart
            series={series}
            progress={1}
            accent={accent}
            momentLabel={`${instrumentName} · ${formatDay(a.datetime)}`}
            reactionPct={reactionPct}
            eventISO={a.datetime}
          />
        </div>

        <div className={styles.zoomCard}>
          <div className={styles.zoomMeta}>
            <span className={styles.zoomTag}>{typeLabel(a.type)}</span>
            <time dateTime={a.datetime}>{formatDay(a.datetime)}</time>
          </div>
          <p className={styles.zoomReaction} data-dir={direction(reactionPct)}>
            {formatPct(reactionPct)}
            <span className={styles.zoomReactionLabel}> · {instrumentName}</span>
          </p>
          <blockquote className={styles.zoomQuote}>
            <span aria-hidden="true">“</span>
            {a.quote || a.summary}
          </blockquote>

          <ul className={styles.zoomMoves} aria-label="Every instrument's move on this event">
            {moves
              .filter((m) => m.pct !== null)
              .map((m) => (
                <li key={m.ticker} data-dir={direction(m.pct)}>
                  <span className={styles.zoomMoveName}>{NAME_BY_TICKER.get(m.ticker) ?? m.ticker}</span>
                  <span className={styles.zoomMovePct}>{formatPct(m.pct)}</span>
                </li>
              ))}
          </ul>

          {a.citationUrl && (
            <a className={styles.zoomCite} href={a.citationUrl} target="_blank" rel="noopener noreferrer">
              {a.citationLabel || 'Source'} <span aria-hidden="true">↗</span>
              <span className="srOnly"> (opens in new tab)</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
