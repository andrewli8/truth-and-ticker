import { defineConfig, devices } from '@playwright/test'

const PORT = 5174
const BASE = `http://localhost:${PORT}`

/**
 * E2E config. Kept OUT of the `verify` gate (tsc + vitest + build) — run with
 * `npm run test:e2e`. Boots Vite on a dedicated port and drives real Chromium.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: BASE,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
