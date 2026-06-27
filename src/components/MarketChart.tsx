import { useMemo } from 'react'
import { buildLinePath, domainFor } from '../lib/scales'
import { formatPrice } from '../lib/format'
import type { Series } from '../lib/types'
import styles from './MarketChart.module.css'

const W = 1000
const H = 520
const PAD = 24
const GRID_LINES = 4

interface Props {
  series: Series
  /** 0–1 reveal fraction driven by scroll. */
  progress: number
  accent: string
  activeAnnId?: string
}

/** Pure SVG line chart. All animation comes from the `progress` prop — no internal state. */
export function MarketChart({ series, progress, accent }: Props) {
  const path = useMemo(
    () => buildLinePath(series.points, W, H, progress),
    [series.points, progress],
  )
  const { min, max } = useMemo(() => domainFor(series.points), [series.points])

  const visibleCount = Math.max(1, Math.ceil(Math.max(0, Math.min(1, progress)) * series.points.length))
  const current = series.points[Math.min(visibleCount, series.points.length) - 1]

  const gridY = Array.from({ length: GRID_LINES + 1 }, (_, i) => {
    const t = i / GRID_LINES
    return { y: PAD + t * (H - 2 * PAD), value: max - t * (max - min) }
  })

  return (
    <figure className={styles.wrap}>
      <figcaption className={styles.head}>
        <span className={styles.ticker}>{series.ticker}</span>
        <span className={styles.name}>{series.name}</span>
      </figcaption>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${series.name} price line`}
      >
        {gridY.map((g, i) => (
          <g key={i}>
            <line x1={PAD} x2={W - PAD} y1={g.y} y2={g.y} className={styles.grid} />
            <text x={PAD} y={g.y - 4} className={styles.gridLabel}>
              {formatPrice(g.value)}
            </text>
          </g>
        ))}
        <path data-testid="line" d={path} fill="none" stroke={accent} className={styles.line} />
        {current && (
          <text x={W - PAD} y={PAD + 16} className={styles.current} fill={accent} textAnchor="end">
            {formatPrice(current.price)}
          </text>
        )}
      </svg>
    </figure>
  )
}
