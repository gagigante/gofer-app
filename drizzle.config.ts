import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

import { env } from './src/api/env'

const dbCredentials =
  process.env.NODE_ENV === 'test'
    ? {
        url: 'file:test.db',
      }
    : {
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_AUTH_TOKEN,
      }

export default defineConfig({
  dialect: 'turso',
  schema: './src/api/db/schema.ts',
  out: './migrations',
  dbCredentials,
})
