import { test, expect } from '@playwright/test'

// The one-screen POC (poc.html) is a separate Vite entry. Its core interaction —
// scrubbing the S&P line to drive the reaction readout and the scene colour — is
// pointer/keyboard behaviour that only a real browser exercises.

test('dragging across the POC chart changes the reaction and the scene colour', async ({ page }) => {
  await page.goto('/poc.html')

  const chart = page.locator('svg.poc-chart')
  await expect(chart).toBeVisible()
  const root = page.locator('.poc')
  const pct = page.locator('.poc-pct')

  const beforeDir = await root.getAttribute('data-dir')
  const beforePct = await pct.textContent()

  const box = await chart.boundingBox()
  if (!box) throw new Error('chart has no bounding box')
  const y = box.y + box.height * 0.5

  // Sweep the pointer across the whole timeline while dragging.
  const dirs = new Set<string>()
  const pcts = new Set<string>()
  await page.mouse.move(box.x + box.width * 0.95, y)
  await page.mouse.down()
  for (let f = 0.9; f >= 0.05; f -= 0.05) {
    await page.mouse.move(box.x + box.width * f, y, { steps: 3 })
    dirs.add((await root.getAttribute('data-dir')) ?? '')
    pcts.add((await pct.textContent()) ?? '')
  }
  await page.mouse.up()

  // The readout took on values other than the default → real scrubbing.
  expect(pcts.size).toBeGreaterThan(1)
  expect([...pcts].some((t) => t !== beforePct)).toBeTruthy()
  // Some posts are gains and some are losses, so the scene direction flips.
  expect([...dirs].some((d) => d !== beforeDir)).toBeTruthy()
})

test('arrow keys scrub the POC chart (focusable slider)', async ({ page }) => {
  await page.goto('/poc.html')

  const chart = page.locator('svg.poc-chart')
  await expect(chart).toHaveAttribute('role', 'slider')
  await chart.focus()

  const meta = page.locator('.poc-meta')
  const before = await meta.textContent()
  // ArrowLeft steps from the latest post to an earlier one.
  await page.keyboard.press('ArrowLeft')
  await expect(meta).not.toHaveText(before ?? '')
  // ArrowRight steps back to where it started.
  await page.keyboard.press('ArrowRight')
  await expect(meta).toHaveText(before ?? '')
})

test('the instrument switcher re-plots the line and readout', async ({ page }) => {
  await page.goto('/poc.html')
  const line = page.locator('.poc-line')
  const before = await line.getAttribute('d')
  const kicker = page.locator('.poc-kicker')
  await expect(kicker).toContainText('S&P 500')

  await page.getByRole('button', { name: 'Oil', exact: true }).click()
  await expect(kicker).toContainText('Oil')
  await expect.poll(async () => line.getAttribute('d')).not.toBe(before)
})

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('the bottom overlays do not collide and there is no horizontal overflow', async ({ page }) => {
    await page.goto('/poc.html')
    const readout = await page.locator('.poc-readout').boundingBox()
    const back = await page.locator('.poc-back').boundingBox()
    if (!readout || !back) throw new Error('missing overlay boxes')
    // The readout sits in its own band above the back-link — boxes must not intersect.
    const overlap =
      readout.x < back.x + back.width &&
      readout.x + readout.width > back.x &&
      readout.y < back.y + back.height &&
      readout.y + readout.height > back.y
    expect(overlap).toBeFalsy()
    // The keyboard-only hint is dropped on touch widths.
    await expect(page.locator('.poc-hint')).toBeHidden()
    // No horizontal scroll.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBeFalsy()
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('shows the full scene on load — the entrance is JS-gated', async ({ page }) => {
    await page.goto('/poc.html')
    // The GSAP entrance returns early under reduced motion, so the line and the
    // masked title must already be in place (not stuck mid-reveal / opacity 0).
    const line = page.locator('.poc-line')
    await expect(line).toBeVisible()
    await expect(line).toHaveAttribute('d', /\d/)
    await expect(page.getByText(/the market/)).toBeVisible()
  })
})
