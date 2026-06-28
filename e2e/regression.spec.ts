import { test, expect } from '@playwright/test'

// Real-browser regression guards for behaviour jsdom can't verify (layout, scroll, theme):
// StatBand fit / no horizontal overflow, CategoryBand reveal + re-title, timeline scrub,
// the on-chart reaction labels (in-bounds, no clipping), dark theme (toggle + OS-preference),
// the ledger→timeline jump, the Outro highlights, and WCAG 2.2 target sizes.
// (Instrument switch + compare overlay live in smoke.spec.ts.)

test.describe('layout fit', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('no horizontal overflow at 1280 (StatBand 3-digit value fits)', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel(/Key market swings/i).scrollIntoViewIfNeeded()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)
  })
})

test.describe('category band', () => {
  test('renders the "which posts moved the S&P" bars after scroll-in', async ({ page }) => {
    await page.goto('/')
    const band = page.getByRole('region', { name: /Average S&P 500 reaction by announcement type/i })
    await band.scrollIntoViewIfNeeded()
    await expect(band).toBeVisible()
    await expect(band.getByText('Tariff')).toBeVisible()
    // After the reveal, the widest bar has grown to a non-trivial width.
    await expect.poll(async () => {
      const w = await band.locator('span[class*="bar"]').first().evaluate((el) => el.getBoundingClientRect().width)
      return w
    }, { timeout: 3000 }).toBeGreaterThan(50)
  })

  test('re-titles when the timeline instrument changes', async ({ page }) => {
    await page.goto('/')
    const band = page.getByRole('region', { name: /reaction by announcement type/i })
    await band.scrollIntoViewIfNeeded()
    await expect(band.getByRole('heading')).toContainText(/S&P 500/i)
    // Switch the instrument on the timeline (below the band).
    const instruments = page.getByRole('group', { name: /Choose or compare the instrument/i })
    await instruments.scrollIntoViewIfNeeded()
    await instruments.getByRole('button', { name: 'Oil', exact: true }).click()
    // The band (above) recomputes for the new instrument.
    await band.scrollIntoViewIfNeeded()
    await expect(band.getByRole('heading')).toContainText(/Oil/i)
  })
})

test.describe('timeline scrub', () => {
  test('hovering the chart shows the crosshair readout', async ({ page }) => {
    await page.goto('/')
    // The master-timeline chart SVG carries the event markers and the pointer handlers.
    const chart = page.locator('svg:has([data-testid="marker"])').first()
    await chart.scrollIntoViewIfNeeded()
    await expect(page.getByTestId('scrub')).toHaveCount(0) // hidden until hover
    await chart.hover({ position: { x: 400, y: 180 } })
    await expect(page.getByTestId('scrub')).toBeVisible()
  })
})

test.describe('on-chart reaction labels', () => {
  test('the selected marker labels its reaction within the overview chart', async ({ page }) => {
    await page.goto('/')
    const chart = page.locator('svg:has([data-testid="marker"])').first()
    await chart.scrollIntoViewIfNeeded()
    const label = page.getByTestId('marker-reaction')
    await expect(label).toBeVisible()
    await expect(label).toContainText('%')

    // The label must sit inside the chart SVG (no clipping past its edges).
    const svgBox = await chart.boundingBox()
    const labelBox = await label.boundingBox()
    expect(svgBox).not.toBeNull()
    expect(labelBox).not.toBeNull()
    expect(labelBox!.x).toBeGreaterThanOrEqual(svgBox!.x - 1)
    expect(labelBox!.x + labelBox!.width).toBeLessThanOrEqual(svgBox!.x + svgBox!.width + 1)
    expect(labelBox!.y).toBeGreaterThanOrEqual(svgBox!.y - 1)
    expect(labelBox!.y + labelBox!.height).toBeLessThanOrEqual(svgBox!.y + svgBox!.height + 1)
  })

  test('the deep-dive chart labels the move at the playhead', async ({ page }) => {
    await page.goto('/')
    const deepDive = page.getByRole('region', { name: 'Event-by-event deep dive' })
    await deepDive.scrollIntoViewIfNeeded()
    const callout = page.getByTestId('reaction-callout').first()
    // The deep-dive is a sticky scrolly whose chart measures its size on layout; give it
    // headroom to render under parallel load before reading geometry.
    await expect(callout).toBeVisible({ timeout: 15_000 })
    await expect(callout).toContainText('%')

    // The callout stays inside its chart figure's SVG.
    const svg = deepDive.locator('figure svg').first()
    await expect(svg).toBeVisible()
    const svgBox = await svg.boundingBox()
    const calloutBox = await callout.boundingBox()
    expect(svgBox).not.toBeNull()
    expect(calloutBox).not.toBeNull()
    expect(calloutBox!.x).toBeGreaterThanOrEqual(svgBox!.x - 1)
    expect(calloutBox!.x + calloutBox!.width).toBeLessThanOrEqual(svgBox!.x + svgBox!.width + 1)
  })
})

test.describe('dark theme', () => {
  test('toggles to dark mode and keeps the chart label visible without overflow', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /switch to dark mode/i }).click()
    await expect(page.locator('html[data-theme="dark"]')).toHaveCount(1)

    // The on-chart reaction label survives the theme switch (dark halo + accent).
    const chart = page.locator('svg:has([data-testid="marker"])').first()
    await chart.scrollIntoViewIfNeeded()
    await expect(page.getByTestId('marker-reaction')).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)
  })

  test('honors the OS dark preference on first visit (no stored choice)', async ({ browser }) => {
    // Fresh context with emulated OS dark and no stored theme — the inline pre-paint
    // script should apply data-theme="dark" before React hydrates.
    const ctx = await browser.newContext({ colorScheme: 'dark' })
    const page = await ctx.newPage()
    await page.goto('/')
    await expect(page.locator('html[data-theme="dark"]')).toHaveCount(1)
    await ctx.close()
  })
})

