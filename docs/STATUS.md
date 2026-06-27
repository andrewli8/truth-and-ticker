# STATUS

Continuous looptight-gated improvement loop. Each task: implement → `npm run verify`
(tsc + vitest + build) green → commit. Generate more when this list empties.

## Now
Building toward: light-default theme with optional dark mode, viral/shareable
design, and bulletproof responsiveness.

## Next

1. Theme system — light default + optional dark.
   Evidence: src/styles/global.css (palette is dark-only in :root)
   Acceptance: :root defaults to light palette; `[data-theme=dark]` overrides; a
   persisted toggle defaults to light; no flash of wrong theme on load.

2. Theme-aware accents — drive chart/tag colors from CSS variables.
   Evidence: src/App.tsx (ACCENT hardcodes hex); src/components/MarketChart.tsx
   Acceptance: chart line/dot/labels and card tags read from CSS vars so they
   recolor correctly in both themes; verify green.

3. Social virality — OG + Twitter card meta + share button.
   Evidence: index.html (no og:/twitter: tags); no share affordance
   Acceptance: index.html has og/twitter meta; a Share control copies the URL
   and offers a tweet intent; component test passes.

4. Viral hook — a screenshot-worthy headline stat.
   Evidence: src/components/Hero.tsx (no punch stat)
   Acceptance: a kinetic standout stat (e.g., oil's 36-hour swing) renders from
   the dataset, computed not hardcoded; test covers the computation.

5. Responsiveness hardening — tablet breakpoint + mobile ticker scroll.
   Evidence: src/components/TickerRail.module.css (clipped on mobile);
   src/styles/app.css (only 768px breakpoint)
   Acceptance: ticker rail scrolls/marquees on mobile; tablet (768–1100px) has a
   dedicated layout; no horizontal overflow at 320/390/768/1280.

6. A11y & motion polish — focus states, aria, reduced-motion audit.
   Evidence: interactive controls lack visible focus styles
   Acceptance: keyboard-focusable controls show focus rings; reduced-motion path
   verified; verify green.
