import { reactionByType } from '../lib/stats'
import { typeLabel } from '../lib/labels'
import { formatPct } from '../lib/format'
import type { CorrelatedEvent } from '../lib/types'
import styles from './CategoryBand.module.css'

interface Props {
  /** Correlated events (announcement + per-instrument reactions). */
  events: CorrelatedEvent[]
  /** Instrument to summarise (e.g. 'SPX'). */
  ticker: string
  /** Human label for the instrument (e.g. 'S&P 500'). */
  tickerLabel: string
}

/**
 * "Which kinds of posts moved the market?" — the mean close-to-close reaction of one
 * instrument grouped by announcement type, as sign-coloured bars. Pure presentational.
 */
export function CategoryBand({ events, ticker, tickerLabel }: Props) {
  const rows = reactionByType(events, ticker)
  const max = Math.max(...rows.map((r) => Math.abs(r.avgPct)), 0.01)

  return (
    <section
      className={styles.band}
      aria-label={`Average ${tickerLabel} reaction by announcement type`}
    >
      <h2 className={styles.intro}>
        Which posts moved the <span translate="no">{tickerLabel}</span>?
      </h2>
      <ul className={styles.rows}>
        {rows.map((r) => {
          const dir = r.avgPct >= 0 ? 'up' : 'down'
          const width = `${(Math.abs(r.avgPct) / max) * 100}%`
          return (
            <li key={r.type} className={styles.row}>
              <span className={styles.label}>{typeLabel(r.type)}</span>
              <span className={styles.track} aria-hidden="true">
                <span className={`${styles.bar} ${styles[dir]}`} style={{ width }} />
              </span>
              <span className={`${styles.val} ${styles[dir]}`}>{formatPct(r.avgPct)}</span>
              <span className={styles.count}>n={r.count}</span>
            </li>
          )
        })}
      </ul>
      <p className={styles.note}>
        Average close-to-close move on the day of each post, grouped by what the post was.
      </p>
    </section>
  )
}
