import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // required for Render SPA
  plugins: [react()],
  build: {
    outDir: 'dist', // production output folder
  },
  server: {
    fs: {
      allow: ['.'], // allows Vite to serve all project files in dev
    },
  },
})
