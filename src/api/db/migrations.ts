import { randomUUID } from 'crypto'
import { hash } from 'bcryptjs'
import { type Database } from 'sqlite3'

export async function migrate(db: Database) {
  const id = randomUUID()
  const name = 'admin'
  const hashedPassword = await hash('admin', 8)
  const role = 'super-admin'

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('super-admin','admin','operator')) NOT NULL
    )`)

    db.get('SELECT id FROM users WHERE name = $name', { $name: name }, (_err, row) => {
      if (!row) {
        db.run('INSERT INTO users VALUES ($id, $name, $password, $role)', {
          $id: id,
          $name: name,
          $password: hashedPassword,
          $role: role,
        })
      }
    })
  })
}
