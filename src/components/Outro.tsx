import { useMemo } from 'react'
import { formatPct, formatTime, formatDay } from '../lib/format'
import { typeLabel } from '../lib/labels'
import { sparklinePath } from '../lib/scales'
import { topReactions } from '../lib/stats'
import { useInView } from '../lib/useInView'
import type { CorrelatedEvent, Series } from '../lib/types'
import { ShareButton } from './ShareButton'
import styles from './Outro.module.css'

const SPARK_W = 96
const SPARK_H = 26
const SPARK_DAYS = 10

interface Props {
  events: CorrelatedEvent[]
  primaryTicker: string
  /** Index series used for each row's mini sparkline (optional). */
  series?: Series
  /** Open an event in the master timeline (deep-link + scroll). */
  onPickEvent?: (id: string) => void
}

export function Outro({ events, primaryTicker, series, onPickEvent }: Props) {
  const { ref, inView } = useInView<HTMLElement>()
  // Most dramatic single-day moves across all instruments (VIX excluded so it reads as
  // price moves) — a lead-in to the per-event S&P ledger below.
  const highlights = useMemo(() => topReactions(events, 3, ['VIX'], true), [events])
  return (
    <section ref={ref} className={`${styles.outro} ${inView ? styles.revealed : ''}`}>
      <h2 className={styles.heading}>Words moved markets. Here is the ledger.</h2>
      {highlights.length > 0 && (
        <ul className={styles.highlights} aria-label="Biggest single-day market reactions">
          {highlights.map((h) => {
            const dir = h.deltaPct >= 0 ? 'up' : 'down'
            return (
              <li key={`${h.ticker}-${h.announcement.id}`} className={styles.bigCard}>
                <span className={`${styles.bigVal} ${styles[dir]}`}>{formatPct(h.deltaPct)}</span>
                <span className={styles.bigMeta}>
                  <span translate="no">{h.ticker}</span> · {formatDay(h.announcement.datetime)}
                </span>
                <span className={styles.bigDesc}>{h.announcement.summary}</span>
              </li>
            )
          })}
        </ul>
      )}
      <table className={styles.table}>
        <caption className="srOnly">
          Every announcement with its date, type, the {primaryTicker} price path around it,
          and the {primaryTicker} close-to-close reaction.
        </caption>
        <thead>
          <tr>
            <th scope="col">When (ET)</th>
            <th scope="col">Announcement</th>
            <th scope="col">Type</th>
            {series && (
              <th scope="col" aria-label={`${primaryTicker} price path, ±10 days around the event`}>
                <span translate="no">{primaryTicker}</span> ±10d path
              </th>
            )}
            <th scope="col" className={styles.num}><span translate="no">{primaryTicker}</span> reaction</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => {
            const r = e.reactions.find((x) => x.ticker === primaryTicker) ?? e.reactions[0]
            const delta = r?.deltaPct ?? null
            const dir = delta === null ? 'flat' : delta >= 0 ? 'up' : 'down'
            const spark = series
              ? sparklinePath(series.points, e.announcement.datetime, SPARK_DAYS, SPARK_W, SPARK_H)
              : ''
            return (
              <tr key={e.announcement.id} data-testid="summary-row">
                <td className={styles.mono}>
                  <time dateTime={e.announcement.datetime}>{formatTime(e.announcement.datetime)}</time>
                </td>
                <td>
                  {onPickEvent ? (
                    <button
                      type="button"
                      className={styles.rowBtn}
                      onClick={() => onPickEvent(e.announcement.id)}
                      aria-label={`View on the timeline: ${e.announcement.summary}`}
                    >
                      {e.announcement.summary}
                    </button>
                  ) : (
                    e.announcement.summary
                  )}
                </td>
                <td className={styles.type}>{typeLabel(e.announcement.type)}</td>
                {series && (
                  <td>
                    {spark && (
                      <svg
                        className={`${styles.spark} ${styles[dir]}`}
                        viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
                        width={SPARK_W}
                        height={SPARK_H}
                        aria-hidden="true"
                      >
                        <path d={spark} fill="none" />
                      </svg>
                    )}
                  </td>
                )}
                <td className={`${styles.num} ${styles.mono} ${styles[dir]}`}>{formatPct(delta)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className={styles.method}>
        Methodology: each reaction compares the market’s prior close (the last close
        before the announcement) with its next close (the first close on or after it),
        using publicly reported figures. Every event links to its source. This piece shows
        timing correlation; it does not allege trading by any named individual.
      </p>
      <ShareButton />
    </section>
  )
}
