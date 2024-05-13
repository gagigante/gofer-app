import { type Database } from 'sqlite3'

export function migrate(db: Database) {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`)

    db.run("INSERT INTO users VALUES ('admin', 'admin', 'admin')")
  })
}
