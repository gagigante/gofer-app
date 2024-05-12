import sqlite3 from 'sqlite3'

/**
 * TODO
 * @param {sqlite3.Database} db 
 */
export function migrate(db) {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`)

    db.run("INSERT INTO users VALUES ('admin', 'admin', 'admin')")
  });
}
