import sqlite3 from 'sqlite3'
import path from 'node:path'

import { migrate } from '@/data/db/migrations'

const db = new sqlite3.Database(`${path.resolve()}/tmp/db.sqlite`)

migrate(db)

export { db }
