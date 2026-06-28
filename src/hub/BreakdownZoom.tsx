import { useEffect, useMemo, useRef, useState } from 'react'
import { CategoryBand } from '../components/CategoryBand'
import { ReactionSpread } from '../components/ReactionSpread'
import { Outro } from '../components/Outro'
import { seriesByTicker } from '../lib/stats'
import { INSTRUMENTS } from '../lib/instruments'
import { markets } from '../data'
import type { CorrelatedEvent } from '../lib/types'
import styles from './HubApp.module.css'

export type BreakdownView = 'category' | 'spread' | 'ledger'

const TABS: { view: BreakdownView; label: string }[] = [
  { view: 'category', label: 'By category' },
  { view: 'spread', label: 'Distribution' },
  { view: 'ledger', label: 'Ledger' },
]

interface Props {
  initialView: BreakdownView
  initialTicker: string
  events: CorrelatedEvent[]
  onPickEvent: (id: string) => void
  onClose: () => void
}

/**
 * One interactive modal for all the data breakdowns. A header offers view tabs
 * (By category / Distribution / Ledger) and a live instrument switcher; the body reuses
 * the existing CategoryBand / ReactionSpread / Outro views, which re-derive as you switch
 * instrument or view — no reopening. Escape / backdrop close; the ledger's rows open an
 * event's detail.
 */
export function BreakdownZoom({ initialView, initialTicker, events, onPickEvent, onClose }: Props) {
  const [view, setView] = useState<BreakdownView>(initialView)
  const [ticker, setTicker] = useState(initialTicker)
  const closeRef = useRef<HTMLButtonElement>(null)

  const instrumentName = useMemo(
    () => INSTRUMENTS.find((i) => i.ticker === ticker)?.name ?? ticker,
    [ticker],
  )
  const series = useMemo(() => seriesByTicker(markets, ticker) ?? markets[0], [ticker])
  const viewLabel = TABS.find((t) => t.view === view)?.label ?? 'Breakdown'

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className={styles.zoomBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`${viewLabel} breakdown`}
      onClick={onClose}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.panelHead}>
          <div className={styles.tabs} role="tablist" aria-label="Breakdown view">
            {TABS.map((t) => (
              <button
                key={t.view}
                type="button"
                role="tab"
                aria-selected={view === t.view}
                className={`${styles.tab} ${view === t.view ? styles.tabOn : ''}`}
                onClick={() => setView(t.view)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.panelSwitch} role="group" aria-label="Choose the instrument">
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

          <button ref={closeRef} type="button" className={styles.zoomClose} onClick={onClose}>
            Close ✕
          </button>
        </div>

        <div className={styles.panelBody} role="tabpanel" aria-label={viewLabel}>
          {view === 'category' && (
            <CategoryBand events={events} ticker={ticker} tickerLabel={instrumentName} />
          )}
          {view === 'spread' && (
            <ReactionSpread events={events} ticker={ticker} tickerLabel={instrumentName} />
          )}
          {view === 'ledger' && (
            <Outro events={events} primaryTicker={ticker} series={series} onPickEvent={onPickEvent} />
          )}
        </div>
      </div>
    </div>
  )
}
