import { drizzle } from 'drizzle-orm/libsql/web'

export const db = drizzle({
  connection: {
    url: `${process.env.TURSO_DEV_DATABASE_URL}`,
    authToken: `${process.env.TURSO_DEV_AUTH_TOKEN}`,
  },
})
