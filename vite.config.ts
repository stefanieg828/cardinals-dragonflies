import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Absolute base required for GitHub Pages project site.
export default defineConfig({
  plugins: [react()],
  base: '/cardinals-dragonflies/',
})
