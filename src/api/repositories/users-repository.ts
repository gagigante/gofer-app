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
                  is_deleted: Boolean(data.is_deleted),
                })
              : null,
          )
        }
      })
    })
  }

  public async getUsers(name = '', page = 1, itemsPerPage = 15): Promise<User[]> {
    const sql = `SELECT * FROM users WHERE name LIKE $name AND is_deleted = false
      ORDER BY is_deleted, name
      LIMIT $itemsPerPage
      OFFSET $offset;
    `

    return await new Promise((resolve, reject) => {
      this.db.all<User>(
        sql,
        {
          $name: `%${name}%`,
          $itemsPerPage: itemsPerPage,
          $offset: page === 1 ? 0 : itemsPerPage * page - itemsPerPage,
        },
        (err, data) => {
          if (err) {
            reject(err)
          } else {
            resolve(
              data.map(
                (user) =>
                  new User({
                    id: user.id,
                    name: user.name,
                    password: user.password,
                    role: user.role,
                    is_deleted: !!user.is_deleted,
                  }),
              ),
            )
          }
        },
      )
    })
  }

  public async countUsers(name = ''): Promise<number> {
    const sql = 'SELECT COUNT(id) as count FROM users WHERE name LIKE $name AND is_deleted = false;'

    return await new Promise<number>((resolve, reject) => {
      this.db.get<{ count: number }>(sql, { $name: `%${name}%` }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data.count)
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

  public async updateUser(userId: string, name: string, newPassword?: string): Promise<User | null> {
    let sql = 'UPDATE users set name = $name WHERE id = $id'

    if (newPassword) {
      sql = 'UPDATE users set name = $name, password = $password WHERE id = $id'
    }

    return await new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(sql, { $id: userId, $name: name, $password: newPassword }, (err) => {
          if (err) {
            reject(err)
          }
        })

        this.db.get<User | null>('SELECT * FROM users WHERE id = $id', { $id: userId }, (err, data) => {
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
                    is_deleted: Boolean(data.is_deleted),
                  })
                : null,
            )
          }
        })
      })
    })
  }
}
