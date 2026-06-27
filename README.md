# TRUTH & TICKER

A single-page, scroll-driven visualization correlating Donald Trump's public
announcements during the **June 2025 Israel–Iran "12-Day War"** with the U.S.
markets that moved on them — the S&P 500, the Dow, oil, defense names, gold, and
the VIX.

The framing is deliberate: **timing correlation, not accusation.** Each verified
announcement timestamp is laid against the verified market reaction that
followed, with a citation on every event. The pattern is the argument. The
reader judges it.

## Stack

- **Vite + React + TypeScript**
- **GSAP ScrollTrigger + Lenis** — smooth-scroll, scroll-progress, pinned stage
- **D3 (d3-scale / d3-shape)** — math only; the chart is hand-rolled SVG for full
  control of the line-draw reveal, playhead, and dot
- **Vitest + Testing Library** — unit + component + dataset-integrity tests

## Develop

```bash
npm install
npm run dev       # local dev server
npm run test      # vitest
npm run verify    # tsc --noEmit && vitest run && vite build  (the looptight gate)
npm run build     # production build to dist/
```

## How it works

- `src/data/announcements.json` — verified announcement timeline (verbatim
  quotes, ET timestamps, type, citation).
- `src/data/markets.json` — daily close series per instrument.
- `src/lib/correlate.ts` — joins each announcement to its **close-to-close**
  market reaction (the close before vs. the reaction close after), null-safe.
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

- Spec: `docs/superpowers/specs/2026-06-27-truth-and-ticker-design.md`
- Plan: `docs/superpowers/plans/2026-06-27-truth-and-ticker.md`
