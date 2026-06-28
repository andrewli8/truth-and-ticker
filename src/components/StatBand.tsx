import { peakToTroughPct, maxRunupPct, seriesByTicker } from '../lib/stats'
import { formatPct, direction, type Direction } from '../lib/format'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useInView } from '../lib/useInView'
import { useCountUp } from '../lib/useCountUp'
import type { Series } from '../lib/types'
import styles from './StatBand.module.css'

interface Stat {
  value: number | null
  label: string
  sub: string
  /**
   * Colour override. By default colour follows the value's sign, but for VIX a positive value
   * is a fear spike, not a gain — colouring it green would read as "good", so it's neutral.
   */
  tone?: Direction
}

interface Props {
  markets: Series[]
}

function buildStats(markets: Series[]): Stat[] {
  const cl = seriesByTicker(markets, 'CL')
  const lmt = seriesByTicker(markets, 'LMT')
  const vix = seriesByTicker(markets, 'VIX')
  return [
    { value: cl ? peakToTroughPct(cl) : null, label: 'WTI crude', sub: 'peak-to-trough swing' },
    { value: lmt ? maxRunupPct(lmt) : null, label: 'Lockheed Martin', sub: 'biggest defense run-up' },
    // VIX: a spike is a fear / risk-off event, not a gain — keep it neutral, not green.
    { value: vix ? maxRunupPct(vix) : null, label: 'VIX fear gauge', sub: 'biggest volatility spike', tone: 'flat' },
  ]
}

function StatCell({ stat, reduced, start }: { stat: Stat; reduced: boolean; start: boolean }) {
  const v = useCountUp(stat.value, reduced, start)
  // An explicit tone wins (VIX), else colour follows the value's sign.
  const dir = stat.tone ?? direction(stat.value)
  return (
    <div className={styles.cell}>
      <div className={`${styles.value} ${styles[dir]}`} data-dir={dir}>{formatPct(stat.value === null ? null : v)}</div>
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
    <section ref={ref} className={styles.band} aria-label="Key market swings across Trump’s second term">
      <h2 className={styles.intro}>Six months. Thirty posts. This is what moved.</h2>
      <div className={styles.grid}>
        {stats.map((s) => (
          <StatCell key={s.label} stat={s} reduced={reduced} start={inView} />
        ))}
      </div>
    </section>
  )
}
