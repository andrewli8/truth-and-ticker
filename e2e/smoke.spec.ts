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
