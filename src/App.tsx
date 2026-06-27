import { useMemo } from 'react'
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
import { spotlightTicker, seriesByTicker } from './lib/stats'
import { announcements, markets } from './data'
import type { AnnType } from './lib/types'
import './styles/app.css'

const PRIMARY = 'SPX'
const WINDOW_MINS = 120

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

  return (
    <main className="app">
      <div className="grain" aria-hidden="true" />
      <ThemeToggle />
      <Hero />
      <StatBand markets={markets} />
      <MasterTimeline series={fallbackSeries} announcements={announcements} accentFor={(t) => ACCENT[t]} />

      <ScrollStage steps={featured.length} markers={featured.map((e) => e.announcement.summary)}>
        {(progress, step) => {
          const event = featured[step]
          const accent = ACCENT[event.announcement.type]
          const spotlight = spotlightTicker(event.announcement.type)
          const series = seriesByTicker(markets, spotlight) ?? fallbackSeries
          return (
            <div className="stage">
              <div className="stageChart">
                <MarketChart
                  series={series}
                  progress={progress}
                  accent={accent}
                  momentLabel={formatDay(event.announcement.datetime)}
                />
                <TickerRail markets={markets} progress={progress} />
              </div>
              <div className="stageCard">
                <div className="stageStep">
                  {String(step + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}
                </div>
                <AnnouncementCard event={event} primaryTicker={spotlight} />
              </div>
            </div>
          )
        }}
      </ScrollStage>

      <Outro events={events} primaryTicker={PRIMARY} />
    </main>
  )
}
