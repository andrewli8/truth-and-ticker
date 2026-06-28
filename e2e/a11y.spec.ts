import { test, expect } from '@playwright/test'

test('skip link is the first stop and moves focus to main content', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: /skip to content/i })
  await expect(skip).toBeFocused()
  await skip.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
})

test('a focused control shows a visible focus ring', async ({ page }) => {
  await page.goto('/')
  const toggle = page.getByRole('button', { name: /dark mode|light mode/i })
  await toggle.focus()
  // focus-visible styling applies an outline (not "none").
  const outline = await toggle.evaluate((el) => getComputedStyle(el).outlineStyle)
  expect(outline).not.toBe('none')
})
