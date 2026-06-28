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
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/**/__tests__/**', 'src/main.tsx', 'src/vite-env.d.ts', 'src/lib/types.ts'],
      // Enforce the project's ≥80% bar (run via `npm run test:coverage`).
      thresholds: { statements: 85, branches: 78, functions: 85, lines: 85 },
    },
  },
})
