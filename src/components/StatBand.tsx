import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { peakToTroughPct, maxRunupPct, seriesByTicker } from '../lib/stats'
import { formatPct, direction, type Direction } from '../lib/format'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useInView } from '../lib/useInView'
import { useCountUp } from '../lib/useCountUp'
import type { Series } from '../lib/types'
import styles from './StatBand.module.css'

/** True while the page is being printed — so the count-ups snap to their real values
 *  even if the band was never scrolled into view (print doesn't fire IntersectionObserver). */
function usePrinting(): boolean {
  const [printing, setPrinting] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const on = () => {
      try {
        flushSync(() => setPrinting(true))
      } catch {
        setPrinting(true)
      }
    }
    const off = () => setPrinting(false)
    window.addEventListener('beforeprint', on)
    window.addEventListener('afterprint', off)
    return () => {
      window.removeEventListener('beforeprint', on)
      window.removeEventListener('afterprint', off)
    }
  }, [])
  return printing
}

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
  const printing = usePrinting()
  const { ref, inView } = useInView<HTMLElement>()
  const stats = buildStats(markets)
  return (
    <section ref={ref} className={styles.band} aria-label="Key market swings across Trump’s second term">
      <h2 className={styles.intro}>Six months. Thirty posts. This is what moved.</h2>
      <div className={styles.grid}>
        {stats.map((s) => (
          <StatCell key={s.label} stat={s} reduced={reduced || printing} start={inView || printing} />
        ))}
      </div>
    </section>
  )
}
