import { ipcMain } from 'electron'

import { UsersController } from '@/api/controllers/users-controller'

import { type UserRole } from '../types/user-role'

export interface ListUsersData {
  loggedUserName: string
  name?: string
  page?: number
  itemsPerPage?: number
}

export interface CreateUserData {
  loggedUserName: string
  name: string
  password: string
  role: UserRole
}

export interface DeleteUsersData {
  loggedUserName: string
  userId: string
}

const usersController = new UsersController()

ipcMain.handle(
  'users:list',
  async (_event, { loggedUserName, name, page, itemsPerPage }: ListUsersData) =>
    await usersController.listUsers(loggedUserName, name, page, itemsPerPage),
)

ipcMain.handle(
  'users:create',
  async (_event, data: CreateUserData) =>
    await usersController.createUser(data.loggedUserName, data.name, data.password, data.role),
)

ipcMain.handle(
  'users:delete',
  async (_event, data: DeleteUsersData) => await usersController.deleteUser(data.loggedUserName, data.userId),
)

export {}
