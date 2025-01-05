import { drizzle } from 'drizzle-orm/libsql'

import { env } from '@/api/env'

const connection =
  process.env.NODE_ENV === 'test'
    ? {
        url: 'file:test.db',
      }
    : {
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_AUTH_TOKEN,
      }

export const db = drizzle({ connection })
