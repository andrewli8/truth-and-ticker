import { reactionByType } from '../lib/stats'
import { typeLabel } from '../lib/labels'
import { formatPct } from '../lib/format'
import { useInView } from '../lib/useInView'
import { useReducedMotion } from '../lib/useReducedMotion'
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
  const { ref, inView } = useInView<HTMLElement>()
  const reduced = useReducedMotion()

  return (
    <section
      ref={ref}
      className={styles.band}
      aria-label={`Average ${tickerLabel} reaction by announcement type`}
    >
      <h2 className={styles.intro}>
        Which posts moved <span translate="no">{tickerLabel}</span>?
      </h2>
      <ul className={styles.rows}>
        {rows.map((r, i) => {
          const dir = r.avgPct >= 0 ? 'up' : 'down'
          // Grow from 0 to the value when the section scrolls into view, staggered by row.
          const width = inView ? `${(Math.abs(r.avgPct) / max) * 100}%` : '0%'
          const transitionDelay = reduced ? '0s' : `${i * 0.06}s`
          return (
            <li key={r.type} className={styles.row}>
              <span className={styles.label}>{typeLabel(r.type)}</span>
              <span className={styles.track} aria-hidden="true">
                <span className={`${styles.bar} ${styles[dir]}`} style={{ width, transitionDelay }} />
              </span>
              <span className={`${styles.val} ${styles[dir]}`}>{formatPct(r.avgPct)}</span>
              <span className={styles.count}>n={r.count}</span>
            </li>
          )
        })}
      </ul>
      <p className={styles.note}>
        Average close-to-close <span translate="no">{tickerLabel}</span> move on the day of
        each post, grouped by what the post was. The same kind of post can move different
        markets very differently — switch instruments on the timeline below to compare.
      </p>
    </section>
  )
}
