import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import {
  timeLinePath,
  timeAreaPath,
  timeX,
  priceY,
  valueAt,
  msAtX,
  dateDomainOf,
  domainFor,
} from '../lib/scales'
import { formatTime, formatDay, formatPrice } from '../lib/format'
import type { Series, Announcement, AnnType } from '../lib/types'
import styles from './MasterTimeline.module.css'

const W = 1000
const H = 420
const PAD = 24

interface Props {
  series: Series
  announcements: Announcement[]
  accentFor: (t: AnnType) => string
}

interface Tick {
  ms: number
  label: string
}

function monthTicks([minMs, maxMs]: [number, number]): Tick[] {
  if (maxMs <= minMs) return []
  const start = new Date(minMs)
  let cur = new Date(start.getFullYear(), start.getMonth(), 1)
  const out: Tick[] = []
  while (cur.getTime() <= maxMs) {
    if (cur.getTime() >= minMs) {
      out.push({ ms: cur.getTime(), label: cur.toLocaleString('en-US', { month: 'short' }) })
    }
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
  }
  return out
}

/** Full-period overview: the index line with every announcement plotted as a marker. */
export function MasterTimeline({ series, announcements, accentFor }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    () => announcements[announcements.length - 1]?.id ?? null,
  )
  // Free hover-scrub: epoch ms under the cursor, or null when not scrubbing.
  const [hoverMs, setHoverMs] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const domain = useMemo(() => dateDomainOf(series.points), [series.points])
  const vdom = useMemo(() => domainFor(series.points), [series.points])
  const linePath = useMemo(() => timeLinePath(series.points, W, H), [series.points])
  const areaPath = useMemo(() => timeAreaPath(series.points, W, H), [series.points])
  const ticks = useMemo(() => monthTicks(domain), [domain])

  const markers = useMemo(
    () =>
      announcements.map((a) => {
        const ms = Date.parse(a.datetime)
        const price = valueAt(series.points, ms) ?? series.points[0]?.price ?? 0
        return { a, x: timeX(ms, W, domain), y: priceY(price, H, vdom) }
      }),
    [announcements, series.points, domain, vdom],
  )

  const selected = announcements.find((a) => a.id === selectedId) ?? null

  // Resolve the cursor into the chart's live readout (date + index price).
  const hover = useMemo(() => {
    if (hoverMs === null || !Number.isFinite(hoverMs)) return null
    const price = valueAt(series.points, hoverMs) ?? series.points[0]?.price ?? null
    if (price === null) return null
    return {
      x: timeX(hoverMs, W, domain),
      y: priceY(price, H, vdom),
      price,
      label: formatDay(new Date(hoverMs).toISOString()),
    }
  }, [hoverMs, series.points, domain, vdom])

  function scrub(e: PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || !Number.isFinite(e.clientX)) return
    const vbX = ((e.clientX - rect.left) / rect.width) * W
    setHoverMs(msAtX(vbX, W, domain))
  }

  return (
    <section className={styles.section} aria-label="Trump's second term, market timeline">
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>The whole presidency, on one line.</h2>
          <p className={styles.sub}>
            {series.name} · every market-moving moment, {announcements.length} of them
          </p>
        </div>
        <div className={styles.legend}>
          <span><i style={{ background: 'var(--risk)' }} />risk-off</span>
          <span><i style={{ background: 'var(--warn)' }} />pressure</span>
          <span><i style={{ background: 'var(--relief)' }} />relief</span>
        </div>
      </header>

      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${series.name} over the term`}
        onPointerMove={scrub}
        onPointerDown={scrub}
        onPointerLeave={() => setHoverMs(null)}
      >
        <defs>
          <linearGradient id="masterFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--text)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--text)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => {
          const x = timeX(t.ms, W, domain)
          return (
            <g key={t.ms}>
              <line x1={x} x2={x} y1={PAD} y2={H - PAD} className={styles.grid} />
              <text x={x + 4} y={H - 8} className={styles.tickLabel}>{t.label}</text>
            </g>
          )
        })}

        <path d={areaPath} fill="url(#masterFill)" className={styles.area} />
        <path d={linePath} fill="none" className={styles.line} />

        {markers.map(({ a, x, y }) => {
          const isSel = a.id === selectedId
          return (
            <g key={a.id} style={{ color: accentFor(a.type) }}>
              {isSel && <line x1={x} x2={x} y1={PAD} y2={H - PAD} className={styles.markerLine} />}
              <circle
                data-testid="marker"
                cx={x}
                cy={y}
                r={isSel ? 8 : 5}
                className={`${styles.marker} ${isSel ? styles.markerSel : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`${formatTime(a.datetime)}: ${a.summary}`}
                aria-pressed={isSel}
                onClick={() => setSelectedId(a.id)}
                onMouseEnter={() => setSelectedId(a.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedId(a.id)
                  }
                }}
              />
            </g>
          )
        })}

        {hover && (
          <g className={styles.scrub} pointerEvents="none" data-testid="scrub">
            <line x1={hover.x} x2={hover.x} y1={PAD} y2={H - PAD} className={styles.scrubLine} />
            <circle cx={hover.x} cy={hover.y} r={5} className={styles.scrubDot} />
            <g transform={`translate(${hover.x < W / 2 ? hover.x + 10 : hover.x - 10}, ${PAD + 6})`}>
              <text
                className={styles.scrubLabel}
                textAnchor={hover.x < W / 2 ? 'start' : 'end'}
              >
                {hover.label} · {formatPrice(hover.price)}
              </text>
            </g>
          </g>
        )}
      </svg>

      {selected && (
        <article className={styles.detail} style={{ '--sel': accentFor(selected.type) } as CSSProperties}>
          <div className={styles.detailMeta}>
            <span className={styles.detailTag}>{selected.type.replace('-', ' ')}</span>
            <time>{formatTime(selected.datetime)}</time>
          </div>
          {selected.quote ? (
            <blockquote className={styles.detailQuote}>“{selected.quote}”</blockquote>
          ) : (
            <p className={styles.detailQuote}>{selected.summary}</p>
          )}
          <div className={styles.detailFoot}>
            <span>{selected.source}</span>
            <a href={selected.citationUrl} target="_blank" rel="noreferrer">{selected.citationLabel} ↗</a>
          </div>
        </article>
      )}
    </section>
  )
}
