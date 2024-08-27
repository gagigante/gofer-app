import path from 'node:path'
import { app } from 'electron'
import sqlite3 from 'sqlite3'

import { migrate } from '@/api/db/migrations'

const DATABASE_PATH = path.join(app.getPath('userData'), 'db.sqlite')

const db = new sqlite3.Database(DATABASE_PATH)

migrate(db)

export { db }
