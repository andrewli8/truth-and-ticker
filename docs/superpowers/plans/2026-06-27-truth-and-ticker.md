# TRUTH & TICKER Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: this plan is driven by the **looptight** test-gated loop. Each task ends with a green test gate (`npm run verify`) and a commit. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, scroll-driven cinematic visualization correlating Trump's June 2025 Israel–Iran war announcements with S&P/Dow/oil/sector market moves.

**Architecture:** Vite + React + TypeScript SPA. Curated static JSON data (announcements + market series). Pure, tested correlation/format/scale libs feed a hand-rolled SVG chart. Lenis smooth scroll + GSAP ScrollTrigger pin the chart and drive a scroll-progress value (0–1) distributed to presentational components. Immutable data flow throughout.

**Tech Stack:** Vite, React 18, TypeScript, Vitest, GSAP + @gsap/react, Lenis, D3 (d3-scale, d3-shape) for math only.

## Global Constraints

- Node 22; package manager npm.
- `npm run verify` = `tsc --noEmit && vitest run && vite build` — the looptight gate.
- Immutability: never mutate inputs; all lib functions return new objects.
- No runtime network/API calls; all data is static JSON committed to the repo.
- Framing: timing-correlation only; every announcement carries a citation. No named-actor accusations in copy.
- Honor `prefers-reduced-motion`; target 60fps.
- Files focused & small (<400 lines); one responsibility each.
- Palette tokens: bg `#0a0a0b`, text `#ece8e1`, risk accent `#ff4d3d`, relief `#3ddc84`, steel grid `#2a2a2e`.

---

### Task 1: Project scaffold + verify gate

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/global.css`
- Test: `src/lib/__tests__/smoke.test.ts`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run test`, `npm run verify` scripts.

