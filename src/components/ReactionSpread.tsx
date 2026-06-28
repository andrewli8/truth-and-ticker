import { useMemo, useState } from 'react'
import { reactionSpread } from '../lib/stats'
import { formatPct, formatDay, direction } from '../lib/format'
import { useInView } from '../lib/useInView'
import type { CorrelatedEvent } from '../lib/types'
import styles from './ReactionSpread.module.css'

const W = 1000
const H = 230
const PAD = 36
const BASE_Y = 96
const R = 9 // collision diameter for the beeswarm packing

interface Props {
  events: CorrelatedEvent[]
  /** Instrument whose reactions are plotted (e.g. 'SPX'). */
  ticker: string
  /** Human label for the instrument (e.g. 'S&P 500'). */
  tickerLabel: string
}

/**
 * The distribution of one instrument's close-to-close reactions: every announcement as a dot
 * placed at its exact % on a zero-centered axis. Honest (x = the real reaction); a beeswarm
 * packing fans out dots that would otherwise overlap so each event is separable and hoverable.
 */
export function ReactionSpread({ events, ticker, tickerLabel }: Props) {
  const { ref, inView } = useInView<HTMLElement>()
  const [hovered, setHovered] = useState<string | null>(null)
  const { points, min, max } = useMemo(() => reactionSpread(events, ticker), [events, ticker])
  const span = max - min

  // Beeswarm: place each dot at its true x; if it would collide with one already placed,
  // nudge it off the baseline (alternating up/down) until it's clear — so close events separate.
  const dots = useMemo(() => {
    const x = (pct: number) => (span > 0 ? PAD + ((pct - min) / span) * (W - 2 * PAD) : W / 2)
    const placed: { x: number; y: number }[] = []
    // Densest clusters read best packed from the extremes inward; sort by |pct| desc.
    return [...points]
      .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
      .map((p) => {
        const px = x(p.pct)
        let y = BASE_Y
        let k = 0
        while (placed.some((q) => Math.abs(q.x - px) < R && Math.abs(q.y - y) < R)) {
          k += 1
          y = BASE_Y + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (R * 0.92)
        }
        placed.push({ x: px, y })
        return { ...p, px, py: y }
      })
  }, [points, min, max, span])

  const zeroX = span > 0 ? PAD + ((0 - min) / span) * (W - 2 * PAD) : W / 2
  if (points.length === 0) return null
  const active = dots.find((d) => d.id === hovered)

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
        onMouseLeave={() => setHovered(null)}
      >
        <line x1={PAD} x2={W - PAD} y1={BASE_Y} y2={BASE_Y} className={styles.axis} />
        <line x1={zeroX} x2={zeroX} y1={28} y2={H - 40} className={styles.zero} />
        <text x={zeroX} y={H - 18} textAnchor="middle" className={styles.tick}>0</text>
        <text x={PAD} y={H - 18} textAnchor="start" className={styles.tick}>{formatPct(min)}</text>
        <text x={W - PAD} y={H - 18} textAnchor="end" className={styles.tick}>{formatPct(max)}</text>

        {dots.map((d) => (
          <circle
            key={d.id}
            data-testid="spread-dot"
            data-dir={direction(d.pct)}
            className={`${styles.dot} ${d.id === hovered ? styles.dotActive : ''}`}
            cx={d.px}
            cy={d.py}
            r={d.id === hovered ? 8 : 5.5}
            onMouseEnter={() => setHovered(d.id)}
          >
            <title>{`${formatDay(d.datetime)} — ${d.summary}: ${formatPct(d.pct)}`}</title>
          </circle>
        ))}

        {active && (
          <g className={styles.callout} pointerEvents="none">
            <line x1={active.px} x2={active.px} y1={active.py} y2={26} className={styles.calloutStem} />
            <text
              x={Math.max(PAD, Math.min(W - PAD, active.px))}
              y={20}
              textAnchor={active.px < W * 0.18 ? 'start' : active.px > W * 0.82 ? 'end' : 'middle'}
              data-dir={direction(active.pct)}
              className={styles.calloutText}
            >
              {formatDay(active.datetime)} · {formatPct(active.pct)}
            </text>
          </g>
        )}
      </svg>
      <p className={styles.note}>
        Each dot is one announcement’s close-to-close <span translate="no">{tickerLabel}</span> move
        — hover to read it. The cluster near 0 are the quiet days; the outliers moved markets.
      </p>
    </section>
  )
}
