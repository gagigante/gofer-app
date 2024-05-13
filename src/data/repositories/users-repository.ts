import { type Database } from 'sqlite3'

import { User } from '@/data/models/User'

export class UsersRepository {
  constructor(private readonly db: Database) {}

  async getUserByName(name: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE name = $name'

    return await new Promise((resolve, reject) => {
      this.db.get<User | null>(sql, { $name: name }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(
            data
              ? new User({
                  id: data.id,
                  name: data.name,
                  password: data.password,
                })
              : null,
          )
        }
      })
    })
  }
}
