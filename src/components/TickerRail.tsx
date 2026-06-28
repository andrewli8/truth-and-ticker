import { formatPct, direction } from '../lib/format'
import { useReducedMotion } from '../lib/useReducedMotion'
import type { TickerMove } from '../lib/stats'
import styles from './TickerRail.module.css'

interface Props {
  /** Each instrument's move for the active event (see `eventMoves`). */
  moves: TickerMove[]
}

function Chip({ m }: { m: TickerMove }) {
  const dir = direction(m.pct)
  return (
    <span className={styles.chip}>
      <span className={styles.sym} translate="no">{m.ticker}</span>
      <span className={`${styles.val} ${styles[dir]}`}>{formatPct(m.pct)}</span>
    </span>
  )
}

export function TickerRail({ moves }: Props) {
  const reduced = useReducedMotion()

  return (
    <div className={`${styles.rail} ${reduced ? styles.static : styles.live}`} aria-hidden="true">
      <div className={styles.track}>
        {moves.map((m) => (
          <Chip key={m.ticker} m={m} />
        ))}
        {/* duplicate set for a seamless marquee loop */}
        {!reduced && moves.map((m) => <Chip key={`dup-${m.ticker}`} m={m} />)}
      </div>
    </div>
  )
}
