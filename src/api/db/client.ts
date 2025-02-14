import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql/web'

import * as schema from './schema'
import { env } from '@/api/env'

const connection = {
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
}

export const db = drizzle({ connection, schema })
