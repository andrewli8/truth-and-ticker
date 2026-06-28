import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Playwright E2E specs live in e2e/ and must not be run by vitest/jsdom.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
