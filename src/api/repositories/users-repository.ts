import { type Database } from 'sqlite3'

import { User } from '@/api/models/User'

export class UsersRepository {
  constructor(private readonly db: Database) {}

  public async getUserById(userId: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = $id'

    return await new Promise((resolve, reject) => {
      this.db.get<User | null>(sql, { $id: userId }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(
            data
              ? new User({
                  id: data.id,
                  name: data.name,
                  password: data.password,
                  role: data.role,
                })
              : null,
          )
        }
      })
    })
  }

  public async getUserByName(name: string): Promise<User | null> {
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
                  role: data.role,
                })
              : null,
          )
        }
      })
    })
  }

  public async createUser({ id, name, password, role, is_deleted }: User) {
    const sql = 'INSERT INTO users VALUES ($id, $name, $password, $role, FALSE)'

    return await new Promise<User>((resolve, reject) => {
      this.db.run(
        sql,
        {
          $id: id,
          $name: name,
          $password: password,
          $role: role,
        },
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve({ id, name, password, role, is_deleted })
          }
        },
      )
    })
  }

  public async deleteUser(userId: string): Promise<void> {
    const sql = 'UPDATE users SET is_deleted = TRUE WHERE id = $id'

    await new Promise((resolve, reject) => {
      this.db.run(sql, { $id: userId }, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(undefined)
        }
      })
    })
  }
}
