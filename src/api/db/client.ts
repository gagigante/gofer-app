import { createClient } from '@libsql/client/web'
import { drizzle } from 'drizzle-orm/libsql'

const client = createClient({
  url: `${process.env.TURSO_DEV_DATABASE_URL}`,
  authToken: `${process.env.TURSO_DEV_AUTH_TOKEN}`,
})

export const db = drizzle(client)
