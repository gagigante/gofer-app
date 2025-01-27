import { UsersRepository } from '../repositories/users-repository'

import { WithoutPermissionError } from '../errors/WithoutPermissionError'

import { type Response } from '../types/response'
import { type UserRole } from '../types/user-role'
import { type User } from '../db/schema'
import { USER_ROLE_LEVELS } from '../constants/user-role-levels'

export class AuthMiddleware {
  constructor(private usersRepository: UsersRepository) {}

  public async handle(userId: string, requiredRole?: UserRole): Promise<Response<User>> {
    const loggedUser = await this.usersRepository.getUserById(userId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    if (requiredRole && USER_ROLE_LEVELS[loggedUser.role as UserRole] < USER_ROLE_LEVELS[requiredRole]) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    return { data: loggedUser, err: null }
  }
}
