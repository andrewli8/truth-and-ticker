# STATUS

Continuous looptight-gated improvement loop. Each task: implement → `npm run verify`
(tsc + vitest + build) green → commit. Focus: design polish, website craft, and
honest data representation.

## Now
Whole-second-term scope, honest data representation, editorial design, and a connected
interactive experience are all in place: master timeline (filterable legend, scrub,
de-collided markers, term-outcome line) ↔ windowed deep-dive (per-event reveal,
pull-quote, reaction count-up) ↔ ledger (sparklines, jump-to-moment), with deep-linkable
+ shareable events and broad a11y/test coverage. Remaining big-ticket items are owner
calls: a cross-fade/morph chart transition, and a Playwright E2E layer (the project's
verify gate is tsc+vitest+build).

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
- One-glance term outcome (net + max drawdown) on the timeline.
- Per-row sparklines in the Outro ledger.

## Next

