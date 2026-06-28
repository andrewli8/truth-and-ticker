import { useEffect, useState, type CSSProperties } from 'react'
import { formatPct, formatTime, direction } from '../lib/format'
import { typeLabel } from '../lib/labels'
import { eventShareUrl } from '../lib/hash'
import type { TickerMove } from '../lib/stats'
import type { Announcement } from '../lib/types'
import styles from './EventDetail.module.css'

interface Props {
  event: Announcement
  /** Accent color for the spine/tag (event-type color). */
  accent: string
  /** Ticker of the series whose reaction is shown. */
  seriesTicker: string
  /** Index reaction for the event; `animatedPct` is the counted-up display value. */
  reactionPct: number | null
  animatedPct: number
  /** All instruments' moves for this event (incl. the shown series); biggest first. */
  moves?: TickerMove[]
}

/** The editorial pull-quote detail panel for the selected master-timeline event. */
export function EventDetail({ event, accent, seriesTicker, reactionPct, animatedPct, moves }: Props) {
  const [copied, setCopied] = useState(false)

  // Reset the "copied" flag after 2s, cleaning the timer up on unmount/re-copy.
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])
  const reactionDir = direction(reactionPct)
  // The OTHER instruments' moves (the shown series already has its own reaction line),
  // biggest first — the cross-instrument picture, which is otherwise only visible in the
  // deep-dive and only for featured events.
  const otherMoves = (moves ?? []).filter((m) => m.ticker !== seriesTicker && m.pct !== null)

  function copyLink() {
    if (typeof window === 'undefined') return
    const url = eventShareUrl(window.location.origin, window.location.pathname, event.id)
    const writer = navigator?.clipboard?.writeText
    if (!writer) return
    writer
      .call(navigator.clipboard, url)
      .then(() => {
        setCopied(true)
      })
      .catch(() => {})
  }

  return (
    <article
      className={styles.detail}
      style={{ '--sel': accent } as CSSProperties}
      aria-live="polite"
      data-testid="detail"
    >
      <div className={styles.detailMeta}>
        <span className={styles.detailTag}>{typeLabel(event.type)}</span>
        <time dateTime={event.datetime}>{formatTime(event.datetime)}</time>
      </div>
      {event.quote ? (
        <blockquote className={styles.detailQuote}>
          <span className={styles.detailMark} aria-hidden="true">“</span>
          <span className={styles.detailQuoteText}>{event.quote}</span>
        </blockquote>
      ) : (
        <p className={styles.detailQuote}>
          <span className={styles.detailQuoteText}>{event.summary}</span>
        </p>
      )}
      <div className={styles.detailReaction} data-testid="reaction">
        <span className={styles.reactionValue} data-dir={reactionDir}>
          {formatPct(reactionPct === null ? null : animatedPct)}
        </span>
        <span className={styles.reactionLabel}>
          <span translate="no">{seriesTicker}</span> · prior close → next close
        </span>
      </div>
      {otherMoves.length > 0 && (
        <ul className={styles.detailMoves} aria-label="Other instruments' reactions">
          {otherMoves.map((m) => (
            <li key={m.ticker} className={styles.move} data-dir={direction(m.pct)}>
              <span translate="no">{m.ticker}</span> {formatPct(m.pct)}
            </li>
          ))}
        </ul>
      )}
      <div className={styles.detailFoot}>
        <span>{event.source}</span>
        <span className={styles.detailActions}>
          <button type="button" className={styles.copyLink} onClick={copyLink}>
            {copied ? 'Link copied ✓' : 'Copy link'}
          </button>
          <a href={event.citationUrl} target="_blank" rel="noreferrer">
            {event.citationLabel} <span aria-hidden="true">↗</span>
            <span className="srOnly"> (opens in new tab)</span>
          </a>
        </span>
      </div>
    </article>
  )
}
