import { ipcMain } from 'electron'

import { 
  type CreateUserRequest,
  type DeleteUserRequest,
  type ListUsersRequest,
  type UpdateUserRequest,
  UsersController,
} from '@/api/controllers/users-controller'

const usersController = new UsersController()

ipcMain.handle(
  'users:list',
  async (_event, data: ListUsersRequest) =>
    await usersController.listUsers(data),
)

ipcMain.handle(
  'users:create',
  async (_event, data: CreateUserRequest) =>
    await usersController.createUser(data),
)

ipcMain.handle('users:update', async (_event, data: UpdateUserRequest) => {
  const response = await usersController.updateUser(data)

  return response
})

ipcMain.handle(
  'users:delete',
  async (_event, data: DeleteUserRequest) => await usersController.deleteUser(data),
)

export {}
