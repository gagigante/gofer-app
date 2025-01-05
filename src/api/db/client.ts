import { drizzle } from 'drizzle-orm/libsql'

const connection =
  process.env.NODE_ENV === 'test'
    ? {
        url: 'file:test.db',
      }
    : {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }

export const db = drizzle({ connection })
