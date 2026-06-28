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
- Visible header for the ledger sparkline column ("<TICKER> ±10d path").
- Theme-aware ledger row borders (color-mix on --steel; was hardcoded dark rgba).
- Dropped dead .dayLabel CSS rule in MarketChart.
- GPU-friendly marker hover (transform scale, not the SVG r attribute).
- Removed unused maxDrawdownPct export (tests retargeted at maxDrawdown).
- Corrected two WTI figures that contradicted the chart data (Jun 13 +7.6→+7.3%,
  Jun 23 ~7.2→~8.6%); guarded by a WTI-claim-vs-CL-data integrity test.
- Stated Dow moves in percent, not raw points (4 summaries); guarded by a DJI-claim +
  no-raw-points integrity test.
- Top-level error boundary: a render throw now shows an on-brand fallback (reload),
  not a blank screen.
- Absolute URLs for og:image / twitter:image / JSON-LD image (social share previews).
- Mar 4 summary restated on the close-to-close basis (was intraday lows, mismatched the
  ledger); a comprehensive test now asserts every S&P/Nasdaq/Dow/WTI% claim matches its
  close-to-close reaction (peak-relative figures excluded).
- SOURCES note: single-stock figures (GM/Ford/AAPL/TSLA) are externally sourced, not in
  the charted dataset (provenance transparency).
- Fixed decollide() lower-bound clamp to preserve the min gap + idempotency (mirror of
  the upper-bound pass); latent helper defect, now tested.
- <noscript> fallback (headline + thesis + enable-JS prompt) for the client-rendered SPA.
- robots.txt + sitemap.xml for crawl/discovery hygiene.
- Data test uses REACTION_WINDOW_MINS (not a literal 120).
- Fixed StatBand value clipping: 3-digit percentages (VIX +254.30%) overflowed their cell;
  reduced the value font clamp so they fit (verified via Playwright screenshot).
- Shared --ease ease-out token (cubic-bezier(0.16,1,0.3,1)) applied to interactive
  hover/press transitions for snappier, cohesive motion (reveals/theme left as-is).
- Subtle hover-lift on instrument/legend chips (tactile consistency w/ ShareButton + dots).

## Next

1. Add :active press-state feedback to the lifting interactive controls, completing the
   tactile loop (hover lifts, press settles to baseline). Currently .instBtn, .legendItem
   (translateY(-1px) on hover) and ShareButton .btn/.tweet (translateY(-2px)) have no
   pressed state, so a click gives no tactile confirmation. Evidence:
   src/components/MasterTimeline.module.css:96 (.instBtn:hover); Evidence:
   src/components/ShareButton.module.css:34 (.btn/.tweet:hover lift). Acceptance: those
   controls gain an :active rule resetting transform to translateY(0) (a subtle press-down
   from the hovered position); provable by diffing the CSS; verify gate stays green.