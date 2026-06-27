import { useMemo } from 'react'
import { buildLinePath, domainFor, pointPositions } from '../lib/scales'
import { formatPrice } from '../lib/format'
import type { Series } from '../lib/types'
import styles from './MarketChart.module.css'

const W = 1000
const H = 460
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
  const clamped = Math.max(0, Math.min(1, progress))

  const fullPath = useMemo(() => buildLinePath(series.points, W, H, 1), [series.points])
  const revealedPath = useMemo(
    () => buildLinePath(series.points, W, H, clamped),
    [series.points, clamped],
  )
  const positions = useMemo(() => pointPositions(series.points, W, H), [series.points])
  const { min, max } = useMemo(() => domainFor(series.points), [series.points])

  const n = series.points.length
  const idx = Math.min(n - 1, Math.max(0, Math.ceil(clamped * n) - 1))
  const current = series.points[idx]
  const head = positions[idx]

  const gridY = Array.from({ length: GRID_LINES + 1 }, (_, i) => {
    const t = i / GRID_LINES
    return { y: PAD + t * (H - 2 * PAD), value: max - t * (max - min) }
  })

  return (
    <figure className={styles.wrap}>
      <figcaption className={styles.head}>
        <span className={styles.ticker} style={{ color: accent }}>{series.ticker}</span>
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
            <text x={PAD} y={g.y - 6} className={styles.gridLabel}>
              {formatPrice(g.value)}
            </text>
          </g>
        ))}

        {/* Full trajectory, dimmed — context for the whole window */}
        <path d={fullPath} fill="none" stroke={accent} className={styles.ghost} />
        {/* Revealed portion, bright */}
        <path data-testid="line" d={revealedPath} fill="none" stroke={accent} className={styles.line} />

        {head && (
          <>
            <line x1={head.x} x2={head.x} y1={PAD} y2={H - PAD} stroke={accent} className={styles.playhead} />
            <circle cx={head.x} cy={head.y} r={6} fill={accent} className={styles.dot} />
          </>
        )}

        {current && (
          <text x={W - PAD} y={PAD + 18} className={styles.current} fill={accent} textAnchor="end">
            {formatPrice(current.price)}
          </text>
        )}
      </svg>
    </figure>
  )
}
