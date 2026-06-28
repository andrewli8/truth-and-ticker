# STATUS

Continuous looptight-gated improvement loop. Each task: implement → `npm run verify`
(tsc + vitest + build) green → commit. Focus: design polish, website craft, and
honest data representation.

## Now
Whole-second-term scope, honest data representation, editorial design, and a connected
interactive experience are all in place: master timeline (filterable legend, scrub,
de-collided markers, term-outcome line) ↔ windowed deep-dive (per-event reveal,
pull-quote, reaction count-up + per-event fade) ↔ ledger (sparklines, jump-to-moment),
with deep-linkable + shareable events, an instrument switcher, a real-data hero backdrop,
and broad a11y coverage. Testing: 199 unit/component (the verify gate) with measured
coverage (npm run test:coverage, thresholds enforced) plus a Playwright E2E suite
(npm run test:e2e, outside the gate).

## Done
- Data model + full-period data (30 events, 9×111 closes); master timeline centerpiece.
- Scrolly curated to featured events; gradient area fill under charts.
- Scroll-into-view draw-on reveal; staggered markers; reduced-motion safe.
- Hover-scrub crosshair with live date/price readout; keyboard arrow event-stepping.
- Animated market-reaction readout (shared useCountUp).
- Editorial pull-quote treatment (deep-dive card + master timeline detail).
- Deep-dive chart windowed to each event (±21d via pure windowAround).
- Ticker rail shows the active event's moves, biggest first (eventMoves).
- Chart aspect honest (no preserveAspectRatio=none); responsive measured viewBox.
- Deep-dive chart fills the stage; dead band halved (225→119px at 1440).
- De-collided clustered master-timeline markers (pure decollide helper).
- Price lines drawn straight (curveLinear), not smoothed — honest daily closes.
- Truncated y-axis flagged on the deep-dive chart (axisFloorLabel cue).
- Scrub snaps to the nearest real close (nearestPointIndex helper).
- Hero copy rescoped to the whole second term.
- Page metadata rescoped to the whole second term (title/OG/Twitter/JSON-LD).
- Single shared typeLabel for event types (no raw enums/dupes).
- Data-rich accessible name for the deep-dive chart (chartAriaLabel).
- Outro methodology text matches the close-to-close basis.
- StatBand copy/framing rescoped to the whole term.
- Share text rescoped to the whole second term.
- ScrollStage dot-nav/render-prop covered by tests.
- useMediaQuery hook covered by tests.
- Hero covered by a component test.
- Deep-dive charts reveal per-panel (localProgress); mobile fully draws.
- Hero has a faint market-line backdrop (reduced-motion safe).
- Data-rich accessible name for the overview timeline (timelineAriaLabel).
- useTheme hook covered by tests.
- Dropped dead per-type tag classes in AnnouncementCard.
- README rescoped to the whole term + accurate stack.
- Dropped unused lenis dependency.
- OG share image rescoped to the whole second term.
- Interactive legend filters timeline markers by category.
- Dropped unused d3-array direct dependency.
- Overview markers jump to their deep-dive panel (featured events).
- 'Biggest run-up' stat now measures the true max run-up.
- Deep-linkable events via URL hash (#event-<id>).
- Timeline re-selects on URL hash change (back/forward/links).
- Outro ledger rows jump to the moment on the timeline.
- Copy a shareable deep-link to the selected moment.
- aria-live detail region; per-event card + chart entrance; marker hover affordance.
- Outro reveal-on-scroll; App-level deep-link flow test.
- One-glance term outcome (net + max drawdown, with trough date) on the timeline.
- Per-row sparklines in the Outro ledger.
- Instrument switcher on the master timeline (S&P/Nasdaq/oil/defense/gold/VIX).
- Hero backdrop uses the real S&P 500 term shape.
- Playwright E2E smoke suite for critical flows (outside the verify gate).
- Line morph when switching instruments; instrument reflected in the URL (?i=).
- Skip-to-content link + touch-action (Web Interface Guidelines pass).
- E2E for reduced-motion and mobile viewport.
- Vendor code-split into cacheable chunks (app chunk 369K→126K).
- A11y pass: role=group on the interactive chart, StatBand heading, deep-dive
  landmark, decorative aria-hiding (178 unit/component + 11 E2E).
- Compare overlay: benchmark line (own-scale, labeled) for shape/timing comparison.
- Measurable coverage (@vitest/coverage-v8) with enforced thresholds; useCountUp +
  useInView browser paths covered (rAF/IntersectionObserver mocks).
- Hardened the event-hash parser against malformed percent-encoding (no URIError crash).
- Single shared accentVar() for event-type accents (deduped two identical maps).
- Single-sourced the reaction window constant (REACTION_WINDOW_MINS) across call sites.
- External links announce "(opens in new tab)" to assistive tech (.srOnly utility).

## Next

1. Give the Outro ledger's sparkline column a visible header. The `<th>` for the mini
   market path is empty except for an aria-label, so sighted users can't tell what the
   column shows. The path is a ±10-day window (SPARK_DAYS=10, a half-window in
   windowAround). Evidence: src/components/Outro.tsx:33; Acceptance: that header renders
   non-empty visible text describing the window (e.g. "±10d path"), asserted by a new
   Outro test that finds the header by its visible text.
2. Make the Outro table row borders theme-aware. The `td` border hardcodes
   `rgba(42,42,46,0.5)` (the dark steel), which shows as dark lines in the light theme
   while the header border correctly uses `var(--steel)`. Evidence:
   src/components/Outro.module.css:55; Acceptance: line 55 uses a theme token
   (`var(--steel)`) instead of the hardcoded rgba (provable by diffing the file); verify
   gate stays green.
3. Remove the dead `.dayLabel` CSS rule. It is defined in MarketChart.module.css but
   never referenced anywhere in the codebase. Evidence:
   src/components/MarketChart.module.css:133; Acceptance: the `.dayLabel` block is gone
   (provable by diffing the file) and `grep -r dayLabel src` returns no matches; verify
   gate stays green.

