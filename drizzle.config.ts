import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const dbCredentials =
  process.env.NODE_ENV === 'test'
    ? {
        url: 'file:test.db',
      }
    : {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }

export default defineConfig({
  dialect: 'turso',
  schema: './src/api/db/schema.ts',
  out: './migrations',
  dbCredentials,
})
