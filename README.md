# TRUTH & TICKER

A single-page, scroll-driven visualization correlating Donald Trump's public
announcements across his **second term (Jan–Jun 2025)** — tariffs, threats,
strikes, ceasefires, Fed pressure — with the U.S. markets that moved on them: the
S&P 500, the Nasdaq, the Dow, oil, defense names, gold, and the VIX. A
full-presidency master timeline anchors the piece; featured events get a
windowed deep-dive.

The framing is deliberate: **timing correlation, not accusation.** Each verified
announcement timestamp is laid against the verified market reaction that
followed, with a citation on every event. The pattern is the argument. The
reader judges it.

## Stack

- **Vite + React + TypeScript**
- **Native rAF scroll** — the pinned stage derives scroll progress from native
  scroll position (no smooth-scroll library), so scrolling stays responsive
- **GSAP (`useGSAP`)** — entrance + scroll-into-view reveals (hero, timeline
  draw-on), all reduced-motion safe
- **D3 (d3-scale / d3-shape)** — math only; the chart is hand-rolled SVG for full
  control of the line-draw reveal, playhead, and dot
- **Vitest + Testing Library** — unit + component + dataset-integrity tests
- **Playwright** — E2E smoke suite for critical flows (`npm run test:e2e`), kept
  outside the `verify` gate

## Develop

```bash
npm install
npm run dev       # local dev server
npm run test      # vitest
npm run verify    # tsc --noEmit && vitest run && vite build  (the looptight gate)
npm run test:e2e  # Playwright E2E smoke suite (real Chromium; outside the gate)
npm run build     # production build to dist/
```

## How it works

- `src/data/announcements.json` — verified announcement timeline (verbatim
  quotes, ET timestamps, type, citation).
- `src/data/markets.json` — daily close series per instrument.
- `src/lib/correlate.ts` — joins each announcement to its **close-to-close**
  market reaction (the close before vs. the reaction close after), null-safe.
- `src/lib/stats.ts` `reactionByType` — averages those reactions by announcement
  category, powering the **CategoryBand** ("which posts moved <instrument>?").
- `src/components/ScrollStage.tsx` — pins the chart and emits scroll progress.
- `src/components/MarketChart.tsx` — pure SVG renderer driven entirely by a
  `progress` prop (ghost full line + bright revealed line + playhead + dot).

See [`src/data/SOURCES.md`](src/data/SOURCES.md) for data provenance and caveats.

## Push to GitHub

The repo is initialized locally on the `main` branch with full history. To create
the remote and push (pick `--public` if you want it shareable):

```bash
gh repo create truth-and-ticker --private --source=. --remote=origin --push
# or, with an existing empty repo:
git remote add origin git@github.com:<you>/truth-and-ticker.git && git push -u origin main
```

## Design & methodology docs

- Architecture & data flow: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Accessibility posture: [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md)
- Data provenance & methodology: [`src/data/SOURCES.md`](src/data/SOURCES.md)
- Spec: `docs/superpowers/specs/2026-06-27-truth-and-ticker-design.md`
- Plan: `docs/superpowers/plans/2026-06-27-truth-and-ticker.md`
