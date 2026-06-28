import { test, expect } from '@playwright/test'

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('content is fully visible with motion disabled', async ({ page }) => {
    await page.goto('/')
    // The kinetic per-glyph title must not be stranded hidden when GSAP is skipped.
    await expect(page.getByRole('heading', { level: 1, name: 'Truth & Ticker' })).toBeVisible()
    await expect(page.getByText(/The timing is the story/i)).toBeVisible()
    // The timeline line must not be stranded hidden by the draw-on reveal.
    await expect(page.locator('path[data-line]')).toBeVisible()
    // The Outro reveal-on-scroll still shows its rows.
    const firstRow = page.getByTestId('summary-row').first()
    await firstRow.scrollIntoViewIfNeeded()
    await expect(firstRow).toBeVisible()
  })
})

test.describe('mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('no horizontal overflow; deep-dive and timeline render', async ({ page }) => {
    await page.goto('/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(overflow).toBe(false)
    await expect(page.locator('path[data-line]')).toBeVisible()
    // Markers render on the stacked mobile layout too.
    await expect(page.getByTestId('marker').first()).toBeVisible()
  })
})