test.describe('outro highlights', () => {
  test('renders the "biggest single-day reactions" cards', async ({ page }) => {
    await page.goto('/')
    const hl = page.getByRole('list', { name: /Biggest single-day market reactions/i })
    await hl.scrollIntoViewIfNeeded()
    await expect(hl).toBeVisible()
    const cards = hl.locator('li')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
    expect(count).toBeLessThanOrEqual(3)
    await expect(hl).toContainText('%')
  })

  test('a highlight card jumps to that event on the timeline', async ({ page }) => {
    await page.goto('/')
    const hl = page.getByRole('list', { name: /Biggest single-day market reactions/i })
    await hl.scrollIntoViewIfNeeded()
    await hl.getByRole('button').first().click()
    await expect(page).toHaveURL(/#event-/)
  })
})

// Note: the compare overlay and instrument switch are covered in smoke.spec.ts
// ("compare overlay adds a benchmark line…" / "instrument switcher re-plots…").

test.describe('print rendering', () => {
  test('prints the ledger + real stat values without scrolling, and hides the deep-dive', async ({ page }) => {
    await page.emulateMedia({ media: 'print' })
    await page.goto('/')
    // StatBand snaps its count-ups on beforeprint (emulateMedia doesn't fire it).
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')))

    // Reveal-gated content must print even though it was never scrolled into view.
    await expect(page.getByRole('table')).toBeVisible() // the Outro ledger
    await expect(page.getByTestId('spread-dot').first()).toBeVisible()
    const statband = page.getByRole('region', { name: /Key market swings/i })
    expect(await statband.textContent()).toMatch(/-\d\d\.\d+%/) // real WTI swing, not +0.00%

    // The pinned scrolly is omitted from print (the ledger carries the data).
    await expect(page.getByRole('region', { name: 'Event-by-event deep dive' })).toBeHidden()
  })
})

test.describe('reaction distribution', () => {
  test('plots the spread of reactions as dots on a zero-centered axis', async ({ page }) => {
    await page.goto('/')
    const band = page.getByRole('region', { name: /Distribution of .* reactions/i })
    await band.scrollIntoViewIfNeeded()
    await expect(band).toBeVisible()
    await expect(band.getByTestId('spread-dot').first()).toBeVisible()
    expect(await band.getByTestId('spread-dot').count()).toBeGreaterThan(10)
  })
})

test.describe('timeline annotations', () => {
  test('renders the y-axis price labels, drawdown marker, and cross-instrument strip', async ({ page }) => {
    await page.goto('/')
    const chart = page.locator('svg:has([data-testid="marker"])').first()
    await chart.scrollIntoViewIfNeeded()

    // Y-axis price reference (faint level labels).
    await expect(page.getByTestId('price-grid').first()).toBeVisible()
    // Deepest-drawdown trough marker with its negative percentage.
    const drawdown = page.getByTestId('drawdown-marker')
    await expect(drawdown).toBeVisible()
    await expect(drawdown).toContainText('%')
    // The selected event's detail lists other instruments' moves.
    const strip = page.getByRole('list', { name: /other instruments/i })
    await expect(strip).toBeVisible()
    await expect(strip).toContainText('%')
  })
})

test.describe('ledger → timeline jump', () => {
  test('a ledger row selects that event on the master timeline', async ({ page }) => {
    await page.goto('/')
    const row = page.locator('button[aria-label^="View on the timeline"]').first()
    await row.scrollIntoViewIfNeeded()
    const rowLabel = await row.getAttribute('aria-label')
    const summary = (rowLabel ?? '').replace('View on the timeline: ', '')
    expect(summary.length).toBeGreaterThan(0)

    await row.click()

    // The jump deep-links the event (URL hash) …
    await expect(page).toHaveURL(/#event-/)
    // … and the master timeline selects that marker. Poll the selected marker's label so
    // we wait past the default selection until the hashchange re-selection lands (the
    // default last marker is aria-pressed before the click takes effect).
    await expect
      .poll(async () =>
        page.locator('[data-testid="marker"][aria-pressed="true"]').getAttribute('aria-label'),
      )
      .toContain(summary)
  })
})

test.describe('target sizes (WCAG 2.2 SC 2.5.8)', () => {
  test('instrument chips and dot-nav meet the 24px minimum', async ({ page }) => {
    await page.goto('/')

    const instruments = page.getByRole('group', { name: /Choose or compare the instrument/i })
    await instruments.scrollIntoViewIfNeeded()
    const chip = await instruments.getByRole('button', { name: 'Oil', exact: true }).boundingBox()
    expect(chip).not.toBeNull()
    expect(chip!.height).toBeGreaterThanOrEqual(24)

    const deepDive = page.getByRole('region', { name: 'Event-by-event deep dive' })
    await deepDive.scrollIntoViewIfNeeded()
    const dot = await page
      .getByRole('navigation', { name: /Jump to announcement/i })
      .getByRole('button')
      .first()
      .boundingBox()
    expect(dot).not.toBeNull()
    expect(dot!.width).toBeGreaterThanOrEqual(24)
    expect(dot!.height).toBeGreaterThanOrEqual(24)
  })
})
