import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)), 'src')

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: { '@': root },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    env: loadEnv(mode, process.cwd(), ''),
  },
}))
