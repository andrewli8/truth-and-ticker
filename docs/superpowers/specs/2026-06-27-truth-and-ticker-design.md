# TRUTH & TICKER — Design Spec

**Date:** 2026-06-27
**Status:** Approved direction (curated data · timing-correlation framing · Vite+React+GSAP · scrollytelling)

## 1. Purpose

A single-page, scroll-driven cinematic visualization correlating Donald Trump's
public announcements during the **June 2025 Israel–Iran "12-Day War"** with
movements in U.S. equity indices (S&P 500, Dow), oil, and major sector tickers
(defense, energy, safe-haven). The piece juxtaposes the *timestamp of words*
against the *market move that followed* so the reader can judge the pattern of
profiteering / manipulation for themselves.

**Framing rule:** timing-correlation only. We show verifiable timestamps and
verifiable market moves side by side. We do NOT assert insider trading by named
individuals — the pattern is the argument. Every event card carries a citation.

## 2. Success criteria

- Cinematic, Awwwards-grade scrollytelling: pinned chart that animates in sync
  with scroll through each announcement; 60fps; honors `prefers-reduced-motion`.
- A verified, reproducible curated dataset (no runtime API calls, no keys).
- Correlation logic that joins each announcement to its market reaction window
  and renders a delta badge.
- Fully responsive; mobile degrades the pin into stacked event cards.
- Tests green (Vitest) and `tsc` + `vite build` pass — gated by looptight.

## 3. Event spine (to be verified & sourced during build)

| Date (ET) | Event | Type | Expected market signal |
|-----------|-------|------|------------------------|
| Jun 13 2025 | Israel "Operation Rising Lion" strikes Iran | strike | Oil ↑, S&P ↓, defense ↑ |
| Jun 17 2025 | Trump: "Everyone should immediately evacuate Tehran" | threat | Risk-off |
| Jun 18 2025 | Trump: "I may do it, I may not… nobody knows" | threat | Volatility / VIX ↑ |
| Jun 19 2025 | Trump: decision "within two weeks" | threat | Relief bounce |
| Jun 21–22 2025 | US strikes Fordow/Natanz/Isfahan ("Midnight Hammer"), announced on Truth Social | strike | Oil gap-up risk |
| Jun 23 2025 | Iran telegraphed Al-Udeid retaliation + Trump "KEEP OIL PRICES DOWN. I'M WATCHING!" | market-jawbone | Oil ↓ (symbolic retaliation) |
| Jun 24 2025 | Trump: "Complete and total ceasefire" | ceasefire | Relief rally, oil crash ~7% |

Final event list and exact quotes/timestamps are researched and cited during
implementation; the table above is the scaffold, not the source of truth.

## 4. Data model

`src/data/announcements.json`
```
[{
  id: string,
  datetime: string,        // ISO 8601 with ET offset
  source: "Truth Social" | "Oval Office" | "White House" | ...,
  quote: string,           // verbatim, short
  summary: string,         // one-line context
  type: "strike" | "threat" | "ceasefire" | "market-jawbone",
  citationUrl: string,
  citationLabel: string
}]
```

`src/data/markets.json`
```
[{
  ticker: string,          // e.g. "SPX", "CL", "LMT"
  name: string,
  category: "index" | "oil" | "defense" | "energy" | "safe-haven",
  points: [{ datetime: string, price: number, pctFromPrevClose: number }]
}]
```

Reactions are computed at runtime by `correlate.ts` (not stored), keeping the
dataset minimal and the join logic testable.

## 5. Correlation logic (`src/lib/correlate.ts`)

Pure, immutable functions:
- `reactionFor(announcement, series, windowMins): Reaction` — find the price at
  announcement time and at `time + window`, return `{ deltaPct, from, to }`.
- `correlateAll(announcements, markets, windowMins): CorrelatedEvent[]` — map
  each announcement to a reaction per tracked ticker.
- Defensive: returns null reaction (not NaN) when data is missing; callers render
  "n/a". Validated by tests.

## 6. Architecture (Vite + React + TypeScript)

Smooth scroll: **Lenis**. Scroll-driven animation: **GSAP ScrollTrigger** (via
`@gsap/react` `useGSAP`). Charts: hand-rolled **D3 scales + SVG paths** for full
control of reveal animation (no heavy chart lib). Number animation: GSAP/quick.

Components (small, focused — one purpose each):
- `Hero.tsx` — kinetic title + thesis statement
- `ScrollStage.tsx` — owns the pinned section + scroll progress, distributes it
- `MarketChart.tsx` — pure SVG renderer; props: series + progress (0–1)
- `AnnouncementCard.tsx` — quote, timestamp, type tag, delta badge, citation
- `TickerRail.tsx` — flickering ticker tape (defense/oil) reacting to progress
- `Outro.tsx` — aggregate "who moved, when" summary table + methodology note
- `App.tsx` — composition
- `lib/correlate.ts`, `lib/format.ts` (number/time/pct formatting), `lib/scales.ts`

State is derived and immutable; scroll progress flows down as props. No mutation.

## 7. Design language

- **Palette:** near-black canvas (#0a0a0b), bone/off-white text, one hot accent
  (alert amber-red) for spikes/risk-off, cool green for relief rallies, muted
  steel for grid.
- **Type:** mono for data/timestamps; high-contrast grotesk or display serif for
  headlines. Large kinetic numerals.
- **Texture:** subtle film grain + faint scanline; restrained, not noisy.
- **Motion:** line-draw chart reveals, count-up deltas, parallax/magnetic
  accents, ticker flicker. All gated behind `prefers-reduced-motion`.
- **Responsive:** desktop = pinned scrollytelling; mobile = stacked cards, chart
  per event, no pin.

## 8. Testing & looptight

- Vitest unit tests: `correlate.ts` (delta math, window edges, missing data),
  `format.ts`, and a `data.test.ts` integrity suite (every announcement resolves
  ≥1 reaction, timestamps strictly ordered, no NaN, every announcement has a
  citation).
- Gate: `tsc --noEmit` + `vitest run` + `vite build` must pass.
- looptight selects grounded tasks from the plan and gates each commit on the
  above. We drive the backlog to green autonomously.

## 9. Out of scope (YAGNI)

- Live/real-time data feeds, API keys, backends.
- User accounts, sharing, CMS.
- Coverage beyond the June 2025 12-day window (extensible later via data files).
