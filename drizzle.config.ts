import { defineConfig } from 'drizzle-kit'
import 'dotenv/config'

export default defineConfig({
  dialect: 'turso',
  schema: './src/api/db/schema.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.TURSO_DEV_DATABASE_URL!,
    authToken: process.env.TURSO_DEV_AUTH_TOKEN,
  },
})
