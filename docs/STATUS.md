# STATUS

Continuous looptight-gated improvement loop. Each task: implement → `npm run verify`
(tsc + vitest + build) green → commit. Focus: design polish, website craft, and
honest data representation.

## Now
Whole-second-term scope, honest data representation, editorial design, and a connected
interactive experience are all in place: hero → key-swing StatBand → CategoryBand
("which posts moved <instrument>?", reveals on scroll, follows the instrument switcher)
→ master timeline (filterable legend, scrub, de-collided markers, term-outcome line) ↔
windowed deep-dive (per-event reveal, pull-quote, reaction count-up + per-event fade) ↔
ledger (sparklines, jump-to-moment), with deep-linkable + shareable events, a real-data
hero backdrop, a kinetic per-glyph hero title, an Outro "biggest single-day reactions"
lead-in, cohesive motion (shared --ease, hover-lift/press states), WCAG 2.2 target sizes,
and broad a11y coverage (docs/ACCESSIBILITY.md). Every charted-instrument figure in the
prose is test-asserted against the data. Testing: 226 unit/component (the verify gate) at
~96% stmts / ~87% branches, plus a 25-spec Playwright E2E suite (npm run test:e2e, outside
the gate); remaining unit gaps are browser-API paths the E2E exercises.

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
- :active press-states on chips + share buttons (completes the hover→press tactile loop).
- Roomier mobile touch targets (~36px) for timeline switcher/legend chips (desktop unchanged).
- ≥24px tap targets for EventDetail footer (copy-link + citation), WCAG 2.2 target size.
- ≥24px tap target for AnnouncementCard citation link (WCAG 2.2 target size).
- 24px hit target for dot-nav (11px dot via ::before); WCAG 2.2 SC 2.5.8.
- docs/ACCESSIBILITY.md records the a11y posture (target sizes, motion, keyboard, SR, no-JS).
- README links the Accessibility and Data-provenance docs.
- Data test guards the deep-dive featured-event set (non-empty; each has SPX data).
- Broadened SOURCES caveat to all externally-reported context figures (market-cap, yields,
  single-day moves), not just single stocks.
- Tested ShareButton onShare (native share + clipboard fallback); 59%→95% line coverage.
- Tested StatBand null-series path (n/a, no NaN); StatBand now 100% covered.
- Covered AnnouncementCard empty-quote + null-delta + ticker-fallback branches.
- Covered labels.ts unknown-type fallbacks (now 100%).
- Covered TickerRail marquee-duplicate (motion-on) branch (now 100%).
- Covered useReducedMotion no-matchMedia + live-change branches.
- Unit coverage now 95.7% statements / 86.7% branches. Remaining gaps are jsdom-hostile
  browser-API paths (ResizeObserver/IntersectionObserver/GSAP/scroll in App, MarketChart,
  Outro reveal, MasterTimeline) which the Playwright E2E suite exercises in a real browser.
- E2E regression guards for the StatBand fit (1280px no-overflow) and 24px touch targets.
- reactionByType aggregator (mean S&P reaction by announcement category), TDD.
- CategoryBand view ("Which posts moved the S&P 500?"): ranked sign-colored bars by
  announcement type with sample counts; mounted between StatBand and timeline; tested and
  verified in light + dark.
- CategoryBand footnote flags its S&P scope (strikes moved oil/defense more) → switch
  instruments; tested.
- CategoryBand bars reveal on scroll (staggered grow-from-0, reduced-motion safe).
- E2E guard: CategoryBand renders + bars reveal after scroll-in.
- CategoryBand follows the selected timeline instrument (heading/bars morph; switching to
  Oil shows ceasefires/jawboning dropped it); footnote generalized, grammar fixed.
- ARCHITECTURE.md documents CategoryBand + reactionByType.
- README How-it-works notes reactionByType + CategoryBand.
- Memoized CategoryBand derived data (rows, max) per app convention.
- E2E guard: CategoryBand re-titles when the timeline instrument changes.
- Covered Outro empty-sparkline branch (series present, no window points).
- Full E2E suite green (24 specs) after the CategoryBand work.
- Copy honesty: "the dollar" → "gold" everywhere (hero, share, OG/Twitter/JSON-LD,
  noscript, og-image regenerated) — gold (GLD) is what's charted; no USD series exists.
- og:image:alt + twitter:image:alt describe the social card.
- topReactions aggregator (biggest cross-instrument single-day moves; ticker+day dedup;
  diverse mode keeps each ticker/day unique; VIX-excludable), TDD.
- "Biggest single-day reactions" 3-card lead-in to the Outro ledger (NDX/RTX/CL),
  memoized, tested, verified light/dark; E2E-guarded; documented in ARCHITECTURE + README.
- Tightened StatBand→CategoryBand vertical gap for a connected flow.
- Kinetic-typography hero title: per-glyph staggered rise (was a block reveal); layout
  preserved, aria-label keeps the name, reduced-motion safe; verified via screenshot.
- E2E guards the kinetic hero title is visible under reduced motion.
- CategoryBand bars reveal via GPU-friendly scaleX (was animating width).
- All motion is now GPU-friendly (transform/opacity only; verified); dropped redundant
  persistent will-change on the hero title glyphs.
- Measured WCAG contrast; documented in ACCESSIBILITY.md (body/muted pass AA; accents are
  AA-large with +/- sign redundancy — strict AA-normal on small colored text is a
  design-owner palette call, not auto-changed).
- Fixed React act() warnings in the copy-link tests (await the post-copy state update);
  clean verify output.
- Covered formatTime invalid-datetime guard (format.ts 100% lines).
- Covered spotlightTicker NDX mapping, pointPositions empty input, useInView options +
  null-ref branches; lib layer fully covered (stats/format/scales/useInView 100%);
  overall ~96% stmts / ~88% branches (remaining gaps: unreachable d3 fallbacks, SSR
  guards, and browser-API paths the E2E covers).
- useTheme localStorage SSR guard tested; hooks/lib at 100% lines.
- Light-theme accent text now meets WCAG AA (risk #cb2c1a 4.76, relief #117c42 4.67) with
  minimal brand change (warn non-text unchanged; dark theme already passed). Supersedes the
  earlier "design-owner call" deferral — colored % values are now AA-normal.
- E2E guard for the hover-scrub crosshair readout.

- Print stylesheet: readable light document on white (theme-independent), animations/grain
  off, non-paginating deep-dive hidden (ledger carries the data); verified print-media.

- apple-touch-icon (180×180 brand mark) for iOS home-screen bookmarks.
- Security response headers via vercel.json (nosniff, Referrer-Policy, X-Frame-Options,
  Permissions-Policy, HSTS; CSP omitted to avoid breaking inline theme script/fonts).
- format-detection=telephone=no (stops iOS auto-linking the page's numbers).
- Added og:url + og:site_name for correct social attribution.
- Article JSON-LD now has author + publisher (logo) for rich results.

## Next

1. Enable large image previews in search: the robots meta is "index, follow" but lacks
   max-image-preview:large (Google shows only a thumbnail without it — wasteful for a
   visual data piece with a strong OG image). Evidence: index.html (meta robots).
   Acceptance: robots content includes max-image-preview:large (and max-snippet:-1);
   verify gate green.