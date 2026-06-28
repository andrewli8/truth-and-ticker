import { useMemo, useState } from 'react'
import { ThemeToggle } from '../components/ThemeToggle'
import { Filmstrip, type FilmItem } from './Filmstrip'
import { EventZoom } from './EventZoom'
import { BreakdownZoom, type BreakdownView } from './BreakdownZoom'
import { correlateAll, REACTION_WINDOW_MINS } from '../lib/correlate'
import { seriesByTicker, eventMoves } from '../lib/stats'
import { windowAround } from '../lib/scales'
import { formatPct, direction } from '../lib/format'
import { INSTRUMENTS } from '../lib/instruments'
import { announcements, markets } from '../data'
import type { CorrelatedEvent } from '../lib/types'
import styles from './HubApp.module.css'

const WINDOW_DAYS = 21

const reactionOf = (e: CorrelatedEvent, ticker: string): number | null =>
  e.reactions.find((r) => r.ticker === ticker)?.deltaPct ?? null

const accentFor = (pct: number | null): string => {
  const d = direction(pct)
  return d === 'up' ? 'var(--relief)' : d === 'down' ? 'var(--risk)' : 'var(--muted)'
}

/**
 * The one-screen hub: the whole second term on a single viewport. A horizontal
 * filmstrip of every announcement (scroll/drag L–R) sits at the centre; the summary
 * chips frame it; clicking a moment zooms it into a focused detail layer. Everything
 * recolours to the chosen instrument's gain/loss. Themeable + reduced-motion safe.
 */
export function HubApp() {
  const events = useMemo(() => correlateAll(announcements, markets, REACTION_WINDOW_MINS), [])
  const ordered = useMemo(
    () => [...events].sort((a, b) => Date.parse(a.announcement.datetime) - Date.parse(b.announcement.datetime)),
    [events],
  )

  const [ticker, setTicker] = useState('SPX')
  const instrumentName = useMemo(
    () => INSTRUMENTS.find((i) => i.ticker === ticker)?.name ?? ticker,
    [ticker],
  )
  const series = useMemo(() => seriesByTicker(markets, ticker) ?? markets[0], [ticker])

  const items: FilmItem[] = useMemo(
    () => ordered.map((event) => ({ event, reactionPct: reactionOf(event, ticker) })),
    [ordered, ticker],
  )

  // Open on the most dramatic moment for the current instrument.
  const biggestIdx = useMemo(() => {
    let idx = 0
    let best = -1
    items.forEach((it, i) => {
      const v = it.reactionPct === null ? -1 : Math.abs(it.reactionPct)
      if (v > best) {
        best = v
        idx = i
      }
    })
    return idx
  }, [items])

  const [activeIndex, setActiveIndex] = useState(biggestIdx)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [breakdown, setBreakdown] = useState<BreakdownView | null>(null)

  // The ledger's row links open that event's detail in the hub.
  const openEventById = (id: string) => {
    const idx = ordered.findIndex((e) => e.announcement.id === id)
    if (idx >= 0) {
      setBreakdown(null)
      setOpenIndex(idx)
    }
  }

  const safeActive = Math.min(activeIndex, items.length - 1)
  const activeItem = items[safeActive]
  const activeDir = direction(activeItem?.reactionPct ?? null)

  // Summary chips: how many posts, the instrument's net term move, the biggest single swing.
  const summary = useMemo(() => {
    const pts = series.points
    const net = pts.length >= 2 ? ((pts[pts.length - 1].price - pts[0].price) / pts[0].price) * 100 : null
    let big: number | null = null
    items.forEach((it) => {
      if (it.reactionPct === null) return
      if (big === null || Math.abs(it.reactionPct) > Math.abs(big)) big = it.reactionPct
    })
    return { count: items.length, net, big }
  }, [series, items])

  // The zoomed event's windowed series + cross-instrument moves.
  const zoom = useMemo(() => {
    if (openIndex === null) return null
    const event = ordered[openIndex]
    if (!event) return null
    const pct = reactionOf(event, ticker)
    const full = seriesByTicker(markets, ticker) ?? markets[0]
    const win = windowAround(full.points, event.announcement.datetime, WINDOW_DAYS)
    const windowed = win.length >= 2 ? { ...full, points: win } : full
    return { event, pct, accent: accentFor(pct), series: windowed, moves: eventMoves(event) }
  }, [openIndex, ordered, ticker])

  return (
    <main className={styles.hub} id="main-content" tabIndex={-1} data-dir={activeDir}>
      <a className="skipLink" href="#main-content">Skip to content</a>
      <div className={styles.grain} aria-hidden="true" />
      <ThemeToggle />

      <header className={styles.masthead}>
        <h1 className={styles.title}>
          Truth <span className={styles.amp}>&amp;</span> Ticker
        </h1>
        <p className={styles.thesis}>
          When he posts, the market moves. Thirty second-term moments — tariffs, threats,
          strikes, ceasefires — on one screen.
        </p>
        <a className={styles.pocLink} href="/poc.html">
          See the “When he posts” concept <span aria-hidden="true">↗</span>
        </a>
      </header>

      <div className={styles.stats} role="group" aria-label="Summary">
        <div className={styles.stat}>
          <span className={styles.statNum}>{summary.count}</span>
          <span className={styles.statLabel}>announcements</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} data-dir={direction(summary.net)}>
            {formatPct(summary.net)}
          </span>
          <span className={styles.statLabel}>{instrumentName} · Jan→Jun</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} data-dir={direction(summary.big)}>
            {formatPct(summary.big)}
          </span>
          <span className={styles.statLabel}>biggest single swing</span>
        </div>
      </div>

      <div className={styles.switch} role="group" aria-label="Choose the instrument">
        {INSTRUMENTS.map((ins) => (
          <button
            key={ins.ticker}
            type="button"
            className={styles.chip}
            aria-pressed={ticker === ins.ticker}
            onClick={() => setTicker(ins.ticker)}
          >
            {ins.name}
          </button>
        ))}
      </div>

      <div className={styles.topics} role="group" aria-label="Explore the data">
        <button type="button" className={styles.topic} onClick={() => setBreakdown('category')}>
          Which posts moved it?
        </button>
        <button type="button" className={styles.topic} onClick={() => setBreakdown('spread')}>
          Reaction spread
        </button>
        <button type="button" className={styles.topic} onClick={() => setBreakdown('ledger')}>
          Full ledger
        </button>
      </div>

      <section className={styles.stage} aria-label="Timeline of announcements">
        <Filmstrip
          items={items}
          activeIndex={safeActive}
          onActivate={setActiveIndex}
          onOpen={setOpenIndex}
        />
      </section>

      <p className={styles.hint} aria-hidden="true">
        Scroll or drag ← → to travel the timeline · click a moment to zoom in
      </p>

      {zoom && (
        <EventZoom
          event={zoom.event}
          instrumentName={instrumentName}
          reactionPct={zoom.pct}
          accent={zoom.accent}
          series={zoom.series}
          moves={zoom.moves}
          onClose={() => setOpenIndex(null)}
        />
      )}

      {breakdown && (
        <BreakdownZoom
          initialView={breakdown}
          initialTicker={ticker}
          events={events}
          onPickEvent={openEventById}
          onClose={() => setBreakdown(null)}
        />
      )}
    </main>
  )
}
