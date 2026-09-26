import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so GitHub Pages and local preview both resolve assets.
export default defineConfig({
  plugins: [react()],
  base: './',
})
