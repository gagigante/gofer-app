import { db } from "../../data/db/index.mjs"
import { UsersRepository } from "../../data/repositories/users-repository.mjs"
import { IncorrectCredentialsError } from "../errors/IncorrectCredentialsError.mjs"

export class LoginController {
  constructor() {
    this._usersRepository = new UsersRepository(db)
  }

  /**
   * @typedef {Object} UserDTO
   * @property {string} id
   * @property {string} name
   */

  /**
   * TODO: password hashing
   * @param {string} name
   * @param {string} password
   * @returns {Promise<{ data: UserDTO | null, err: IncorrectCredentialsError | null }>}
   */
  async login(name, password) {
    const response = await this._usersRepository.getUserByName(name)

    if (!response) {
      return { data: null, err: new IncorrectCredentialsError()}
    }

    if (response.password !== password) {      
      return { data: null, err: new IncorrectCredentialsError()}
    }

    const user = {
      id: response.id,
      name: response.name
    }

    return { data: user, err: null }
  }
}
