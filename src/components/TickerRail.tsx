import { formatPct } from '../lib/format'
import { useReducedMotion } from '../lib/useReducedMotion'
import type { Series } from '../lib/types'
import styles from './TickerRail.module.css'

interface Props {
  markets: Series[]
  /** 0–1 scroll progress; selects which point is "current". */
  progress: number
}

function currentPct(s: Series, progress: number): number | null {
  if (s.points.length === 0) return null
  const idx = Math.min(s.points.length - 1, Math.floor(progress * (s.points.length - 1)))
  return s.points[idx].pctFromPrevClose
}

function Chip({ s, progress }: { s: Series; progress: number }) {
  const pct = currentPct(s, progress)
  const dir = pct === null ? 'flat' : pct >= 0 ? 'up' : 'down'
  return (
    <span className={styles.chip}>
      <span className={styles.sym}>{s.ticker}</span>
      <span className={`${styles.val} ${styles[dir]}`}>{formatPct(pct)}</span>
    </span>
  )
}

export function TickerRail({ markets, progress }: Props) {
  const reduced = useReducedMotion()

  return (
    <div className={`${styles.rail} ${reduced ? styles.static : styles.live}`} aria-hidden="true">
      <div className={styles.track}>
        {markets.map((m) => (
          <Chip key={m.ticker} s={m} progress={progress} />
        ))}
        {/* duplicate set for a seamless marquee loop */}
        {!reduced &&
          markets.map((m) => <Chip key={`dup-${m.ticker}`} s={m} progress={progress} />)}
      </div>
    </div>
  )
}
