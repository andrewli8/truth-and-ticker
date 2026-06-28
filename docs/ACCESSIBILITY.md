# Accessibility

The piece is a client-rendered interactive data story; these are the accessibility
guarantees it ships with and how they're implemented.

## Keyboard

- **Skip link** to `#main-content` is the first focusable element (`src/App.tsx`).
- The master-timeline markers are `role="button"`, `tabIndex=0`, and step with the
  arrow keys (←/→/↑/↓), moving focus along the visible (legend-filtered) set.
- The deep-dive "Jump to announcement" dot-nav and the ledger "View on the timeline"
  rows are real buttons, reachable and operable by keyboard.
- All controls show a visible `:focus-visible` outline (`src/styles/global.css`).

## Screen readers

- The overview and deep-dive charts expose data-rich accessible names
  (`timelineAriaLabel` / `chartAriaLabel` in `src/lib/stats.ts`), so the chart is
  summarised rather than announced as an opaque image.
- The selected-event detail is an `aria-live="polite"` region, so changing the event
  is announced.
- Decorative SVG (hero backdrop, marquee duplicate, quote glyph) is `aria-hidden`.
- External links carry an "(opens in new tab)" suffix in their accessible name.
- Ticker symbols use `translate="no"` so machine translation leaves them intact.

## Motion

- A global `prefers-reduced-motion: reduce` guard (`src/styles/global.css`) collapses
  animations/transitions and disables scroll-snap; GSAP entrance effects and the
  count-up are individually short-circuited under reduced motion as well.
- Interactive hover/press motion uses a shared `--ease` token; reveals are transform/
  opacity only.

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
- The semantic accents used for coloured ± values — risk 4.35:1, relief 3.91:1,
  warn 3.26:1 — meet AA Large (≥3:1) and so clear the big StatBand numbers; the small
  reaction values fall just short of AA Normal. **Direction is never conveyed by colour
  alone** — the `+`/`−` sign and the number carry it (WCAG 1.4.1 met), so the colour is
  reinforcing, not load-bearing. Bringing the small coloured values to strict AA Normal
  would mean slightly darker accent tokens — a brand/design-owner decision, deliberately
  not changed automatically.

## No-JS

A `<noscript>` block (`index.html`) shows the headline, thesis, and a prompt to enable
JavaScript, so the page is never blank without scripting.
