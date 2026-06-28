import { useEffect, useRef } from 'react'
import { CategoryBand } from '../components/CategoryBand'
import { ReactionSpread } from '../components/ReactionSpread'
import { Outro } from '../components/Outro'
import type { CorrelatedEvent, Series } from '../lib/types'
import styles from './HubApp.module.css'

export type BreakdownView = 'category' | 'spread' | 'ledger'

const TITLES: Record<BreakdownView, string> = {
  category: 'Which posts moved the market?',
  spread: 'How hard did each post hit?',
  ledger: 'Every moment, in the ledger',
}

interface Props {
  view: BreakdownView
  events: CorrelatedEvent[]
  ticker: string
  instrumentName: string
  series: Series
  onPickEvent: (id: string) => void
  onClose: () => void
}

/**
 * A zoom layer for the data "breakdowns" — reuses the existing CategoryBand /
 * ReactionSpread / ledger (Outro) views inside the hub's modal chrome. Escape and the
 * backdrop close it; the ledger's row links open that event's detail.
 */
export function BreakdownZoom({ view, events, ticker, instrumentName, series, onPickEvent, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

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
      aria-label={TITLES[view]}
      onClick={onClose}
    >
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} type="button" className={styles.zoomClose} onClick={onClose}>
          Close ✕
        </button>
        <div className={styles.panelBody}>
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
