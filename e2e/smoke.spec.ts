import { test, expect } from '@playwright/test'

test('loads with the rescoped hero', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Truth & Ticker/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('TICKER')
  await expect(page.getByText(/The timing is the story/i)).toBeVisible()
})

test('instrument switcher re-plots the master timeline', async ({ page }) => {
  await page.goto('/')
  // `exact` avoids matching the many markers whose labels contain "oil".
  await page.getByRole('button', { name: 'Oil', exact: true }).click()
  await expect(page.getByText(/WTI Crude Oil/)).toBeVisible()
})

test('legend filter hides a category of markers', async ({ page }) => {
  await page.goto('/')
  const markers = page.getByTestId('marker')
  await expect(markers.first()).toBeVisible()
  const before = await markers.count()
  await page.getByRole('button', { name: /risk-off/i }).click()
  expect(await markers.count()).toBeLessThan(before)
})

test('a ledger row deep-links the event into the URL', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('summary-row').first().getByRole('button').click()
  await expect(page).toHaveURL(/#event-/)
})

test('a deep link opens the event on load', async ({ page }) => {
  await page.goto('/')
  // Capture a real event hash by activating a ledger row, then load it fresh.
  await page.getByTestId('summary-row').nth(2).getByRole('button').click()
  const url = page.url()
  expect(url).toMatch(/#event-/)
  await page.goto(url)
  await expect(page.getByTestId('detail')).toBeVisible()
})

test('clicking a featured marker jumps to its deep-dive', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-testid="marker"][aria-label*="open deep-dive"]').first().click()
  await expect(page.locator('.stage').first()).toBeInViewport()
})

test('theme toggle switches to dark and persists across reload', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  await expect(html).not.toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: /dark mode/i }).click()
  await expect(html).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(html).toHaveAttribute('data-theme', 'dark')
})

test('arrow keys step the timeline selection by keyboard', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('marker').first().focus()
  await page.keyboard.press('ArrowRight')
  // stepSelection moves focus to the newly selected marker.
  await expect(page.locator(':focus')).toHaveAttribute('aria-pressed', 'true')
})
