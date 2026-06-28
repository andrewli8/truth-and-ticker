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
