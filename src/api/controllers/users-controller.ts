import { randomUUID } from 'node:crypto'
import { compare, hash } from 'bcryptjs'

import { UsersRepository } from '@/api/repositories/users-repository'

import { UserAlreadyExistsError } from '@/api/errors/UserAlreadyExistsError'
import { WithoutPermissionError } from '@/api/errors/WithoutPermissionError'
import { NotAllowedOperationError } from '@/api/errors/NotAllowedOperationError'
import { NotFoundError } from '@/api/errors/NotFoundError'
import { InvalidParamsError } from '@/api/errors/InvalidParamsError'
import { IncorrectCredentialsError } from '@/api/errors/IncorrectCredentialsError'

import { type UserRole } from '@/api/types/user-role'
import { type Response } from '@/api/types/response'
import { type User } from '../db/schema'

export interface ListUsersRequest {
  loggedUserId: string
  name?: string
  page?: number
  itemsPerPage?: number
}

export type ListUsersResponse = Response<{
  users: User[]
  page: number
  itemsPerPage: number
  total: number
}>

export interface CreateUserRequest {
  loggedUserId: string
  name: string
  password: string
  role: UserRole,
}

export type CreateUserResponse = Response<User>

export interface DeleteUserRequest {
  loggedUserId: string
  userId: string

}

export type DeleteUserResponse = Response<null>

export interface UpdateUserRequest {
  loggedUserId: string
  updatedName: string
  currentPassword?: string
  newPassword?: string
  newPasswordConfirmation?: string
}

export type UpdateUserResponse = Response<User>

export class UsersController {
  private readonly usersRepository: UsersRepository

  constructor() {
    this.usersRepository = new UsersRepository()
  }

  public async listUsers({
    loggedUserId,
    name = '',
    page = 1,
    itemsPerPage = 15,
  }: ListUsersRequest): Promise<ListUsersResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser || loggedUser.role === 'operator') {
      const err = new WithoutPermissionError()

      return { data: null, err }
    }

    const total = await this.usersRepository.countUsers(name)
    const users = await this.usersRepository.getUsers(name, page, itemsPerPage)

    const data = { users, total, page, itemsPerPage }

    return { data, err: null }
  }

  public async createUser({
    loggedUserId,
    name,
    password,
    role,
  }: CreateUserRequest): Promise<CreateUserResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser || loggedUser.role === 'operator') {
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

    const createdUser = await this.usersRepository.createUser({
      id: randomUUID(),
      name,
      password: hashedPassword,
      role,
    })

    return { data: createdUser, err: null }
  }

  public async deleteUser({
    loggedUserId,
    userId
  }: DeleteUserRequest): Promise<DeleteUserResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

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

    await this.usersRepository.deleteUser(userId)

    return { data: null, err: null }
  }

  public async updateUser({ 
    loggedUserId,
    updatedName,
    currentPassword,
    newPassword,
    newPasswordConfirmation,
  }: UpdateUserRequest): Promise<UpdateUserResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()

      return { data: null, err }
    }

    const userWithUpdatedName = await this.usersRepository.getUserByName(updatedName)

    if (userWithUpdatedName && userWithUpdatedName.id !== loggedUser.id) {
      const err = new UserAlreadyExistsError()

      return { data: null, err }
    }

    if (!currentPassword) {
      const response = await this.usersRepository.updateUser({ id: loggedUser.id, name: updatedName })

      return { data: response, err: null }
    }

    const doesPasswordMatch = await compare(currentPassword, loggedUser.password)

    if (!doesPasswordMatch) {
      return { data: null, err: new IncorrectCredentialsError() }
    }

    if (!newPassword || !newPasswordConfirmation) {
      return { data: null, err: new InvalidParamsError() }
    }

    if (newPassword !== newPasswordConfirmation) {
      return { data: null, err: new InvalidParamsError() }
    }

    const hashedNewPassword = await hash(newPassword, 8)

    const response = await this.usersRepository.updateUser({
      id: loggedUser.id,
      name: updatedName,
      password: hashedNewPassword,
    })

    return { data: response, err: null }
  }
}
