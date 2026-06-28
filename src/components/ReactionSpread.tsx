import { useMemo } from 'react'
import { reactionSpread } from '../lib/stats'
import { formatPct, direction } from '../lib/format'
import { useInView } from '../lib/useInView'
import type { CorrelatedEvent } from '../lib/types'
import styles from './ReactionSpread.module.css'

const W = 1000
const H = 116
const PAD = 30
const BASE_Y = 52

interface Props {
  events: CorrelatedEvent[]
  /** Instrument whose reactions are plotted (e.g. 'SPX'). */
  ticker: string
  /** Human label for the instrument (e.g. 'S&P 500'). */
  tickerLabel: string
}

/**
 * The distribution of one instrument's close-to-close reactions: every announcement as a dot
 * placed at its exact % on a zero-centered axis. Honest (x = the real reaction; density shows
 * via overlap), and it makes the thesis visible — most posts cluster near zero, a few are
 * dramatic outliers. Pure presentational.
 */
export function ReactionSpread({ events, ticker, tickerLabel }: Props) {
  const { ref, inView } = useInView<HTMLElement>()
  const { points, min, max } = useMemo(() => reactionSpread(events, ticker), [events, ticker])
  const span = max - min
  const x = (pct: number) => (span > 0 ? PAD + ((pct - min) / span) * (W - 2 * PAD) : W / 2)

  if (points.length === 0) return null

  return (
    <section
      ref={ref}
      className={`${styles.band} ${inView ? styles.in : ''}`}
      aria-label={`Distribution of ${tickerLabel} reactions`}
    >
      <h2 className={styles.intro}>Most posts nudge the market. A few move it hard.</h2>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${points.length} ${tickerLabel} close-to-close reactions, ranging from ${formatPct(
          min,
        )} to ${formatPct(max)}.`}
      >
        <line x1={PAD} x2={W - PAD} y1={BASE_Y} y2={BASE_Y} className={styles.axis} />
        <line x1={x(0)} x2={x(0)} y1={BASE_Y - 24} y2={BASE_Y + 24} className={styles.zero} />
        <text x={x(0)} y={BASE_Y + 44} textAnchor="middle" className={styles.tick}>0</text>
        <text x={PAD} y={BASE_Y + 44} textAnchor="start" className={styles.tick}>{formatPct(min)}</text>
        <text x={W - PAD} y={BASE_Y + 44} textAnchor="end" className={styles.tick}>{formatPct(max)}</text>
        {points.map((p, i) => (
          <circle
            key={p.id}
            data-testid="spread-dot"
            data-dir={direction(p.pct)}
            className={styles.dot}
            cx={x(p.pct)}
            cy={BASE_Y}
            r={6}
            style={{ transitionDelay: `${i * 0.02}s` }}
          >
            <title>{`${p.summary}: ${formatPct(p.pct)}`}</title>
          </circle>
        ))}
      </svg>
      <p className={styles.note}>
        Each dot is one announcement’s close-to-close <span translate="no">{tickerLabel}</span> move.
        The cluster near 0 are the quiet days; the outliers are the ones that moved markets.
      </p>
    </section>
  )
}
