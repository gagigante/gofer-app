import sqlite3 from 'sqlite3'

import { User } from '../models/User.mjs'

export class UsersRepository {
  /**
   * @param {sqlite3.Database} _db
   */
  constructor(_db) {    
    this._db = _db
  }

  /**
   * @param {string} name
   * @returns {Promise<User | null>}
   */
  async getUserByName(name) {
    const sql = 'SELECT * FROM users WHERE name = $name'

    return new Promise((resolve, reject) => {
      this._db.get(sql, { $name: name }, (err, data) => {        
        if (err) {
          reject(err)
        } else {                                       
          resolve(
            data 
              ? new User({ id: data.id, name: data.name, password: data.password }) 
              : null
          )
        }
      })
    })    
  }

  /**
   * TODO: handle error
   * @param {User} user
   * @returns {Promise}
   */
  async createUser(user) {
    const sql = 'INSERT INTO users (id, name, password) VALUES (?, ?, ?)'

    return new Promise((resolve, reject) => {
      this._db.run(sql, [user.id, user.name, user.password], (db, err) => {
        if (err) {
          reject(err)
        } else {
          resolve(user)
        }
      })      
    })    
  }
}
