import sqlite3 from 'sqlite3'
import path from 'node:path'

import { migrate } from './migrations.mjs'

const db = new sqlite3.Database(`${path.resolve()}/tmp/db.sqlite`)

migrate(db)

export { db }
