import { useMemo, useState } from 'react'
import { formatPct, formatTime, formatDay, direction } from '../lib/format'
import { typeLabel } from '../lib/labels'
import { sparklinePath } from '../lib/scales'
import { topReactions } from '../lib/stats'
import { useInView } from '../lib/useInView'
import type { CorrelatedEvent, Series } from '../lib/types'
import { ShareButton } from './ShareButton'
import styles from './Outro.module.css'

const SPARK_W = 96
const SPARK_H = 26
const SPARK_DAYS = 10
const PAGE_SIZE = 12

type SortCol = 'when' | 'type' | 'reaction'
interface Sort {
  col: SortCol
  dir: 'asc' | 'desc'
}
// Sensible default direction when first clicking a column.
const DEFAULT_DIR: Record<SortCol, 'asc' | 'desc'> = { when: 'asc', type: 'asc', reaction: 'desc' }

interface Props {
  events: CorrelatedEvent[]
  primaryTicker: string
  /** Index series used for each row's mini sparkline (optional). */
  series?: Series
  /** Open an event in the master timeline (deep-link + scroll). */
  onPickEvent?: (id: string) => void
}

export function Outro({ events, primaryTicker, series, onPickEvent }: Props) {
  const { ref, inView } = useInView<HTMLElement>()
  // Most dramatic single-day moves across all instruments (VIX excluded so it reads as
  // price moves) — a lead-in to the per-event S&P ledger below.
  const highlights = useMemo(() => topReactions(events, 3, ['VIX'], true), [events])

  // Sortable + paginated ledger. Each row's primary-ticker reaction is precomputed for sorting.
  const [sort, setSort] = useState<Sort>({ col: 'when', dir: 'asc' })
  const [page, setPage] = useState(0)
  const rows = useMemo(() => {
    const withDelta = events.map((e) => ({
      e,
      delta: (e.reactions.find((x) => x.ticker === primaryTicker) ?? e.reactions[0])?.deltaPct ?? null,
    }))
    const dir = sort.dir === 'asc' ? 1 : -1
    return withDelta.sort((a, b) => {
      if (sort.col === 'type') {
        return dir * typeLabel(a.e.announcement.type).localeCompare(typeLabel(b.e.announcement.type))
      }
      if (sort.col === 'reaction') {
        const av = a.delta === null ? -Infinity : a.delta
        const bv = b.delta === null ? -Infinity : b.delta
        return dir * (av - bv)
      }
      return dir * (Date.parse(a.e.announcement.datetime) - Date.parse(b.e.announcement.datetime))
    })
  }, [events, primaryTicker, sort])

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const toggleSort = (col: SortCol) => {
    setSort((s) => (s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: DEFAULT_DIR[col] }))
    setPage(0)
  }
  const ariaSort = (col: SortCol): 'ascending' | 'descending' | 'none' =>
    sort.col === col ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
  const sortGlyph = (col: SortCol) => (sort.col === col ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : '')

  return (
    <section ref={ref} className={`${styles.outro} ${inView ? styles.revealed : ''}`}>
      <h2 className={styles.heading}>Words moved markets. Here is the ledger.</h2>
      {highlights.length > 0 && (
        <ul className={styles.highlights} aria-label="Biggest single-day market reactions">
          {highlights.map((h) => {
            const dir = direction(h.deltaPct)
            const inner = (
              <>
                <span className={`${styles.bigVal} ${styles[dir]}`}>{formatPct(h.deltaPct)}</span>
                <span className={styles.bigMeta}>
                  <span translate="no">{h.ticker}</span> · {formatDay(h.announcement.datetime)}
                </span>
                <span className={styles.bigDesc}>{h.announcement.summary}</span>
              </>
            )
            return (
              <li key={`${h.ticker}-${h.announcement.id}`} className={styles.bigCard}>
                {onPickEvent ? (
                  <button
                    type="button"
                    className={styles.bigBtn}
                    onClick={() => onPickEvent(h.announcement.id)}
                    aria-label={`${h.ticker} ${formatPct(h.deltaPct)}, ${h.announcement.summary} — view on the timeline`}
                  >
                    {inner}
                  </button>
                ) : (
                  inner
                )}
              </li>
            )
          })}
        </ul>
      )}
      <table className={styles.table}>
        <caption className="srOnly">
          Every announcement with its date, type, the {primaryTicker} price path around it,
          and the {primaryTicker} close-to-close reaction.
        </caption>
        <thead>
          <tr>
            <th scope="col" aria-sort={ariaSort('when')}>
              <button type="button" className={styles.sortBtn} onClick={() => toggleSort('when')}>
                When (ET){sortGlyph('when')}
              </button>
            </th>
            <th scope="col">Announcement</th>
            <th scope="col" aria-sort={ariaSort('type')}>
              <button type="button" className={styles.sortBtn} onClick={() => toggleSort('type')}>
                Type{sortGlyph('type')}
              </button>
            </th>
            {series && (
              <th scope="col" aria-label={`${primaryTicker} price path, ±10 days around the event`}>
                <span translate="no">{primaryTicker}</span> ±10d path
              </th>
            )}
            <th scope="col" className={styles.num} aria-sort={ariaSort('reaction')}>
              <button type="button" className={`${styles.sortBtn} ${styles.sortBtnNum}`} onClick={() => toggleSort('reaction')}>
                <span translate="no">{primaryTicker}</span> reaction{sortGlyph('reaction')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ e, delta }, i) => {
            const dir = direction(delta)
            const spark = series
              ? sparklinePath(series.points, e.announcement.datetime, SPARK_DAYS, SPARK_W, SPARK_H)
              : ''
            // Off-page rows stay in the DOM (so print shows the full ledger) but are hidden on screen.
            const onPage = i >= safePage * PAGE_SIZE && i < (safePage + 1) * PAGE_SIZE
            return (
              <tr
                key={e.announcement.id}
                data-testid="summary-row"
                className={onPage ? '' : styles.offPage}
              >
                <td className={styles.mono}>
                  <time dateTime={e.announcement.datetime}>{formatTime(e.announcement.datetime)}</time>
                </td>
                <td>
                  {onPickEvent ? (
                    <button
                      type="button"
                      className={styles.rowBtn}
                      onClick={() => onPickEvent(e.announcement.id)}
                      aria-label={`View on the timeline: ${e.announcement.summary}`}
                    >
                      {e.announcement.summary}
                    </button>
                  ) : (
                    e.announcement.summary
                  )}
                </td>
                <td className={styles.type}>{typeLabel(e.announcement.type)}</td>
                {series && (
                  <td>
                    {spark && (
                      <svg
                        className={`${styles.spark} ${styles[dir]}`}
                        viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
                        width={SPARK_W}
                        height={SPARK_H}
                        aria-hidden="true"
                      >
                        <path d={spark} fill="none" />
                      </svg>
                    )}
                  </td>
                )}
                <td className={`${styles.num} ${styles.mono} ${styles[dir]}`}>{formatPct(delta)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {pageCount > 1 && (
        <nav className={styles.pager} aria-label="Ledger pages">
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
          >
            ← Prev
          </button>
          <span className={styles.pageInfo} aria-live="polite">
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
          >
            Next →
          </button>
        </nav>
      )}
      <p className={styles.method}>
        Methodology: each reaction compares the market’s prior close (the last close
        before the announcement) with its next close (the first close on or after it),
        using publicly reported figures. Every event links to its source. This piece shows
        timing correlation; it does not allege trading by any named individual.
      </p>
      <ShareButton />
      <p className={styles.concept}>
        Prefer the whole story on one interactive screen?{' '}
        <a className={styles.conceptLink} href="/poc.html">
          Open the “When he posts” concept
        </a>
        .
      </p>
    </section>
  )
}
