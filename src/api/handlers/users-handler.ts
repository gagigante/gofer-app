import { ipcMain } from 'electron'

import { UsersController } from '@/api/controllers/users-controller'

import { type UserRole } from '../types/user-role'

export interface ListUsersData {
  loggedUserId: string
  name?: string
  page?: number
  itemsPerPage?: number
}

export interface CreateUserData {
  loggedUserId: string
  name: string
  password: string
  role: UserRole
}

export interface UpdateUserData {
  loggedUserId: string
  updatedName: string
  currentPassword?: string
  newPassword?: string
  newPasswordConfirmation?: string
}

export interface DeleteUsersData {
  loggedUserId: string
  userId: string
}

const usersController = new UsersController()

ipcMain.handle(
  'users:list',
  async (_event, { loggedUserId, name, page, itemsPerPage }: ListUsersData) =>
    await usersController.listUsers(loggedUserId, name, page, itemsPerPage),
)

ipcMain.handle(
  'users:create',
  async (_event, data: CreateUserData) =>
    await usersController.createUser(data.loggedUserId, data.name, data.password, data.role),
)

ipcMain.handle('users:update', async (_event, data: UpdateUserData) => {
  const response = await usersController.updateUser(
    data.loggedUserId,
    data.updatedName,
    data.currentPassword,
    data.newPassword,
    data.newPasswordConfirmation,
  )

  return response
})

ipcMain.handle(
  'users:delete',
  async (_event, data: DeleteUsersData) => await usersController.deleteUser(data.loggedUserId, data.userId),
)

export {}
