import { useMemo } from 'react'
import { Hero } from './components/Hero'
import { Outro } from './components/Outro'
import { ScrollStage } from './components/ScrollStage'
import { MarketChart } from './components/MarketChart'
import { AnnouncementCard } from './components/AnnouncementCard'
import { TickerRail } from './components/TickerRail'
import { StatBand } from './components/StatBand'
import { ThemeToggle } from './components/ThemeToggle'
import { correlateAll } from './lib/correlate'
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
}

export default function App() {
  const events = useMemo(() => correlateAll(announcements, markets, WINDOW_MINS), [])
  const primarySeries = useMemo(
    () => markets.find((m) => m.ticker === PRIMARY) ?? markets[0],
    [],
  )

  return (
    <main className="app">
      <div className="grain" aria-hidden="true" />
      <ThemeToggle />
      <Hero />
      <StatBand markets={markets} />

      <ScrollStage steps={events.length}>
        {(progress, step) => {
          const event = events[step]
          const accent = ACCENT[event.announcement.type]
          return (
            <div className="stage">
              <div className="stageChart">
                <MarketChart
                  series={primarySeries}
                  progress={progress}
                  accent={accent}
                  activeAnnId={event.announcement.id}
                />
                <TickerRail markets={markets} progress={progress} />
              </div>
              <div className="stageCard">
                <div className="stageStep">
                  {String(step + 1).padStart(2, '0')} / {String(events.length).padStart(2, '0')}
                </div>
                <AnnouncementCard event={event} primaryTicker={PRIMARY} />
              </div>
            </div>
          )
        }}
      </ScrollStage>

      <Outro events={events} primaryTicker={PRIMARY} />
    </main>
  )
}
