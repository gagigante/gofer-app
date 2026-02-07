import { defineConfig, loadEnv } from 'vite'
import path from 'path'

// https://vitejs.dev/config
export default defineConfig(({ mode }) => {
  // Load env file - in production build, use production env vars
  const env = loadEnv(mode, process.cwd(), '')

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Replace process.env references at build time for main process
      'process.env.ENV': JSON.stringify(env.ENV || 'production'),
      'process.env.PROD_TURSO_DATABASE_URL': JSON.stringify(env.PROD_TURSO_DATABASE_URL || ''),
      'process.env.PROD_TURSO_AUTH_TOKEN': JSON.stringify(env.PROD_TURSO_AUTH_TOKEN || ''),
      'process.env.PROD_DEFAULT_SUPER_ADMIN_USERNAME': JSON.stringify(env.PROD_DEFAULT_SUPER_ADMIN_USERNAME || ''),
      'process.env.PROD_DEFAULT_SUPER_ADMIN_PASSWORD': JSON.stringify(env.PROD_DEFAULT_SUPER_ADMIN_PASSWORD || ''),
      'process.env.DEV_TURSO_DATABASE_URL': JSON.stringify(env.DEV_TURSO_DATABASE_URL || ''),
      'process.env.DEV_TURSO_AUTH_TOKEN': JSON.stringify(env.DEV_TURSO_AUTH_TOKEN || ''),
      'process.env.DEV_DEFAULT_SUPER_ADMIN_USERNAME': JSON.stringify(env.DEV_DEFAULT_SUPER_ADMIN_USERNAME || ''),
      'process.env.DEV_DEFAULT_SUPER_ADMIN_PASSWORD': JSON.stringify(env.DEV_DEFAULT_SUPER_ADMIN_PASSWORD || ''),
      'process.env.TEST_TURSO_DATABASE_URL': JSON.stringify(env.TEST_TURSO_DATABASE_URL || ''),
      'process.env.TEST_DEFAULT_SUPER_ADMIN_USERNAME': JSON.stringify(env.TEST_DEFAULT_SUPER_ADMIN_USERNAME || ''),
      'process.env.TEST_DEFAULT_SUPER_ADMIN_PASSWORD': JSON.stringify(env.TEST_DEFAULT_SUPER_ADMIN_PASSWORD || ''),
    },
  }
})
