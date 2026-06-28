import { type CSSProperties } from 'react'
import { formatPct, formatTime } from '../lib/format'
import { typeLabel, accentVar } from '../lib/labels'
import type { CorrelatedEvent } from '../lib/types'
import styles from './AnnouncementCard.module.css'

/** Curated secondary tickers surfaced on the card: oil, defense, fear gauge. */
const SECONDARY = ['CL', 'LMT', 'VIX']

interface Props {
  event: CorrelatedEvent
  primaryTicker: string
}

export function AnnouncementCard({ event, primaryTicker }: Props) {
  const { announcement, reactions } = event
  const primary = reactions.find((r) => r.ticker === primaryTicker) ?? reactions[0]
  const delta = primary?.deltaPct ?? null
  const dir = delta === null ? 'flat' : delta >= 0 ? 'up' : 'down'
  const secondary = SECONDARY.filter((t) => t !== primary?.ticker)
    .map((t) => reactions.find((r) => r.ticker === t))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))

  const accentStyle = { '--accent': accentVar(announcement.type) } as CSSProperties

  return (
    <article className={styles.card} style={accentStyle}>
      <header className={styles.meta}>
        <span className={styles.tag}>{typeLabel(announcement.type)}</span>
        <time className={styles.time} dateTime={announcement.datetime}>{formatTime(announcement.datetime)}</time>
      </header>

      <blockquote className={styles.quote}>
        <span className={styles.mark} aria-hidden="true">“</span>
        <span className={styles.quoteText}>{announcement.quote || announcement.summary}</span>
      </blockquote>
      {announcement.quote && <p className={styles.summary}>{announcement.summary}</p>}

      <div className={styles.reactionRow}>
        <span data-testid="delta-badge" className={`${styles.badge} ${styles[dir]}`}>
          <span translate="no">{primary?.ticker}</span> {formatPct(delta)}
        </span>
        <div className={styles.others}>
          {secondary.map((r) => (
            <span key={r.ticker} className={styles.other}>
              <b>{r.ticker}</b> {formatPct(r.deltaPct)}
            </span>
          ))}
        </div>
      </div>

      <footer className={styles.foot}>
        <span className={styles.source}>{announcement.source}</span>
        <a className={styles.cite} href={announcement.citationUrl} target="_blank" rel="noreferrer">
          {announcement.citationLabel} <span aria-hidden="true">↗</span>
          <span className="srOnly"> (opens in new tab)</span>
        </a>
      </footer>
    </article>
  )
}