- [ ] **Step 1:** Init Vite React-TS app and install deps.
```bash
npm create vite@latest . -- --template react-ts   # if dir non-empty, scaffold manually
npm i gsap @gsap/react lenis d3-scale d3-shape
npm i -D vitest @types/d3-scale @types/d3-shape jsdom @testing-library/react @testing-library/jest-dom
```
- [ ] **Step 2:** Add scripts to `package.json`:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "test": "vitest run",
  "verify": "tsc --noEmit && vitest run && vite build"
}
```
- [ ] **Step 3:** `vitest.config.ts` with `environment: 'jsdom'`, globals true.
- [ ] **Step 4:** Write smoke test:
```ts
import { describe, it, expect } from 'vitest'
describe('smoke', () => { it('runs', () => { expect(1 + 1).toBe(2) }) })
```
- [ ] **Step 5:** Run `npm run verify`. Expected: PASS (tsc clean, 1 test passes, build emits dist).
- [ ] **Step 6:** Commit: `chore: scaffold vite react-ts app with verify gate`.

---

### Task 2: Formatting utilities (`src/lib/format.ts`)

**Files:**
- Create: `src/lib/format.ts`
- Test: `src/lib/__tests__/format.test.ts`

**Interfaces:**
- Produces:
  - `formatPct(n: number): string` — signed, 2dp, e.g. `+1.34%`, `-0.50%`; `'n/a'` for null/NaN.
  - `formatPrice(n: number): string` — thousands grouped, 2dp.
  - `formatTime(iso: string): string` — `Jun 21, 9:48 PM ET`.

- [ ] **Step 1:** Write failing tests:
```ts
import { describe, it, expect } from 'vitest'
import { formatPct, formatPrice, formatTime } from '../format'
describe('formatPct', () => {
  it('signs positive', () => expect(formatPct(1.337)).toBe('+1.34%'))
  it('signs negative', () => expect(formatPct(-0.5)).toBe('-0.50%'))
  it('handles NaN', () => expect(formatPct(NaN)).toBe('n/a'))
})
describe('formatPrice', () => {
  it('groups', () => expect(formatPrice(5432.1)).toBe('5,432.10'))
})
describe('formatTime', () => {
  it('formats ET', () => expect(formatTime('2025-06-21T21:48:00-04:00')).toMatch(/Jun 21/))
})
```
- [ ] **Step 2:** Run tests → FAIL (module missing).
- [ ] **Step 3:** Implement `format.ts` (pure functions; use `Intl.NumberFormat`; treat null/NaN → `'n/a'`).
- [ ] **Step 4:** Run tests → PASS.
- [ ] **Step 5:** Commit: `feat: add formatting utilities`.

---

### Task 3: Correlation types + logic (`src/lib/correlate.ts`)

**Files:**
- Create: `src/lib/types.ts`, `src/lib/correlate.ts`
- Test: `src/lib/__tests__/correlate.test.ts`

**Interfaces:**
- Produces (`types.ts`):
```ts
export type AnnType = 'strike' | 'threat' | 'ceasefire' | 'market-jawbone'
export interface Announcement { id: string; datetime: string; source: string; quote: string; summary: string; type: AnnType; citationUrl: string; citationLabel: string }
export type Category = 'index' | 'oil' | 'defense' | 'energy' | 'safe-haven'
export interface Point { datetime: string; price: number; pctFromPrevClose: number }
export interface Series { ticker: string; name: string; category: Category; points: Point[] }
export interface Reaction { announcementId: string; ticker: string; deltaPct: number | null; fromPrice: number | null; toPrice: number | null; windowMins: number }
export interface CorrelatedEvent { announcement: Announcement; reactions: Reaction[] }
```
- Produces (`correlate.ts`):
  - `reactionFor(a: Announcement, s: Series, windowMins: number): Reaction`
  - `correlateAll(anns: Announcement[], markets: Series[], windowMins: number): CorrelatedEvent[]`

- [ ] **Step 1:** Write failing tests covering: delta computed across window, missing data → `deltaPct: null`, immutability (inputs unchanged), ordering preserved.
```ts
import { describe, it, expect } from 'vitest'
import { reactionFor, correlateAll } from '../correlate'
import type { Announcement, Series } from '../types'
const a: Announcement = { id:'x', datetime:'2025-06-24T09:00:00-04:00', source:'Truth Social', quote:'q', summary:'s', type:'ceasefire', citationUrl:'u', citationLabel:'l' }
const s: Series = { ticker:'SPX', name:'S&P 500', category:'index', points:[
  { datetime:'2025-06-24T09:00:00-04:00', price:100, pctFromPrevClose:0 },
  { datetime:'2025-06-24T10:00:00-04:00', price:102, pctFromPrevClose:2 },
]}
it('computes delta over window', () => { expect(reactionFor(a,s,60).deltaPct).toBeCloseTo(2) })
it('null on missing', () => { expect(reactionFor(a,{...s,points:[]},60).deltaPct).toBeNull() })
it('does not mutate', () => { const before=JSON.stringify(s); reactionFor(a,s,60); expect(JSON.stringify(s)).toBe(before) })
it('correlateAll maps each ann', () => { expect(correlateAll([a],[s],60)).toHaveLength(1) })
```
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement: find point at/just-after announcement time (`from`), point at/just-after `time+window` (`to`); `deltaPct = (to-from)/from*100`; null when either missing. Pure.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: add correlation types and logic`.

---

### Task 4: Curated, verified dataset + integrity tests

**Files:**
- Create: `src/data/announcements.json`, `src/data/markets.json`, `src/data/index.ts`
- Test: `src/data/__tests__/data.test.ts`

**Interfaces:**
- Consumes: `types.ts`, `correlate.ts`.
- Produces (`index.ts`): typed exports `announcements: Announcement[]`, `markets: Series[]`.

