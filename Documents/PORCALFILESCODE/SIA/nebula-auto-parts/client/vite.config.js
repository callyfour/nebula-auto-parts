import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    fs: {
      allow: ['.'], // ensures Vite can serve all project files
    },
  },
})
