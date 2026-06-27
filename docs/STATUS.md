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
- Deep-dive chart windowed to each event (±21d via pure windowAround).
- Ticker rail shows the active event's moves, biggest first (eventMoves).
- Chart aspect honest (no preserveAspectRatio=none); responsive measured viewBox.
- Deep-dive chart fills the stage; dead band halved (225→119px at 1440).
- De-collided clustered master-timeline markers (pure decollide helper).
- Price lines drawn straight (curveLinear), not smoothed — honest daily closes.

## Next

1. Honest y-axis baseline cue on the deep-dive chart.
   Evidence: src/components/MarketChart.tsx (domainFor uses min..max, so the area fill
   starts at the window low — a truncated axis that visually exaggerates the move with
   no indication the baseline isn't zero)
   Acceptance: the chart signals the truncated baseline (e.g. a "low" axis label or a
   zero-baseline note) so the move isn't overstated; a pure label helper is
   unit-tested; verify green.

2. Master-timeline scrub should snap its readout to the nearest real close.
   Evidence: src/components/MasterTimeline.tsx (scrub uses valueAt step-hold; between
   sparse points the readout price can sit visually off the drawn line)
   Acceptance: the scrub dot/readout aligns to the nearest plotted point via a pure
   nearest-point helper that is unit-tested; verify green.
