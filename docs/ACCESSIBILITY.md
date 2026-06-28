# Accessibility

The piece is a client-rendered interactive data story; these are the accessibility
guarantees it ships with and how they're implemented.

## Keyboard

- **Skip link** to `#main-content` is the first focusable element (`src/App.tsx`).
- The master-timeline markers are `role="button"`, `tabIndex=0`, and step with the
  arrow keys (←/→/↑/↓), moving focus along the visible (legend-filtered) set.
- The deep-dive "Jump to announcement" dot-nav and the ledger "View on the timeline"
  rows are real buttons, reachable and operable by keyboard.
- The one-screen POC (`/poc.html`, `src/poc/PocApp.tsx`) chart is a focusable
  `role="slider"` (`tabIndex=0`, with `aria-valuemin`/`max`/`now`/`valuetext`): the
  arrow keys step post-by-post (←/↓ back, →/↑ forward) and Home/End jump to the first/
  last announcement, so the scrub interaction isn't pointer-only. It shows a visible
  `:focus-visible` outline and its on-screen hint names the arrow-key affordance.
- All controls show a visible `:focus-visible` outline (`src/styles/global.css`).

## Screen readers

- The overview and deep-dive charts expose data-rich accessible names
  (`timelineAriaLabel` / `chartAriaLabel` in `src/lib/stats.ts`, the latter naming the event
  reaction), so the chart is summarised rather than announced as an opaque image.
- The selected-event detail is an `aria-live="polite"` region, so changing the event
  is announced (with its reaction and cross-instrument moves).
- Decorative SVG (hero backdrop, marquee duplicate, quote glyph) is `aria-hidden`, as are the
  on-chart visual echoes of data carried in text elsewhere — the reaction labels
  (`ChartReactionLabel`), the price-axis labels, and the drawdown marker — to avoid
  double-announcing the accessible name / term-stat / detail.
- External links carry an "(opens in new tab)" suffix in their accessible name.
- Ticker symbols use `translate="no"` so machine translation leaves them intact.

## Motion

- A global `prefers-reduced-motion: reduce` guard (`src/styles/global.css`) collapses
  animations/transitions and disables scroll-snap; GSAP entrance effects and the
  count-up are individually short-circuited under reduced motion as well.
- Interactive hover/press motion uses a shared `--ease` token; reveals are transform/
  opacity only.
- The POC's GSAP entrance (line draw-on, masked title, count-up readout, lerp-follow
  cursor) is fully gated on reduced motion — the `useGSAP` blocks short-circuit, so the
  scene renders complete and static, and the follow cursor is suppressed
  (`src/poc/PocApp.tsx`, `src/poc/poc.css`). An E2E case (`e2e/poc.spec.ts`) locks that
  the reduced-motion scene is visible on load without interaction.

## Target size (WCAG 2.2 SC 2.5.8)

All interactive controls meet the 24×24px minimum:

- Instrument switcher / legend chips: ~36px on mobile, comfortable on desktop.
- Copy-link, citation links: ≥24px via vertical padding.
- Dot-nav: a 24px hit target with the 11px visual dot drawn via `::before`.

The **chart markers** render smaller than 24px (and scale down further on mobile).
They rely on SC 2.5.8's **Equivalent exception**: every event a marker selects is also
selectable from the Outro ledger's "View on the timeline" row buttons, which are
full-width (well over 24px). The ledger is therefore the intended touch path on small
screens; the markers remain a precise pointer/keyboard affordance on larger ones.

## Colour & contrast

Measured WCAG contrast on the light background (dark theme is comparable):

- Body text 16:1, muted text 5.8:1 — pass AA for normal text (≥4.5:1).
- The semantic accents used for coloured ± values were nudged to meet **AA Normal**
  (≥4.5:1) on the light background: risk #cb2c1a (4.76:1), relief #117c42 (4.67:1) — still
  vivid red/green. `warn` (#b5790a, 3.26:1) is used only as a non-text accent (legend dot,
  marker, spine), which needs the 3:1 graphical-object threshold (SC 1.4.11), which it
  meets. The dark theme's brighter accents pass comfortably (6–11:1). Direction is also
  never conveyed by colour alone — the `+`/`−` sign and the number carry it (SC 1.4.1).
- **Forced colors / Windows High Contrast**: the SVG charts survive natively (strokes and
  marker fills map to system colours), and the CSS-background surfaces that don't
  (CategoryBand bars, ReactionSpread dots, and the POC's line/readout/text) ship
  `@media (forced-colors: active)` fallbacks pinning them to `CanvasText`/`Canvas`.

## No-JS

A `<noscript>` block (`index.html`) shows the headline, thesis, and a prompt to enable
JavaScript, so the page is never blank without scripting.

## Print

A print stylesheet (`src/styles/global.css`) renders a readable light document on white,
disables animations/grain, and drops the non-paginating pinned deep-dive (the Outro ledger
below carries every event's data). Scroll-into-view reveals don't fire for print, so each
reveal-gated surface has a print fallback — the Outro ledger, the CategoryBand bars, and the
ReactionSpread dots force visible, the hero entrance settles, and the StatBand count-ups snap
to their real values on `beforeprint` (so they never print as `+0.00%`). The interactive
ThemeToggle is hidden. An E2E guard asserts the ledger + stats print without scrolling.
