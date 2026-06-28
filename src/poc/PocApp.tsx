import { useMemo, useRef, useState, type PointerEvent } from 'react'
import { announcements, markets } from '../data'
import { seriesByTicker } from '../lib/stats'
import { reactionFor, REACTION_WINDOW_MINS } from '../lib/correlate'
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
import { formatPct, formatDay, direction } from '../lib/format'
import { typeLabel } from '../lib/labels'

const W = 1440
const H = 900

/**
 * One-screen interactive concept: scrub the S&P 500 across the second term and watch the
 * market react, post by post. Reuses the project's real data + pure chart helpers.
 */
export function PocApp() {
  const spx = useMemo(() => seriesByTicker(markets, 'SPX') ?? markets[0], [])
  const domain = useMemo(() => dateDomainOf(spx.points), [spx])
  const vdom = useMemo(() => domainFor(spx.points), [spx])
  const linePath = useMemo(() => timeLinePath(spx.points, W, H), [spx])
  const areaPath = useMemo(() => timeAreaPath(spx.points, W, H), [spx])

  const posts = useMemo(
    () =>
      announcements.map((a) => {
        const ms = Date.parse(a.datetime)
        const price = valueAt(spx.points, ms) ?? spx.points[0].price
        return { a, ms, x: timeX(ms, W, domain), y: priceY(price, H, vdom) }
      }),
    [domain, vdom, spx],
  )

  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverMs, setHoverMs] = useState<number | null>(null)

  // The post nearest the playhead (defaults to the latest).
  const active = useMemo(() => {
    if (hoverMs == null) return posts[posts.length - 1]
    let best = posts[0]
    let bd = Infinity
    for (const p of posts) {
      const d = Math.abs(p.ms - hoverMs)
      if (d < bd) {
        bd = d
        best = p
      }
    }
    return best
  }, [hoverMs, posts])

  const reaction = useMemo(
    () => reactionFor(active.a, spx, REACTION_WINDOW_MINS).deltaPct,
    [active, spx],
  )
  const dir = direction(reaction)

  function scrub(e: PointerEvent<SVGSVGElement>) {
    const r = svgRef.current?.getBoundingClientRect()
    if (!r || !r.width) return
    const vbX = ((e.clientX - r.left) / r.width) * W
    setHoverMs(msAtX(vbX, W, domain))
  }

  return (
    <main className="poc" data-dir={dir}>
      <div className="poc-grain" aria-hidden="true" />

      <header className="poc-head">
        <p className="poc-kicker">Jan&ndash;Jun 2025 &middot; S&amp;P 500 &middot; second term</p>
        <h1 className="poc-title">
          When he posts,<br />
          the market <em>moves</em>.
        </h1>
      </header>

      <div className="poc-readout">
        <span className="poc-pct">{formatPct(reaction)}</span>
        <span className="poc-meta">
          {typeLabel(active.a.type)} &middot; {formatDay(active.a.datetime)}
        </span>
      </div>

      <blockquote className="poc-quote">
        <span className="poc-quote-mark" aria-hidden="true">&ldquo;</span>
        {active.a.quote || active.a.summary}
      </blockquote>

      <svg
        ref={svgRef}
        className="poc-chart"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        role="img"
        aria-label="S&P 500 across Trump's second term; move the pointer to scrub through the announcements."
        onPointerMove={scrub}
        onPointerDown={scrub}
        onPointerLeave={() => setHoverMs(null)}
      >
        <defs>
          <linearGradient id="pocFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} className="poc-area" fill="url(#pocFill)" />
        <path d={linePath} className="poc-line" fill="none" />

        {posts.map((p) => (
          <circle
            key={p.a.id}
            cx={p.x}
            cy={p.y}
            r={p.a.id === active.a.id ? 9 : 3.5}
            className={`poc-dot ${p.a.id === active.a.id ? 'poc-dot-on' : ''}`}
          />
        ))}

        <line x1={active.x} x2={active.x} y1={0} y2={H} className="poc-playhead" />
      </svg>

      <p className="poc-hint" aria-hidden="true">Drag across to scrub the timeline</p>
    </main>
  )
}
