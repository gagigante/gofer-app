import { compare } from 'bcryptjs'

import { db } from '@/api/db'
import { UsersRepository } from '@/api/repositories/users-repository'

import { IncorrectCredentialsError } from '@/api/errors/IncorrectCredentialsError'

export class LoginController {
  private readonly usersRepository: UsersRepository

  constructor() {
    this.usersRepository = new UsersRepository(db)
  }

  async login(name: string, password: string) {
    const response = await this.usersRepository.getUserByName(name)

    if (!response) {
      const err = new IncorrectCredentialsError()

      return { data: null, err }
    }

    const doesPasswordMatch = await compare(password, response.password)

    if (!doesPasswordMatch) {
      return { data: null, err: new IncorrectCredentialsError() }
    }

    if (response.is_deleted) {
      return { data: null, err: new IncorrectCredentialsError() }
    }

    const user = {
      id: response.id,
      name: response.name,
      role: response.role,
    }

    return { data: user, err: null }
  }
}
