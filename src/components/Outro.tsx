import { formatPct, formatTime } from '../lib/format'
import { typeLabel } from '../lib/labels'
import { sparklinePath } from '../lib/scales'
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
  return (
    <section ref={ref} className={`${styles.outro} ${inView ? styles.revealed : ''}`}>
      <h2 className={styles.heading}>Words moved markets. Here is the ledger.</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>When (ET)</th>
            <th>Announcement</th>
            <th>Type</th>
            {series && <th aria-label={`${primaryTicker} around the event`} />}
            <th className={styles.num}>{primaryTicker} reaction</th>
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
                <td className={styles.mono}>{formatTime(e.announcement.datetime)}</td>
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
