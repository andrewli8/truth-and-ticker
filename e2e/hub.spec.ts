import { test, expect } from '@playwright/test'

// The one-screen hub (index.html): masthead + summary + instrument chips + a horizontal
// filmstrip of every announcement; clicking a moment zooms it into a detail dialog.

const noPageOverflow = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)

test('loads the hub: masthead, summary, and a filmstrip of every announcement', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Truth & Ticker/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ticker')
  const strip = page.getByRole('listbox', { name: /timeline/i })
  await expect(strip).toBeVisible()
  // 30 announcements → 30 options.
  expect(await strip.getByRole('option').count()).toBe(30)
  // The page itself never scrolls horizontally (only the filmstrip does).
  expect(await noPageOverflow(page)).toBeTruthy()
})

test('arrow keys travel the timeline', async ({ page }) => {
  await page.goto('/')
  const strip = page.getByRole('listbox', { name: /timeline/i })
  await strip.focus()
  const selected = strip.locator('[role=option][aria-selected="true"]')
  const before = await selected.getAttribute('id')
  await page.keyboard.press('ArrowRight')
  await expect(selected).not.toHaveAttribute('id', before ?? '')
})

test('clicking the active moment zooms it into a detail dialog; Escape closes', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const strip = page.getByRole('listbox', { name: /timeline/i })
  await strip.locator('[role=option][aria-selected="true"]').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  // The detail layer carries the reused market chart and a close control.
  await expect(dialog.getByRole('img')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('a topic chip zooms into a breakdown layer; Escape closes', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /full ledger/i }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('table')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('the instrument switcher recolours the hub', async ({ page }) => {
  await page.goto('/')
  const group = page.getByRole('group', { name: /choose the instrument/i })
  const oil = group.getByRole('button', { name: 'Oil', exact: true })
  await expect(oil).toHaveAttribute('aria-pressed', 'false')
  await oil.click()
  await expect(oil).toHaveAttribute('aria-pressed', 'true')
})

test('a skip link targets the main region', async ({ page }) => {
  await page.goto('/')
  const skip = page.getByRole('link', { name: /skip to content/i })
  await expect(skip).toHaveAttribute('href', '#main-content')
})

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })
  test('loads with no horizontal page overflow', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('listbox', { name: /timeline/i })).toBeVisible()
    expect(await noPageOverflow(page)).toBeTruthy()
  })
})
