import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Listen on all network addresses (0.0.0.0)
    port: 5174,
  },
  preview: {
    host: true,
    port: 5174,
  },
})
