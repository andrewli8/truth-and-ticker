# STATUS

Continuous looptight-gated improvement loop. Each task: implement → `npm run verify`
(tsc + vitest + build) green → commit. Generate more when this list empties.

## Now
Polishing toward an Awwwards-grade, viral, fully responsive piece. Light default +
dark mode, OG/share, stat band, marquee ticker, tablet layout, and a11y all shipped.

## Done
- Theme system: light default + optional dark, no-flash, persisted.
- Theme-aware accents (chart/tags/rail via CSS vars).
- Social virality: OG/Twitter meta + 1200×630 OG image + share button.
- Viral stat band: dataset-computed count-up numbers.
- Responsive hardening: marquee ticker, tablet layout, no overflow 320–1280.
- A11y: AA contrast, focus-visible rings, reduced-motion guard.

## Next

1. Scroll progress bar + clickable event timeline nav.
   Evidence: src/App.tsx (no progress indicator or jump-nav)
   Acceptance: a fixed top progress bar tracks scroll; a row of dots (one per
   event) is keyboard-focusable and jumps to that event's scroll position;
   reduced-motion safe; a pure offset helper is unit-tested.

2. Animated hero entrance (GSAP useGSAP).
   Evidence: src/components/Hero.tsx (renders fully static)
   Acceptance: kicker/title/thesis animate in on load via useGSAP; no animation
   under reduced motion; App test still renders thesis text; verify green.

3. Chart spotlights the most-relevant instrument per event.
   Evidence: src/App.tsx (primary chart is always SPX)
   Acceptance: a pure `spotlightTicker(annType)` picks oil for jawbone, defense
   for strikes, S&P otherwise; chart shows it; unit-tested; verify green.

4. SEO hardening — theme-color, canonical, Article JSON-LD.
   Evidence: index.html (no theme-color/canonical/structured data)
   Acceptance: index.html adds theme-color, canonical link, and an Article
   JSON-LD script; verify green.

5. Date readout on the chart playhead.
   Evidence: src/components/MarketChart.tsx (playhead has no date label)
   Acceptance: the current point's date renders by the playhead, formatted via a
   pure `formatDay` helper that is unit-tested; verify green.