- [ ] **Step 1:** Research & record (WebSearch) verified facts: exact dates/times of each announcement in the event spine, the verbatim short quote, and S&P 500 / Dow / WTI crude / Lockheed (LMT) / RTX / Exxon (XOM) / Gold moves around each. Capture citation URLs. Tickers tracked: `SPX`, `DJI`, `CL` (WTI), `LMT`, `RTX`, `XOM`, `GLD`, plus `VIX`.
- [ ] **Step 2:** Write `data.test.ts` integrity suite FIRST:
```ts
import { describe, it, expect } from 'vitest'
import { announcements, markets } from '../index'
import { correlateAll } from '../../lib/correlate'
it('has announcements', () => expect(announcements.length).toBeGreaterThanOrEqual(6))
it('timestamps strictly increasing', () => {
  const t = announcements.map(a => Date.parse(a.datetime))
  expect(t).toEqual([...t].sort((x,y)=>x-y)); expect(new Set(t).size).toBe(t.length)
})
it('every announcement cited', () => announcements.forEach(a => { expect(a.citationUrl).toMatch(/^https?:/); expect(a.citationLabel.length).toBeGreaterThan(0) }))
it('no NaN prices', () => markets.forEach(m => m.points.forEach(p => expect(Number.isFinite(p.price)).toBe(true))))
it('every announcement resolves >=1 reaction', () => {
  correlateAll(announcements, markets, 120).forEach(e =>
    expect(e.reactions.some(r => r.deltaPct !== null)).toBe(true))
})
it('tracks index + oil + defense', () => {
  const cats = new Set(markets.map(m => m.category))
  ;['index','oil','defense'].forEach(c => expect(cats.has(c as any)).toBe(true))
})
```
- [ ] **Step 3:** Author `announcements.json` and `markets.json` from the researched data so the integrity suite passes. Each market series carries points spanning each event's window (open/announcement/+window) at minute or hourly granularity sufficient for the chart.
- [ ] **Step 4:** `index.ts` imports the JSON with `import ann from './announcements.json'` typed via `as Announcement[]` (enable `resolveJsonModule`).
- [ ] **Step 5:** Run `npm run verify` → PASS.
- [ ] **Step 6:** Commit: `feat: add verified curated dataset with integrity tests`.

---

### Task 5: Scale helpers (`src/lib/scales.ts`)

**Files:**
- Create: `src/lib/scales.ts`
- Test: `src/lib/__tests__/scales.test.ts`

**Interfaces:**
- Produces:
  - `buildLinePath(points: Point[], width: number, height: number, progress: number): string` — SVG path `d` for the visible fraction (`progress` 0–1) of the series, y-scaled to min/max price, x-scaled to time, padded.
  - `domainFor(points: Point[]): { min: number; max: number }`

- [ ] **Step 1:** Write failing tests: path starts with `M`, empty points → `''`, progress 0 → at most first point, progress 1 → spans full width (last x ≈ width − pad).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement with `scaleLinear`/`scaleTime` from d3-scale + `line()` from d3-shape; slice points by `Math.ceil(progress * n)`.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: add svg scale/path helpers`.

---

### Task 6: MarketChart component (`src/components/MarketChart.tsx`)

**Files:**
- Create: `src/components/MarketChart.tsx`, `src/components/MarketChart.module.css`
- Test: `src/components/__tests__/MarketChart.test.tsx`

**Interfaces:**
- Consumes: `buildLinePath`, `domainFor`, `Series`.
- Props: `{ series: Series; progress: number; accent: string; activeAnnId?: string }`.
- Produces: renders `<svg>` with a `<path data-testid="line">`, gridlines, and current-price label.

- [ ] **Step 1:** Write failing RTL test: renders an svg path given a series + progress; path `d` non-empty at progress 1.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement pure SVG renderer using scale helpers; no internal animation state (progress is a prop). Use `viewBox`, responsive via CSS.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: add MarketChart svg renderer`.

---

### Task 7: ScrollStage — Lenis + GSAP pin & progress (`src/components/ScrollStage.tsx`)

**Files:**
- Create: `src/components/ScrollStage.tsx`, `src/lib/useReducedMotion.ts`
- Test: `src/lib/__tests__/useReducedMotion.test.ts`

**Interfaces:**
- Consumes: `useReducedMotion`.
- Props: `{ steps: number; children: (progress: number, step: number) => React.ReactNode }`.
- Produces: pins a full-height section, drives `progress` 0–1 across `steps` via ScrollTrigger; falls back to native scroll + no-pin when reduced motion.

- [ ] **Step 1:** Write failing test for `useReducedMotion` (mocks `matchMedia`, returns boolean).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement `useReducedMotion`; then `ScrollStage` using `useGSAP` + Lenis (init Lenis once, `ScrollTrigger` with `pin`, `scrub`, `end: '+=' + steps*100 + '%'`, `onUpdate` → setState progress). Guard all animation behind reduced-motion.
- [ ] **Step 4:** Run → PASS (hook test; component is integration-verified in build).
- [ ] **Step 5:** Commit: `feat: add scroll stage with lenis + gsap pinning`.

---

