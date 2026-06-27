import { useMemo, type CSSProperties } from 'react'
import { buildAreaPath, buildLinePath, domainFor, pointPositions } from '../lib/scales'
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
  /** Short label for the active announcement's date, shown in the header. */
  momentLabel?: string
}

/** Pure SVG line chart. All animation comes from the `progress` prop — no internal state. */
export function MarketChart({ series, progress, accent, momentLabel }: Props) {
  const clamped = Math.max(0, Math.min(1, progress))

  const fullPath = useMemo(() => buildLinePath(series.points, W, H, 1), [series.points])
  const revealedPath = useMemo(
    () => buildLinePath(series.points, W, H, clamped),
    [series.points, clamped],
  )
  const areaPath = useMemo(
    () => buildAreaPath(series.points, W, H, clamped),
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

  // Expose the accent as a custom property so nested var() (e.g. var(--risk))
  // resolves and recolors with the theme.
  const accentStyle = { '--chart-accent': accent, color: accent } as CSSProperties

  return (
    <figure className={styles.wrap} style={accentStyle}>
      <figcaption className={styles.head}>
        <span className={styles.ticker}>{series.ticker}</span>
        <span className={styles.name}>{series.name}</span>
        {momentLabel && <span className={styles.moment}>{momentLabel}</span>}
      </figcaption>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${series.name} price line`}
      >
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.32" />
            <stop offset="55%" stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridY.map((g, i) => (
          <g key={i}>
            <line x1={PAD} x2={W - PAD} y1={g.y} y2={g.y} className={styles.grid} />
            <text x={PAD} y={g.y - 6} className={styles.gridLabel}>
              {formatPrice(g.value)}
            </text>
          </g>
        ))}

        {/* Gradient fill under the revealed line — gives the move visual weight */}
        <path data-testid="area" d={areaPath} className={styles.area} fill="url(#chartFill)" />
        {/* Full trajectory, dimmed — context for the whole window */}
        <path d={fullPath} fill="none" className={styles.ghost} />
        {/* Revealed portion, bright */}
        <path data-testid="line" d={revealedPath} fill="none" className={styles.line} />

        {head && (
          <>
            <line x1={head.x} x2={head.x} y1={PAD} y2={H - PAD} className={styles.playhead} />
            <circle cx={head.x} cy={head.y} r={6} className={styles.dot} />
          </>
        )}

        {current && (
          <text x={W - PAD} y={PAD + 18} className={styles.current} textAnchor="end">
            {formatPrice(current.price)}
          </text>
        )}
      </svg>
    </figure>
  )
}
