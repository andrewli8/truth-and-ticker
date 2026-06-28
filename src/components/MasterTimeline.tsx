import { useMemo, useRef, useState, useEffect, type CSSProperties, type PointerEvent } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import {
  timeLinePath,
  timeAreaPath,
  timeX,
  priceY,
  valueAt,
  msAtX,
  decollide,
  nearestPointIndex,
  dateDomainOf,
  domainFor,
} from '../lib/scales'
import { drawOnVars, adjacentIndex } from '../lib/motion'
import { reactionFor } from '../lib/correlate'
import { typeLabel, accentGroup, type AccentGroup } from '../lib/labels'
import { timelineAriaLabel, netReturnPct, maxDrawdown } from '../lib/stats'
import { formatTime, formatDay, formatPrice, formatPct } from '../lib/format'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useInView } from '../lib/useInView'
import { useCountUp } from '../lib/useCountUp'
import { eventIdFromHash, hashForEvent, eventShareUrl } from '../lib/hash'
import type { Series, Announcement, AnnType } from '../lib/types'
import styles from './MasterTimeline.module.css'

const W = 1000
const H = 420
const PAD = 24
const WINDOW_MINS = 120
// Minimum horizontal spacing between marker dots (viewBox units).
const MARKER_GAP = 18

interface Instrument {
  ticker: string
  name: string
}

interface Props {
  series: Series
  announcements: Announcement[]
  accentFor: (t: AnnType) => string
  /** Jump to a featured event's deep-dive panel (called on marker activation). */
  onJump?: (id: string) => void
  /** Optional instrument switcher: which series the overview plots. */
  instruments?: Instrument[]
  onPickInstrument?: (ticker: string) => void
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
export function MasterTimeline({
  series,
  announcements,
  accentFor,
  onJump,
  instruments,
  onPickInstrument,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    // Deep-link: open the event named in the URL hash, else default to the latest.
    const fromHash = typeof window !== 'undefined' ? eventIdFromHash(window.location.hash) : null
    if (fromHash && announcements.some((a) => a.id === fromHash)) return fromHash
    return announcements[announcements.length - 1]?.id ?? null
  })

