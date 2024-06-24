import { hash } from 'bcryptjs'

import { db } from '@/api/db'
import { UsersRepository } from '@/api/repositories/users-repository'

import { UserAlreadyExistsError } from '@/api/errors/UserAlreadyExistsError'
import { WithoutPermissionError } from '@/api/errors/WithoutPermissionError'
import { NotAllowedOperationError } from '@/api/errors/NotAllowedOperationError'
import { NotFoundError } from '@/api/errors/NotFoundError'
import { InvalidParamsError } from '@/api/errors/InvalidParamsError'

import { User } from '@/api/models/User'
import { type UserRole } from '@/api/types/user-role'
import { type Response } from '@/api/types/response'

export type ListUsersResponse = Response<{
  users: User[]
  page: number
  itemsPerPage: number
  total: number
}>

export type CreateUserResponse = Response<User>

export class UsersController {
  private readonly usersRepository: UsersRepository

  constructor() {
    this.usersRepository = new UsersRepository(db)
  }

  public async listUsers(loggedUserName: string, name = '', page = 1, itemsPerPage = 15): Promise<ListUsersResponse> {
    const loggedUser = await this.usersRepository.getUserByName(loggedUserName)

    if (!loggedUser || loggedUser.role === 'operator' || loggedUser.is_deleted) {
      const err = new WithoutPermissionError()

      return { data: null, err }
    }

    const total = await this.usersRepository.countUsers()
    const users = await this.usersRepository.getUsers(name, page, itemsPerPage)

    const data = { users, total, page, itemsPerPage }

    return { data, err: null }
  }

  public async createUser(
    loggedUserName: string,
    name: string,
    password: string,
    role: UserRole,
  ): Promise<CreateUserResponse> {
    const loggedUser = await this.usersRepository.getUserByName(loggedUserName)

    if (!loggedUser || loggedUser.role === 'operator' || loggedUser.is_deleted) {
      const err = new WithoutPermissionError()

      return { data: null, err }
    }

    if (name.includes(' ')) {
      const err = new InvalidParamsError()

      return { data: null, err }
    }

    const response = await this.usersRepository.getUserByName(name)

    if (response) {
      const err = new UserAlreadyExistsError()

      return { data: null, err }
    }

    if (role === 'super-admin') {
      const err = new NotAllowedOperationError()

      return { data: null, err }
    }

    const hashedPassword = await hash(password, 8)

    const newUser = new User({ name, password: hashedPassword, role })

    const createdUser = await this.usersRepository.createUser(newUser)

    return { data: createdUser, err: null }
  }

  public async deleteUser(loggedUserName: string, userId: string): Promise<Response<null>> {
    const loggedUser = await this.usersRepository.getUserByName(loggedUserName)

    if (!loggedUser || loggedUser.role === 'operator') {
      const err = new WithoutPermissionError()

      return { data: null, err }
    }

    const userToDelete = await this.usersRepository.getUserById(userId)

    if (!userToDelete) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    if (userToDelete.role === 'super-admin' || loggedUser.id === userToDelete.id) {
      const err = new NotAllowedOperationError()

      return { data: null, err }
    }

    if (loggedUser.role === userToDelete.role) {
      const err = new WithoutPermissionError()

      return { data: null, err }
    }

    await this.usersRepository.deleteUser(userId)

    return { data: null, err: null }
  }
}
