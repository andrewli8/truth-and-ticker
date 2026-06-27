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

export function TickerRail({ markets, progress }: Props) {
  const reduced = useReducedMotion()

  return (
    <div className={`${styles.rail} ${reduced ? '' : styles.live}`} aria-hidden="true">
      <div className={styles.track}>
        {markets.map((m) => {
          const pct = currentPct(m, progress)
          const dir = pct === null ? 'flat' : pct >= 0 ? 'up' : 'down'
          return (
            <span key={m.ticker} className={styles.chip}>
              <span className={styles.sym}>{m.ticker}</span>
              <span className={`${styles.val} ${styles[dir]}`}>{formatPct(pct)}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