  // Set the selection and reflect it in the URL hash (shareable), without a
  // history entry or scroll jump. Used for explicit picks, not hover previews.
  function selectAndLink(id: string) {
    setSelectedId(id)
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState(null, '', hashForEvent(id))
    }
  }

  // Copy a shareable deep-link to the selected event.
  function copyLink(id: string) {
    if (typeof window === 'undefined') return
    const url = eventShareUrl(window.location.origin, window.location.pathname, id)
    const writer = navigator?.clipboard?.writeText
    if (!writer) return
    writer
      .call(navigator.clipboard, url)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => {})
  }

  // Re-select when the URL hash changes (back/forward, edited URL, in-app links).
  useEffect(() => {
    const onHash = () => {
      const id = eventIdFromHash(window.location.hash)
      if (id && announcements.some((a) => a.id === id)) setSelectedId(id)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [announcements])
  // Free hover-scrub: epoch ms under the cursor, or null when not scrubbing.
  const [hoverMs, setHoverMs] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  const areaRef = useRef<SVGPathElement>(null)
  const markerRefs = useRef<(SVGCircleElement | null)[]>([])

  // Legend filter: categories the reader has toggled off (all shown by default).
  const [hiddenGroups, setHiddenGroups] = useState<Set<AccentGroup>>(() => new Set())
  function toggleGroup(g: AccentGroup) {
    setHiddenGroups((prev) => {
      const next = new Set(prev)
      next.has(g) ? next.delete(g) : next.add(g)
      return next
    })
  }

  // Scroll-into-view reveal: draw the line on, then pop the markers in sequence.
  const reduced = useReducedMotion()
  const { ref: rootRef, inView } = useInView<HTMLElement>()
  const revealed = useRef(false)

  useGSAP(
    () => {
      if (reduced || !inView || revealed.current) return
      revealed.current = true

      const line = lineRef.current
      let len = 0
      if (line && typeof line.getTotalLength === 'function') {
        try {
          len = line.getTotalLength()
        } catch {
          len = 0
        }
      }
      const draw = drawOnVars(len)
      const tl = gsap.timeline()
      if (line && draw) {
        tl.fromTo(
          line,
          { strokeDasharray: draw.dasharray, strokeDashoffset: draw.from },
          { strokeDashoffset: draw.to, duration: 1.15, ease: 'power2.out' },
          0,
        )
      }
      tl.from(
        '[data-marker]',
        { opacity: 0, y: 14, duration: 0.4, ease: 'back.out(1.7)', stagger: 0.045 },
        line && draw ? 0.55 : 0,
      )
    },
    { dependencies: [reduced, inView], scope: rootRef },
  )

  const domain = useMemo(() => dateDomainOf(series.points), [series.points])
  const vdom = useMemo(() => domainFor(series.points), [series.points])
  const linePath = useMemo(() => timeLinePath(series.points, W, H), [series.points])
  const areaPath = useMemo(() => timeAreaPath(series.points, W, H), [series.points])
  const ticks = useMemo(() => monthTicks(domain), [domain])
  const net = useMemo(() => netReturnPct(series), [series])
  const drawdown = useMemo(() => maxDrawdown(series), [series])

  // Morph the line/area when the instrument changes (all series share the same
  // 111-point structure, so the `d` strings interpolate cleanly). First render
  // and reduced motion skip it; the draw-on handles entrance.
  const prevPaths = useRef({ line: linePath, area: areaPath })
  useGSAP(
    () => {
      const prev = prevPaths.current
      if (prev.line === linePath && prev.area === areaPath) return
      if (!reduced && lineRef.current && areaRef.current) {
        gsap.fromTo(lineRef.current, { attr: { d: prev.line } }, { attr: { d: linePath }, duration: 0.6, ease: 'power2.inOut' })
        gsap.fromTo(areaRef.current, { attr: { d: prev.area } }, { attr: { d: areaPath }, duration: 0.6, ease: 'power2.inOut' })
      }
      prevPaths.current = { line: linePath, area: areaPath }
    },
    { dependencies: [linePath, areaPath], scope: rootRef },
  )

  const markers = useMemo(
    () =>
      announcements.map((a) => {
        const ms = Date.parse(a.datetime)
        const price = valueAt(series.points, ms) ?? series.points[0]?.price ?? 0
        return { a, x: timeX(ms, W, domain), y: priceY(price, H, vdom) }
      }),
    [announcements, series.points, domain, vdom],
  )

  // Only the markers whose category is enabled, then fan out the dots that bunch
  // in time so they stay legible. `dx` is the display x; `x` stays the true time.
  const visible = useMemo(() => {
    const vis = markers.filter((m) => !hiddenGroups.has(accentGroup(m.a.type)))
    const dx = decollide(vis.map((m) => m.x), MARKER_GAP, PAD, W - PAD)
    return vis.map((m, i) => ({ ...m, dx: dx[i] }))
  }, [markers, hiddenGroups])

  // Select a marker; if it's a featured event, also jump to its deep-dive panel.
  function activate(a: Announcement) {
    selectAndLink(a.id)
    if (a.featured) onJump?.(a.id)
  }

  // ←/→ step through the VISIBLE markers in order, moving focus along.
  function stepSelection(currentIndex: number, dir: number) {
    const next = adjacentIndex(visible.length, currentIndex, dir)
    if (next < 0) return
    selectAndLink(visible[next].a.id)
    markerRefs.current[next]?.focus()
  }

  const selected = announcements.find((a) => a.id === selectedId) ?? null

  // The index's close-to-close reaction to the selected event, counted up on change.
  const reactionPct = useMemo(
    () => (selected ? reactionFor(selected, series, WINDOW_MINS).deltaPct : null),
    [selected, series],
  )
  const animatedPct = useCountUp(reactionPct, reduced, true)
  const reactionDir = reactionPct === null ? 'flat' : reactionPct >= 0 ? 'up' : 'down'

  // Resolve the cursor to the NEAREST real close, so the dot/readout sit exactly
  // on a plotted vertex of the line rather than floating between sparse points.
  const hover = useMemo(() => {
    if (hoverMs === null || !Number.isFinite(hoverMs)) return null
    const i = nearestPointIndex(series.points, hoverMs)
    if (i < 0) return null
    const p = series.points[i]
    return {
      x: timeX(Date.parse(p.datetime), W, domain),
      y: priceY(p.price, H, vdom),
      price: p.price,
      label: formatDay(p.datetime),
    }
  }, [hoverMs, series.points, domain, vdom])

  function scrub(e: PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || !Number.isFinite(e.clientX)) return
    const vbX = ((e.clientX - rect.left) / rect.width) * W
    setHoverMs(msAtX(vbX, W, domain))
  }

  return (
    <section ref={rootRef} className={styles.section} aria-label="Trump's second term, market timeline">
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>The whole presidency, on one line.</h2>
          <p className={styles.sub}>
            {series.name} · every market-moving moment, {announcements.length} of them
          </p>
          <p className={styles.termStat} data-testid="term-stat">
            <span className={styles.termVal} data-dir={net === null ? 'flat' : net >= 0 ? 'up' : 'down'}>
              {formatPct(net)}
            </span>{' '}
            net over the term · deepest drawdown{' '}
            <span className={styles.termVal} data-dir="down">{formatPct(drawdown?.pct ?? null)}</span>
            {drawdown && drawdown.pct < 0 ? ` (to ${formatDay(drawdown.troughISO)})` : ''}
          </p>
        </div>
        <div className={styles.legend} role="group" aria-label="Filter events by category">
          {([
            ['risk', 'risk-off', 'var(--risk)'],
            ['warn', 'pressure', 'var(--warn)'],
            ['relief', 'relief', 'var(--relief)'],
          ] as [AccentGroup, string, string][]).map(([key, label, color]) => {
            const on = !hiddenGroups.has(key)
            return (
              <button
                key={key}
                type="button"
                className={`${styles.legendItem} ${on ? '' : styles.legendOff}`}
                aria-pressed={on}
                aria-label={`${label} events${on ? ' (shown)' : ' (hidden)'}`}
                onClick={() => toggleGroup(key)}
              >
                <i style={{ background: color }} />
                {label}
              </button>
            )
          })}
        </div>
      </header>

      {instruments && instruments.length > 1 && (
        <div className={styles.instruments} role="group" aria-label="Choose the instrument">
          {instruments.map((ins) => {
            const on = ins.ticker === series.ticker
            return (
              <button
                key={ins.ticker}
                type="button"
                className={`${styles.instBtn} ${on ? styles.instOn : ''}`}
                aria-pressed={on}
                onClick={() => onPickInstrument?.(ins.ticker)}
              >
                {ins.name}
              </button>
            )
          })}
        </div>
      )}

      <svg
        ref={svgRef}
        className={styles.svg}
        viewBox={`0 0 ${W} ${H}`}
        role="group"
        aria-label={timelineAriaLabel(series)}
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

        <path ref={areaRef} d={areaPath} fill="url(#masterFill)" className={styles.area} />
        <path ref={lineRef} data-line d={linePath} fill="none" className={styles.line} />

        {visible.map(({ a, x, dx, y }, i) => {
          const isSel = a.id === selectedId
          return (
            <g key={a.id} style={{ color: accentFor(a.type) }}>
              {isSel && (
                <>
                  <line x1={dx} x2={dx} y1={PAD} y2={H - PAD} className={styles.markerLine} />
                  {/* if the dot was nudged off its true time, tie it back to the axis */}
                  {Math.abs(dx - x) > 0.5 && (
                    <line x1={x} x2={dx} y1={H - PAD} y2={y} className={styles.markerTie} />
                  )}
                </>
              )}
              <circle
                ref={(el) => (markerRefs.current[i] = el)}
                data-testid="marker"
                data-marker
                cx={dx}
                cy={y}
                r={isSel ? 8 : 5}
                className={`${styles.marker} ${isSel ? styles.markerSel : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`${formatTime(a.datetime)}: ${a.summary}${a.featured ? ' — open deep-dive' : ''}`}
                aria-pressed={isSel}
                onClick={() => activate(a)}
                onMouseEnter={() => setSelectedId(a.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    activate(a)
                  } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    e.preventDefault()
                    stepSelection(i, 1)
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    e.preventDefault()
                    stepSelection(i, -1)
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
        <article
          className={styles.detail}
          style={{ '--sel': accentFor(selected.type) } as CSSProperties}
          aria-live="polite"
          data-testid="detail"
        >
          <div className={styles.detailMeta}>
            <span className={styles.detailTag}>{typeLabel(selected.type)}</span>
            <time>{formatTime(selected.datetime)}</time>
          </div>
          {selected.quote ? (
            <blockquote className={styles.detailQuote}>
              <span className={styles.detailMark} aria-hidden="true">“</span>
              <span className={styles.detailQuoteText}>{selected.quote}</span>
            </blockquote>
          ) : (
            <p className={styles.detailQuote}>
              <span className={styles.detailQuoteText}>{selected.summary}</span>
            </p>
          )}
          <div className={styles.detailReaction} data-testid="reaction">
            <span className={styles.reactionValue} data-dir={reactionDir}>
              {formatPct(reactionPct === null ? null : animatedPct)}
            </span>
            <span className={styles.reactionLabel}>{series.ticker} · prior close → next close</span>
          </div>
          <div className={styles.detailFoot}>
            <span>{selected.source}</span>
            <span className={styles.detailActions}>
              <button type="button" className={styles.copyLink} onClick={() => copyLink(selected.id)}>
                {copied ? 'Link copied ✓' : 'Copy link'}
              </button>
              <a href={selected.citationUrl} target="_blank" rel="noreferrer">{selected.citationLabel} ↗</a>
            </span>
          </div>
        </article>
      )}
    </section>
  )
}
