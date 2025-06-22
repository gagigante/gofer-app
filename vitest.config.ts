import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    fileParallelism: false,
    setupFiles: ['./vitest-setup.ts'],
    coverage: {
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/api/db', 'src/api/env', 'src/api/db/migrations', 'src/api/db/seeders', 'src/view'],
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
