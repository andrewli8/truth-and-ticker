import { useMemo, useRef, useCallback, useState } from 'react'
import { Hero } from './components/Hero'
import { Outro } from './components/Outro'
import { ScrollStage } from './components/ScrollStage'
import { MarketChart } from './components/MarketChart'
import { AnnouncementCard } from './components/AnnouncementCard'
import { TickerRail } from './components/TickerRail'
import { StatBand } from './components/StatBand'
import { MasterTimeline } from './components/MasterTimeline'
import { ThemeToggle } from './components/ThemeToggle'
import { correlateAll } from './lib/correlate'
import { formatDay } from './lib/format'
import { spotlightTicker, seriesByTicker, eventMoves } from './lib/stats'
import { windowAround, buildLinePath, buildAreaPath } from './lib/scales'
import { localProgress, stepScrollTarget } from './lib/scroll'
import { hashForEvent, instrumentFromQuery } from './lib/hash'
import { useReducedMotion } from './lib/useReducedMotion'
import { announcements, markets } from './data'
import type { AnnType } from './lib/types'
import './styles/app.css'

const PRIMARY = 'SPX'
const WINDOW_MINS = 120
// Trading days of context shown on either side of an event in the deep-dive.
const WINDOW_DAYS = 21
// Curated instruments offered in the master-timeline switcher (short labels).
const TIMELINE_INSTRUMENTS: { ticker: string; name: string }[] = [
  { ticker: 'SPX', name: 'S&P 500' },
  { ticker: 'NDX', name: 'Nasdaq' },
  { ticker: 'CL', name: 'Oil' },
  { ticker: 'LMT', name: 'Defense' },
  { ticker: 'GLD', name: 'Gold' },
  { ticker: 'VIX', name: 'VIX' },
]

// Theme-aware accents: CSS variables so colors recolor in light/dark.
const ACCENT: Record<AnnType, string> = {
  strike: 'var(--risk)',
  threat: 'var(--warn)',
  'market-jawbone': 'var(--warn)',
  ceasefire: 'var(--relief)',
  tariff: 'var(--risk)',
  'trade-deal': 'var(--relief)',
  fed: 'var(--warn)',
  policy: 'var(--warn)',
}

export default function App() {
  const events = useMemo(() => correlateAll(announcements, markets, WINDOW_MINS), [])
  // The scrolly deep-dive uses featured events only (fall back to all if none flagged).
  const featured = useMemo(() => {
    const f = events.filter((e) => e.announcement.featured)
    return f.length ? f : events
  }, [events])
  const fallbackSeries = useMemo(
    () => seriesByTicker(markets, PRIMARY) ?? markets[0],
    [],
  )
  // Real S&P 500 shape for the hero backdrop (viewBox 0 0 1200 300).
  const heroLine = useMemo(() => buildLinePath(fallbackSeries.points, 1200, 300, 1), [fallbackSeries])
  const heroArea = useMemo(() => buildAreaPath(fallbackSeries.points, 1200, 300, 1), [fallbackSeries])

  const scrollyRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // Which instrument the master-timeline overview plots (user-switchable,
  // reflected in the URL as ?i= so the view is shareable/deep-linkable).
  const [timelineTicker, setTimelineTicker] = useState(
    () =>
      (typeof window !== 'undefined' &&
        instrumentFromQuery(window.location.search, TIMELINE_INSTRUMENTS.map((t) => t.ticker))) ||
      'SPX',
  )
  const timelineSeries = useMemo(
    () => seriesByTicker(markets, timelineTicker) ?? fallbackSeries,
    [timelineTicker, fallbackSeries],
  )
  const pickInstrument = useCallback((ticker: string) => {
    setTimelineTicker(ticker)
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (ticker === 'SPX') url.searchParams.delete('i')
    else url.searchParams.set('i', ticker)
    window.history.replaceState(null, '', url) // preserves the #event hash
  }, [])

  // From the closing ledger, jump up to the master timeline with the event open.
  const pickEvent = useCallback(
    (id: string) => {
      if (typeof window !== 'undefined') window.location.hash = hashForEvent(id)
      timelineRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    },
    [reduced],
  )

  // Jump from an overview marker to that event's deep-dive panel.
  const jumpToEvent = useCallback(
    (id: string) => {
      const idx = featured.findIndex((e) => e.announcement.id === id)
      const el = scrollyRef.current
      if (idx < 0 || !el) return
      const top = el.getBoundingClientRect().top + window.scrollY
      const target = stepScrollTarget(idx, featured.length, top, el.offsetHeight, window.innerHeight)
      window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' })
    },
    [featured, reduced],
  )

  return (
    <main className="app" id="main-content" tabIndex={-1}>
      <a className="skipLink" href="#main-content">Skip to content</a>
      <div className="grain" aria-hidden="true" />
      <ThemeToggle />
      <Hero linePath={heroLine} areaPath={heroArea} />
      <StatBand markets={markets} />
      <div ref={timelineRef}>
        <MasterTimeline
          series={timelineSeries}
          announcements={announcements}
          accentFor={(t) => ACCENT[t]}
          onJump={jumpToEvent}
          instruments={TIMELINE_INSTRUMENTS}
          onPickInstrument={pickInstrument}
        />
      </div>

      <div ref={scrollyRef}>
      <ScrollStage steps={featured.length} markers={featured.map((e) => e.announcement.summary)}>
        {(progress, step) => {
          const event = featured[step]
          const accent = ACCENT[event.announcement.type]
          const spotlight = spotlightTicker(event.announcement.type)
          const fullSeries = seriesByTicker(markets, spotlight) ?? fallbackSeries
          // Focus the chart on the action around this event; fall back to the full
          // series if the window is too sparse to draw a line.
          const win = windowAround(fullSeries.points, event.announcement.datetime, WINDOW_DAYS)
          const series = win.length >= 2 ? { ...fullSeries, points: win } : fullSeries
          // Reveal each event's chart over its OWN panel, not the whole scrolly.
          const local = localProgress(progress, featured.length, step)
          return (
            <div className="stage">
              <div className="stageChart">
                <MarketChart
                  key={event.announcement.id}
                  series={series}
                  progress={local}
                  accent={accent}
                  momentLabel={formatDay(event.announcement.datetime)}
                />
                <TickerRail moves={eventMoves(event)} />
              </div>
              <div className="stageCard">
                <div className="stageStep">
                  {String(step + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}
                </div>
                <AnnouncementCard key={event.announcement.id} event={event} primaryTicker={spotlight} />
              </div>
            </div>
          )
        }}
      </ScrollStage>
      </div>

      <Outro events={events} primaryTicker={PRIMARY} series={fallbackSeries} onPickEvent={pickEvent} />
    </main>
  )
}
