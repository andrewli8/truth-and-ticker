import { peakToTroughPct, maxRunupPct, seriesByTicker } from '../lib/stats'
import { formatPct } from '../lib/format'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useInView } from '../lib/useInView'
import { useCountUp } from '../lib/useCountUp'
import type { Series } from '../lib/types'
import styles from './StatBand.module.css'

interface Stat {
  value: number | null
  label: string
  sub: string
}

interface Props {
  markets: Series[]
}

function buildStats(markets: Series[]): Stat[] {
  const cl = seriesByTicker(markets, 'CL')
  const lmt = seriesByTicker(markets, 'LMT')
  const vix = seriesByTicker(markets, 'VIX')
  return [
    { value: cl ? peakToTroughPct(cl) : null, label: 'WTI crude', sub: 'war premium, peak to trough' },
    { value: lmt ? maxRunupPct(lmt) : null, label: 'Lockheed Martin', sub: 'defense pop on the strikes' },
    { value: vix ? maxRunupPct(vix) : null, label: 'VIX fear gauge', sub: 'volatility spike at the peak' },
  ]
}

function StatCell({ stat, reduced, start }: { stat: Stat; reduced: boolean; start: boolean }) {
  const v = useCountUp(stat.value, reduced, start)
  const dir = stat.value === null ? 'flat' : stat.value >= 0 ? 'up' : 'down'
  return (
    <div className={styles.cell}>
      <div className={`${styles.value} ${styles[dir]}`}>{formatPct(stat.value === null ? null : v)}</div>
      <div className={styles.label}>{stat.label}</div>
      <div className={styles.sub}>{stat.sub}</div>
    </div>
  )
}

export function StatBand({ markets }: Props) {
  const reduced = useReducedMotion()
  const { ref, inView } = useInView<HTMLElement>()
  const stats = buildStats(markets)
  return (
    <section
      ref={ref}
      className={styles.band}
      aria-label="Key market swings during the 12-day war"
    >
      <p className={styles.intro}>Twelve days. A handful of posts. This is what moved.</p>
      <div className={styles.grid}>
        {stats.map((s) => (
          <StatCell key={s.label} stat={s} reduced={reduced} start={inView} />
        ))}
      </div>
    </section>
  )
}
