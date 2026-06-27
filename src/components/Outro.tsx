import { formatPct, formatTime } from '../lib/format'
import { typeLabel } from '../lib/labels'
import type { CorrelatedEvent } from '../lib/types'
import { ShareButton } from './ShareButton'
import styles from './Outro.module.css'

interface Props {
  events: CorrelatedEvent[]
  primaryTicker: string
}

export function Outro({ events, primaryTicker }: Props) {
  return (
    <section className={styles.outro}>
      <h2 className={styles.heading}>Words moved markets. Here is the ledger.</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>When (ET)</th>
            <th>Announcement</th>
            <th>Type</th>
            <th className={styles.num}>{primaryTicker} reaction</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => {
            const r = e.reactions.find((x) => x.ticker === primaryTicker) ?? e.reactions[0]
            const delta = r?.deltaPct ?? null
            const dir = delta === null ? 'flat' : delta >= 0 ? 'up' : 'down'
            return (
              <tr key={e.announcement.id} data-testid="summary-row">
                <td className={styles.mono}>{formatTime(e.announcement.datetime)}</td>
                <td>{e.announcement.summary}</td>
                <td className={styles.type}>{typeLabel(e.announcement.type)}</td>
                <td className={`${styles.num} ${styles.mono} ${styles[dir]}`}>{formatPct(delta)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className={styles.method}>
        Methodology: each reaction compares the market&apos;s prior close (the last close
        before the announcement) with its next close (the first close on or after it),
        using publicly reported figures. Every event links to its source. This piece shows
        timing correlation; it does not allege trading by any named individual.
      </p>
      <ShareButton />
    </section>
  )
}
