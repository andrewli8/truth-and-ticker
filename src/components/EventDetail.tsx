import { useState, type CSSProperties } from 'react'
import { formatPct, formatTime } from '../lib/format'
import { typeLabel } from '../lib/labels'
import { eventShareUrl } from '../lib/hash'
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
}

/** The editorial pull-quote detail panel for the selected master-timeline event. */
export function EventDetail({ event, accent, seriesTicker, reactionPct, animatedPct }: Props) {
  const [copied, setCopied] = useState(false)
  const reactionDir = reactionPct === null ? 'flat' : reactionPct >= 0 ? 'up' : 'down'

  function copyLink() {
    if (typeof window === 'undefined') return
    const url = eventShareUrl(window.location.origin, window.location.pathname, event.id)
    const writer = navigator?.clipboard?.writeText
    if (!writer) return
    writer
      .call(navigator.clipboard, url)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
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
