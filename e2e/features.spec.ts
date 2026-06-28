import { test, expect } from '@playwright/test'

test('copy-link writes the event deep-link to the clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')
  // Select an event so the detail (with Copy link) reflects it.
  await page.getByTestId('summary-row').first().getByRole('button').click()
  await page.getByRole('button', { name: /copy link/i }).click()
  await expect(page.getByRole('button', { name: /link copied/i })).toBeVisible()
  const clip = await page.evaluate(() => navigator.clipboard.readText())
  expect(clip).toMatch(/#event-/)
})

test('scrubbing the timeline shows a live date/price readout', async ({ page }) => {
  await page.goto('/')
  const svg = page.locator('section[aria-label*="market timeline"] svg').first()
  await svg.scrollIntoViewIfNeeded()
  const box = await svg.boundingBox()
  if (!box) throw new Error('no timeline svg box')
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.5)
  await expect(page.getByTestId('scrub')).toBeVisible()
})

test('the ledger shows a sparkline per row', async ({ page }) => {
  await page.goto('/')
  const rows = page.getByTestId('summary-row')
  await rows.first().scrollIntoViewIfNeeded()
  // Each row carries a mini sparkline svg.
  const sparkCount = await page.locator('svg[class*="spark"]').count()
  expect(sparkCount).toBeGreaterThanOrEqual(await rows.count())
})

test('a combined URL restores both the instrument and the event', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('summary-row').first().getByRole('button').click()
  const hash = new URL(page.url()).hash
  await page.goto(`/?i=CL${hash}`)
  await expect(page.getByText(/WTI Crude Oil/)).toBeVisible() // instrument restored
  await expect(page.getByTestId('detail')).toBeVisible() // event restored
})

test('compare overlay disappears when switching to the benchmark itself', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Oil', exact: true }).click()
  await page.getByRole('button', { name: /vs S&P 500/i }).click()
  await expect(page.getByTestId('compare-line')).toBeVisible()
  await page.getByRole('button', { name: 'S&P 500', exact: true }).click()
  await expect(page.getByTestId('compare-line')).toHaveCount(0) // no self-compare
})

test('the timeline shows a net + drawdown term outcome', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('term-stat')).toContainText(/net over the term/i)
  await expect(page.getByTestId('term-stat')).toContainText(/drawdown/i)
})
