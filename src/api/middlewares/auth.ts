import { UsersRepository } from '../repositories/users-repository'

import { WithoutPermissionError } from '../errors/WithoutPermissionError'

import { type Response } from '../types/response'

export class AuthMiddleware {
  constructor(private usersRepository: UsersRepository) {}

  public async handle(userId: string): Promise<Response<null>> {
    const loggedUser = await this.usersRepository.getUserById(userId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    return { data: null, err: null }
  }
}
