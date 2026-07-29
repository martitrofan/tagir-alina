import { defineConfig } from 'vite'

export default defineConfig({
  // Relative base so GitHub Pages project URL works without hardcoding the repo name
  base: './',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
})
