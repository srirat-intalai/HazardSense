import reactPlugin from '@vitejs/plugin-react'
import tailwindPlugin from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    reactPlugin(),
    tailwindPlugin(),
  ],
})
