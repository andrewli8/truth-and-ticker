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
and broad a11y coverage. Testing: 173 unit/component (the verify gate) plus a Playwright
E2E smoke suite (npm run test:e2e, outside the gate).

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

## Next

1. Guard the URL-hash parser against malformed percent-encoding. A deep-link like
   `#event-%` makes `decodeURIComponent` throw an uncaught `URIError`, crashing the app
   on load. Evidence: src/lib/hash.ts:10; Acceptance: a new test asserts
   `eventIdFromHash('#event-%')` returns null (not a throw), and the existing
   round-trip tests still pass.
2. Collapse the duplicated event-type→accent maps into one shared helper. The same
   `Record<AnnType, string>` of `var(--risk|warn|relief)` is maintained in two files, and
   it exactly equals `var(--${accentGroup(type)})` which already exists. Evidence:
   src/App.tsx:37; Evidence: src/components/AnnouncementCard.tsx:9; Acceptance: a new
   `accentVar(type)` in src/lib/labels.ts returns `var(--risk)` for `strike`/`tariff`,
   `var(--relief)` for `ceasefire`/`trade-deal`, else `var(--warn)`; both components
   import it and the local ACCENT consts are gone (provable by diffing the two files).
3. Single-source the close-to-close reaction window constant. `WINDOW_MINS = 120` is
   declared independently in two files; drift would silently mismatch the overview and
   deep-dive correlations. Evidence: src/App.tsx:23; Evidence:
   src/components/MasterTimeline.tsx:32; Acceptance: one exported constant is imported by
   both files and the second literal `120` is gone (provable by diffing both files).
4. Announce that citation/share links open in a new tab to assistive tech. Several
   `target="_blank"` anchors expose only a visual `↗`, so screen-reader users get no
   warning of the context switch. Evidence: src/components/EventDetail.tsx:73; Evidence:
   src/components/AnnouncementCard.tsx:67; Acceptance: those external anchors carry an
   accessible-name suffix like "(opens in new tab)" (e.g. via a visually-hidden span or
   aria-label), asserted by a new component test querying the accessible name.

