import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages project site: https://<user>.github.io/I-FALL/
  base: '/I-FALL/',
  server: {
    watch: {
      // Local analysis output and build artefacts are not source; watching them
      // produces EBUSY errors when a file is open in another program.
      ignored: ['**/result/**', '**/dist/**'],
    },
  },
})
