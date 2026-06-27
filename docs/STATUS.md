# STATUS

Continuous looptight-gated improvement loop. Each task: implement → `npm run verify`
(tsc + vitest + build) green → commit.

## Now
Expanding scope: from the 12-day Iran war to **Trump's whole second term** (Jan 20 →
late Jun 2025). Much more data (full daily market series + ~25 market-moving
announcements: the tariff saga, the Apr 9 pause rally, Fed attacks, Iran war). Design
must fill space — add a full-presidency master timeline as the centerpiece.

Data inbound via two research agents: (1) market-moving announcements across the term,
(2) full-period daily closes for 9 instruments (written to /tmp/marketdata.json).

## Next

1. Extend the data model for the whole term.
   Evidence: src/lib/types.ts (AnnType lacks tariff/fed/etc.)
   Acceptance: AnnType adds 'tariff' | 'trade-deal' | 'fed' | 'policy'; ACCENT,
   spotlightTicker, and the card's TYPE_LABEL/tag styles handle every type;
   verify green.

2. Ingest the full-period market series (Stooq/Yahoo via agent → /tmp/marketdata.json).
   Evidence: src/data/markets.json (only Jun 12–24 daily closes)
   Acceptance: markets.json spans 2025-01 → 2025-06 daily; a build script computes
   pctFromPrevClose so the consistency test passes; ≥1 reaction per announcement.

3. Ingest the expanded announcement timeline.
   Evidence: src/data/announcements.json (10 Iran-war events only)
   Acceptance: ~20-30 sourced events across the term (tariffs, pause, Fed, Iran),
   strictly time-ordered, every one cited; integrity tests pass.

4. Master timeline chart — full presidency, all markers (space-filling centerpiece).
   Evidence: no overview viz exists; lots of empty space in the stage
   Acceptance: a full-width time-axis chart of the index with every announcement
   plotted as a color-by-type marker; selecting a marker shows its details; a pure
   time-position helper is unit-tested; responsive.

5. Curate the scrolly to featured events so it isn't absurdly long.
   Evidence: ScrollStage renders one 100vh step per event (~30 = too long)
   Acceptance: announcements can be flagged 'featured'; the scrolly uses featured
   only; the master chart covers the full set; verify green.

6. Fill-space density pass.
   Evidence: large empty regions in the pinned stage
   Acceptance: chart uses more vertical space; stage has no large dead zones at
   common breakpoints; verify green.
