import { useMemo, useRef, useState, type PointerEvent, type KeyboardEvent } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
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
import { drawOnVars } from '../lib/motion'
import { formatPct, formatDay, direction } from '../lib/format'
import { typeLabel } from '../lib/labels'
import { useReducedMotion } from '../lib/useReducedMotion'
import { useCountUp } from '../lib/useCountUp'

const W = 1440
const H = 900

/**
 * One-screen interactive concept: scrub the S&P 500 across the second term and watch the
 * market react, post by post. Reuses the project's real data + pure chart helpers, with a
 * GSAP entrance (line draw-on, masked kinetic title, staggered markers), a count-up readout,
 * and a lerp-follow cursor. Reduced-motion safe.
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

  // Posts in chronological order, for keyboard stepping.
  const ordered = useMemo(() => [...posts].sort((a, b) => a.ms - b.ms), [posts])

  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
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

  // Index of the active post within the chronological order (for the slider value).
  const activeIndex = useMemo(
    () => ordered.findIndex((p) => p.a.id === active.a.id),
    [ordered, active],
  )

  // Count the latest reaction up on load (stable target → animates once); show the live value
  // instantly while scrubbing for responsiveness.
  const latest = useMemo(
    () => reactionFor(posts[posts.length - 1].a, spx, REACTION_WINDOW_MINS).deltaPct,
    [posts, spx],
  )
  const counted = useCountUp(latest, reduced, true)
  const display = hoverMs == null ? counted : reaction

  // Entrance orchestration: draw the line on, unmask the title lines, fade the chrome,
  // pop the markers in. Reduced motion shows everything in place.
  useGSAP(
    () => {
      if (reduced) return
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
          { strokeDashoffset: draw.to, duration: 1.5, ease: 'power2.out' },
          0,
        )
      }
      tl.from('.poc-line-in', { yPercent: 118, duration: 0.95, ease: 'power4.out', stagger: 0.1 }, 0.25)
        .from('[data-poc-fade]', { y: 18, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 }, 0.5)
        .from('.poc-area', { opacity: 0, duration: 1.2, ease: 'power2.out' }, 0.4)
        .from('.poc-dot', { scale: 0, opacity: 0, transformOrigin: 'center', duration: 0.5, ease: 'back.out(2)', stagger: 0.012 }, 0.9)
    },
    { dependencies: [reduced], scope: rootRef },
  )

  // Lerp-follow cursor glow (desktop pointers only).
  useGSAP(
    () => {
      const dot = cursorRef.current
      if (reduced || !dot || !window.matchMedia('(pointer: fine)').matches) return
      const p = { x: window.innerWidth / 2, y: window.innerHeight / 2, cx: 0, cy: 0 }
      const onMove = (e: globalThis.PointerEvent) => {
        p.x = e.clientX
        p.y = e.clientY
      }
      const tick = () => {
        p.cx += (p.x - p.cx) * 0.2
        p.cy += (p.y - p.cy) * 0.2
        gsap.set(dot, { x: p.cx, y: p.cy })
      }
      window.addEventListener('pointermove', onMove)
      gsap.ticker.add(tick)
      gsap.to(dot, { opacity: 1, duration: 0.6, delay: 0.6 })
      return () => {
        window.removeEventListener('pointermove', onMove)
        gsap.ticker.remove(tick)
      }
    },
    { dependencies: [reduced], scope: rootRef },
  )

  function scrub(e: PointerEvent<SVGSVGElement>) {
    const r = svgRef.current?.getBoundingClientRect()
    if (!r || !r.width) return
    const vbX = ((e.clientX - r.left) / r.width) * W
    setHoverMs(msAtX(vbX, W, domain))
  }

  // Keyboard scrubbing: step post-by-post (the chart is a slider over the announcements).
  function stepTo(index: number) {
    const i = Math.max(0, Math.min(ordered.length - 1, index))
    setHoverMs(ordered[i].ms)
  }
  function onKeyDown(e: KeyboardEvent<SVGSVGElement>) {
    const here = activeIndex < 0 ? ordered.length - 1 : activeIndex
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault()
        stepTo(here + 1)
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault()
        stepTo(here - 1)
        break
      case 'Home':
        e.preventDefault()
        stepTo(0)
        break
      case 'End':
        e.preventDefault()
        stepTo(ordered.length - 1)
        break
    }
  }

  return (
    <main className="poc" data-dir={dir} ref={rootRef}>
      <div className="poc-grain" aria-hidden="true" />
      <div className="poc-cursor" ref={cursorRef} aria-hidden="true" />

      <header className="poc-head">
        <p className="poc-kicker" data-poc-fade>Jan&ndash;Jun 2025 &middot; S&amp;P 500 &middot; second term</p>
        <h1 className="poc-title">
          <span className="poc-line-mask"><span className="poc-line-in">When he posts,</span></span>
          <span className="poc-line-mask"><span className="poc-line-in">the market <em>moves</em>.</span></span>
        </h1>
      </header>

      <div className="poc-readout" data-poc-fade>
        <span className="poc-pct">{formatPct(display === null ? null : display)}</span>
        <span className="poc-meta">
          {typeLabel(active.a.type)} &middot; {formatDay(active.a.datetime)}
        </span>
      </div>

      <blockquote className="poc-quote" data-poc-fade>
        <span className="poc-quote-mark" aria-hidden="true">&ldquo;</span>
        {active.a.quote || active.a.summary}
      </blockquote>

      <svg
        ref={svgRef}
        className="poc-chart"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        role="slider"
        tabIndex={0}
        aria-label="S&P 500 across Trump's second term; drag or use arrow keys to scrub through the announcements."
        aria-valuemin={0}
        aria-valuemax={ordered.length - 1}
        aria-valuenow={activeIndex < 0 ? ordered.length - 1 : activeIndex}
        aria-valuetext={`${typeLabel(active.a.type)}, ${formatDay(active.a.datetime)}, reaction ${formatPct(reaction)}`}
        onPointerMove={scrub}
        onPointerDown={scrub}
        onPointerLeave={() => setHoverMs(null)}
        onKeyDown={onKeyDown}
      >
        <defs>
          <linearGradient id="pocFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} className="poc-area" fill="url(#pocFill)" />
        <path ref={lineRef} d={linePath} className="poc-line" fill="none" />

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

      <a className="poc-back" href="/" data-poc-fade>&larr; The full story</a>
      <p className="poc-hint" data-poc-fade>Drag or use arrow keys to scrub the timeline</p>
    </main>
  )
}
