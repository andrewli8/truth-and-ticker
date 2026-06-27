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
- Truncated y-axis flagged on the deep-dive chart (axisFloorLabel cue).
- Scrub snaps to the nearest real close (nearestPointIndex helper).
- Hero copy rescoped to the whole second term.
- Page metadata rescoped to the whole second term (title/OG/Twitter/JSON-LD).

## Next


1. One shared event-type label, used everywhere (no raw enums, no duplication).
   Evidence: src/components/AnnouncementCard.tsx defines TYPE_LABEL; src/components/
   Outro.tsx:33 prints the raw enum (e.g. "market-jawbone"); MasterTimeline uses
   type.replace('-',' ')
   Acceptance: a pure typeLabel(type) helper is the single source, used by card, Outro,
   and master-timeline detail; unit-tested; verify green.

2. The deep-dive chart's accessible name carries no data.
   Evidence: src/components/MarketChart.tsx (aria-label={`${series.name} price line`})
   Acceptance: the chart's accessible name states the instrument and the window's move
   (e.g. "S&P 500, Jan 20 window, +0.9%") via a pure helper that is unit-tested; verify
   green.

3. Outro methodology text predates the close-to-close method.
   Evidence: src/components/Outro.tsx:41 ("price … a fixed window later") vs
   src/lib/correlate.ts reactionFor (prior close → next close)
   Acceptance: the methodology paragraph describes the prior-close→next-close basis;
   provable by diffing Outro.tsx; verify green.