### Task 8: AnnouncementCard (`src/components/AnnouncementCard.tsx`)

**Files:**
- Create: `src/components/AnnouncementCard.tsx`, `.module.css`
- Test: `src/components/__tests__/AnnouncementCard.test.tsx`

**Interfaces:**
- Consumes: `CorrelatedEvent`, `formatPct`, `formatTime`.
- Props: `{ event: CorrelatedEvent; primaryTicker: string }`.
- Produces: quote, timestamp, type tag, delta badge (colored by sign), citation link.

- [ ] **Step 1:** Write failing test: renders quote text + a delta badge with `+`/`-` class + citation `<a href>`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement; badge color uses risk/relief tokens by sign.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit: `feat: add announcement card`.

---

### Task 9: TickerRail (`src/components/TickerRail.tsx`)

**Files:**
- Create: `src/components/TickerRail.tsx`, `.module.css`
- Test: `src/components/__tests__/TickerRail.test.tsx`

**Interfaces:**
- Consumes: `Series[]`, `formatPct`.
- Props: `{ markets: Series[]; progress: number }`.
- Produces: horizontal flickering tape of tickers with current pct; reduced-motion disables flicker.

- [ ] **Step 1:** Write failing test: renders one chip per market with ticker symbol present.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** PASS. **Step 5:** Commit `feat: add ticker rail`.

---

### Task 10: Hero + Outro (`src/components/Hero.tsx`, `src/components/Outro.tsx`)

**Files:**
- Create: `Hero.tsx`+css, `Outro.tsx`+css
- Test: `src/components/__tests__/Outro.test.tsx`

**Interfaces:**
- `Hero` props: none (static thesis + kinetic title).
- `Outro` props: `{ events: CorrelatedEvent[]; primaryTicker: string }` — renders summary table (date, event, delta) + methodology/citation note.

- [ ] **Step 1:** Write failing test: `Outro` renders a table row per event.
- [ ] **Step 2:** FAIL → **Step 3:** Implement both → **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat: add hero and outro`.

---

### Task 11: App composition + design system (`src/App.tsx`, `src/styles/global.css`)

**Files:**
- Modify: `src/App.tsx`, `src/styles/global.css`
- Test: `src/components/__tests__/App.test.tsx`

**Interfaces:**
- Consumes: all components + `correlateAll(announcements, markets, 120)`.
- Produces: full page — Hero → ScrollStage(MarketChart + AnnouncementCard per step + TickerRail) → Outro.

- [ ] **Step 1:** Write failing test: App renders Hero thesis text + Outro table without throwing.
- [ ] **Step 2:** FAIL → **Step 3:** Implement composition; apply palette tokens, fonts (`@fontsource` or Google Fonts via index.html), grain/scanline overlay, typography scale.
- [ ] **Step 4:** PASS → `npm run verify` PASS.
- [ ] **Step 5:** Commit `feat: compose app and apply design system`.

---

### Task 12: Responsive + reduced-motion + polish pass

**Files:**
- Modify: component CSS modules, `global.css`
- Test: existing suite must stay green.

- [ ] **Step 1:** Add mobile breakpoints: ScrollStage degrades to stacked cards (no pin) under 768px; chart per event.
- [ ] **Step 2:** Verify reduced-motion path disables Lenis/scrub/flicker.
- [ ] **Step 3:** Visual QA via webapp-testing (Playwright screenshots desktop + mobile), iterate on spacing/contrast/motion.
- [ ] **Step 4:** `npm run verify` PASS.
- [ ] **Step 5:** Commit `feat: responsive + reduced-motion polish`.

---

## Self-Review

- **Spec coverage:** purpose→Task 11; data sourcing→Task 4; correlation→Task 3; chart/animation→Tasks 5–7; design language→Tasks 11–12; responsive/reduced-motion→Task 12; testing/looptight gate→every task + Global Constraints. ✓
- **Placeholder scan:** data values are intentionally researched in Task 4 (sourced facts, not inventable); all code steps show code or exact interfaces. ✓
- **Type consistency:** `Announcement`/`Series`/`Reaction`/`CorrelatedEvent` defined in Task 3 and used verbatim in Tasks 4,6,8,10,11; `buildLinePath`/`domainFor` defined Task 5, used Task 6. ✓
