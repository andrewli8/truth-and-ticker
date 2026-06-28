import { test, expect } from '@playwright/test'

// Regression guards for fixes verified visually this cycle: the StatBand value clip
// (which manifested as horizontal overflow at ~1280px) and the >=24px touch targets.

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
    await expect(callout).toBeVisible()
    await expect(callout).toContainText('%')

    // The callout stays inside its chart figure's SVG.
    const svg = deepDive.locator('figure svg').first()
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
    // … and the master timeline selects exactly that marker.
    const selected = page.locator('[data-testid="marker"][aria-pressed="true"]')
    await expect(selected).toHaveCount(1)
    expect(await selected.getAttribute('aria-label')).toContain(summary)
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
