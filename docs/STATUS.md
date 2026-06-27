# STATUS

Continuous looptight-gated improvement loop. Each task: implement → `npm run verify`
(tsc + vitest + build) green → commit. Focus: design polish, website craft, and
honest data representation.

## Now
Whole-second-term scope is in place (30 sourced events, 9 series × 111 daily closes,
master timeline, featured scrolly). Motion + interaction landed (draw-on reveal,
hover-scrub, keyboard event-stepping, count-up reaction). Quote blocks recomposed as
editorial pull-quotes. Now refining how faithfully the deep-dive represents each event
and tightening layout density.

## Done
- Data model + full-period data (30 events, 9×111 closes); master timeline centerpiece.
- Scrolly curated to featured events; gradient area fill under charts.
- Scroll-into-view draw-on reveal; staggered markers; reduced-motion safe.
- Hover-scrub crosshair with live date/price readout; keyboard arrow event-stepping.
- Animated market-reaction readout (shared useCountUp).
- Editorial pull-quote treatment (deep-dive card + master timeline detail).

## Next

1. Window the deep-dive chart to each event's moment.
   Evidence: src/App.tsx:58 (every featured panel renders the full Jan–Jun series; the
   momentLabel claims one date but the chart spans the whole term)
   Acceptance: a pure `windowAround(points, datetimeISO, days)` helper slices a series
   to a window centred on the event (unit-tested: centred, clamped at both ends, empty
   input); the deep-dive MarketChart receives the windowed series so each panel shows
   the action around that announcement; verify green.

2. Ticker rail reflects the active event, not day-zero zeros.
   Evidence: src/components/TickerRail.tsx:14 (currentPct reads pctFromPrevClose at the
   scroll index; at a panel's entry progress≈0 → day 0 → every chip reads +0.00%)
   Acceptance: each chip shows the instrument's move for the active event (its
   correlated reaction), via a pure helper that is unit-tested; verify green.

3. Stop the deep-dive chart from distorting the line.
   Evidence: src/components/MarketChart.tsx:61 (preserveAspectRatio="none" scales X and
   Y independently, so slopes are visually false)
   Acceptance: the chart preserves aspect (no "none") without layout regression at
   320–1440px; existing chart tests stay green; verify green.

4. Remove dead space in the pinned deep-dive stage.
   Evidence: src/styles/app.css:25 (.stage uses align-items:center; large empty bands
   above/below at 1024–1440px, visible in screenshots)
   Acceptance: the stage distributes content to fill the viewport with no large dead
   zone at 1024px and 1440px; chart claims more vertical space; verify green.

5. De-collide clustered master-timeline markers.
   Evidence: src/components/MasterTimeline.tsx (markers overlap where events bunch, e.g.
   the June war cluster — several dots merge)
   Acceptance: overlapping markers are separated legibly via a pure de-collision helper
   that is unit-tested (stable order, minimum spacing); verify green.
