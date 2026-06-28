# Architecture

A single-page React + TypeScript app (Vite). No router, no server — static data
is bundled and the whole experience is one scroll. This doc maps the pieces so a
new contributor can navigate quickly.

## Data flow

```
src/data/*.json ──▶ src/data/index.ts ──▶ App
                                            │  correlateAll(announcements, markets)
                                            ▼
                                   CorrelatedEvent[]  (announcement + per-series reactions)
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                     ▼
   MasterTimeline                      ScrollStage                            Outro
   (full-term overview)            (pinned deep-dive scrolly)            (closing ledger)
```

- **`src/data/`** — `markets.json` (9 series × ~111 daily closes) and
  `announcements.json` (30 sourced, time-ordered events). `SOURCES.md` records
  provenance. `data/__tests__/data.test.ts` guards shape + integrity.
- **`src/lib/`** — pure, unit-tested helpers (the heart of the app's correctness):
  - `correlate.ts` — joins each announcement to its close-to-close market reaction.
  - `scales.ts` — all chart geometry (line/area paths, time/price scales,
    `windowAround`, `decollide`, `sparklinePath`, `nearestPointIndex`).
  - `stats.ts` — derived metrics (`spotlightTicker`, `eventMoves`, `netReturnPct`,
    `maxDrawdown`, `chartAriaLabel`, …).
  - `motion.ts` — pure animation params (`drawOnVars`, `adjacentIndex`).
  - `hash.ts` — URL deep-linking (`eventIdFromHash`, `hashForEvent`,
    `eventShareUrl`, `instrumentFromQuery`).
  - `format.ts`, `labels.ts` — formatting + human labels.
  - Hooks: `useReducedMotion`, `useInView`, `useMediaQuery`, `useTheme`, `useCountUp`.

## Components

- **App.tsx** — composes the page; owns the timeline-instrument state (URL `?i=`),
  the deep-link jump handlers (timeline ↔ deep-dive ↔ ledger), and computes the
  hero backdrop + per-event windowed series.
- **Hero / StatBand** — intro + key-swing count-ups.
- **CategoryBand** — "which posts moved <instrument>?": the mean close-to-close reaction
  grouped by announcement type (`reactionByType`), as ranked sign-coloured bars that
  reveal on scroll and recompute when the timeline instrument changes.
- **MasterTimeline** — full-term chart: filterable legend, instrument switcher +
  compare overlay, scrub readout, de-collided event markers, term-outcome line, a y-axis
  price reference (faint gridlines), and the deepest-drawdown trough marked on the line.
  The header term-stat shows net return, drawdown, and the directional hit-rate ("rose on
  N of M posts", `reactionHitRate`). The selected marker labels its reaction on the chart
  (via **ChartReactionLabel**). Selection is URL-deep-linked and announced via the
  **EventDetail** panel, which also lists the event's cross-instrument moves (`eventMoves`).
- **ScrollStage** — pins the deep-dive and emits scroll progress (native rAF);
  stacks panels on mobile. **MarketChart** renders the windowed per-event chart
  (responsive viewBox) and marks the announcement's data point with a hollow ring +
  its reaction (**ChartReactionLabel**), so the move reads on the line, not only in
  the card; **AnnouncementCard** is the editorial pull-quote; **TickerRail** shows the
  event's cross-instrument moves.
- **ChartReactionLabel** — shared presentational SVG `<text>` for the on-chart reaction
  (signed %, direction-coloured, bg-halo for legibility); used by both charts above so
  the label is styled and tuned in one place.
- **Outro** — a "biggest single-day reactions" highlight (`topReactions`, the most
  dramatic cross-instrument moves, deduped to distinct ticker+day moments) leading into
  the full ledger with per-row sparklines and jump-to-moment links.

## Conventions

- **Pure logic in `src/lib`, unit-tested**; components stay thin and presentational.
- **Reduced-motion safe** everywhere (all animation guards `prefers-reduced-motion`).
- **Honest data representation**: straight (non-smoothed) lines, flagged truncated
  axes, auto-scaled labeled comparisons.
- **Testing pyramid**: Vitest unit/component (the `verify` gate) + Playwright E2E
  for critical flows (`npm run test:e2e`, outside the gate).
