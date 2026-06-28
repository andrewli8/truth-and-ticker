# Architecture

A single-page React + TypeScript app (Vite). No router, no server — static data
is bundled and the whole experience fits on one screen (the HUB). This doc maps the
pieces so a new contributor can navigate quickly.

## Data flow

```
src/data/*.json ──▶ src/data/index.ts ──▶ App ──▶ HubApp
                                            │  correlateAll(announcements, markets)
                                            ▼
                                   CorrelatedEvent[]  (announcement + per-series reactions)
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                     ▼
     Filmstrip                          EventZoom                          BreakdownZoom
  (timeline of cards)            (one event, zoomed)            (CategoryBand/ReactionSpread/ledger)
```

- **`src/data/`** — `markets.json` (9 series × ~111 daily closes) and
  `announcements.json` (30 sourced, time-ordered events). `SOURCES.md` records
  provenance. `data/__tests__/data.test.ts` guards shape + integrity.
- **`src/lib/`** — pure, unit-tested helpers (the heart of the app's correctness):
  - `correlate.ts` — joins each announcement to its close-to-close market reaction.
  - `scales.ts` — all chart geometry (line/area paths, time/price scales,
    `windowAround`, `sparklinePath`, `nearestPointIndex`).
  - `stats.ts` — derived metrics (`seriesByTicker`, `eventMoves`, `netReturnPct`,
    `maxDrawdown`, `reactionByType`, `topReactions`, `reactionSpread`, `chartAriaLabel`, …).
  - `motion.ts` — pure animation params (`drawOnVars`, `adjacentIndex`).
  - `instruments.ts` — the shared `INSTRUMENTS` list (ticker + name).
  - `format.ts`, `labels.ts` — formatting + human labels.
  - Hooks: `useReducedMotion`, `useInView`, `useMediaQuery`, `useTheme`, `useCountUp`.

## Components

The main site is a single-screen **hub** (`src/hub/`). `App.tsx` simply renders `HubApp`.

- **HubApp** — owns the one-screen state: the chosen instrument, the active filmstrip
  index, which event is zoomed (`EventZoom`), and which breakdown is open (`BreakdownZoom`).
  Frames the masthead + thesis + POC link, the summary stats (count, the instrument's
  Jan→Jun net, the biggest single swing), the instrument switcher (shared `INSTRUMENTS`),
  and the topic chips. Everything recolours to the active reaction's direction.
- **Filmstrip** — the horizontal timeline: one option per announcement (a `role="listbox"`),
  travelled by scroll / drag / ←→ keys (Home/End jump). The centred card is active; clicking
  it opens its zoom. Each card shows the date, type, the instrument's reaction, and the quote.
- **EventZoom** — the modal detail layer for one announcement: the windowed **MarketChart**
  (reaction labelled on the line via **ChartReactionLabel**), the full quote, and every
  instrument's move (`eventMoves`). Escape / backdrop close.
- **BreakdownZoom** — a modal panel that reuses the existing data views: **CategoryBand**
  ("which posts moved <instrument>?", `reactionByType`), **ReactionSpread** (the reaction
  distribution, `reactionSpread`), and the **Outro** ledger (`topReactions` highlights +
  the sortable, paginated table whose rows open that event's `EventZoom`).
- **MarketChart** — the windowed per-event line chart (responsive viewBox) marking the
  announcement's data point with a hollow ring + its reaction; **ChartReactionLabel** is the
  shared presentational SVG `<text>` for that on-chart reaction (signed %, direction-coloured,
  bg-halo for legibility). **ThemeToggle** is the light/dark control; **ShareButton** (in the
  ledger) offers native share / copy-link.

## The one-screen POC (`src/poc/`, `/poc.html`)

A standalone interactive concept ("When he posts, the market moves") ships as a **second
Vite entry** (`poc.html` → `src/poc/main.tsx`; `rollupOptions.input` in `vite.config.ts`),
independent of the main hub so it can experiment separately. It
**reuses the real data and the same pure helpers** (`data`, `lib/scales`, `lib/correlate`,
`lib/stats.seriesByTicker`, `lib/format.direction`, `lib/instruments.INSTRUMENTS`) — no
duplicated logic. `PocApp` renders a chosen market's full term as one glowing line; the
user scrubs it by pointer **or keyboard** (the chart is a focusable `role="slider"` with
arrow/Home/End stepping), and the active post's gain/loss drives the readout and the whole
scene's accent (`data-dir`). An **instrument switcher** (the shared `INSTRUMENTS` list)
re-plots the line and re-derives the posts/readout on change. Motion is GSAP via `useGSAP`
(entrance line draw-on, masked title, count-up readout, lerp cursor, plus a line re-draw on
instrument switch), all gated on `prefers-reduced-motion`. Covered by `src/poc/__tests__`
(unit) and `e2e/poc.spec.ts` (drag, keyboard, instrument switch, reduced-motion, mobile);
linked from the hub's masthead.

## Conventions

- **Pure logic in `src/lib`, unit-tested**; components stay thin and presentational.
- **Reduced-motion safe** everywhere (all animation guards `prefers-reduced-motion`).
- **Honest data representation**: straight (non-smoothed) lines, flagged truncated
  axes, auto-scaled labeled comparisons.
- **Testing pyramid**: Vitest unit/component (the `verify` gate) + Playwright E2E
  for critical flows (`npm run test:e2e`, outside the gate).
