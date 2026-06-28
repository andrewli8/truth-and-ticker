import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Two entries: the main piece and the standalone one-screen POC (poc.html).
      input: {
        main: 'index.html',
        poc: 'poc.html',
      },
      output: {
        // Split vendor into stable, cacheable chunks (same modules, loaded in
        // parallel) so app-code changes don't bust the library cache.
        manualChunks: {
          react: ['react', 'react-dom'],
          gsap: ['gsap', '@gsap/react'],
          d3: ['d3-scale', 'd3-shape'],
        },
      },
    },
  },
})
