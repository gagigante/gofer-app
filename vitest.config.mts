import path from 'node:path'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    test: {
      fileParallelism: false,
      setupFiles: ['./vitest-setup.ts'],
      env: {
        ...env,
        ENV: 'test',
      },
      coverage: {
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['src/view', 'src/api/db', 'src/api/env', 'src/api/db/migrations', 'src/api/db/seeders'],
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), './src'),
      },
    },
  }
})
