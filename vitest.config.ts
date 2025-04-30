import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    fileParallelism: false,
    setupFiles: ['./vitest-setup.ts'],
    coverage: {
      exclude: ['src/api/db', 'src/api/env'],
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
