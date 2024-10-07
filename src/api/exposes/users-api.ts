import { contextBridge, ipcRenderer } from 'electron'

import {
  type ListUsersRequest,
  type ListUsersResponse,
  type CreateUserRequest,
  type CreateUserResponse,
  type UpdateUserRequest,
  type UpdateUserResponse,
  type DeleteUserRequest,
  type DeleteUserResponse,
} from '@/api/controllers/users-controller'

export interface UsersApi {
  list: (data: ListUsersRequest) => Promise<ListUsersResponse>
  create: (data: CreateUserRequest) => Promise<CreateUserResponse>
  update: (data: UpdateUserRequest) => Promise<UpdateUserResponse>
  delete: (data: DeleteUserRequest) => Promise<DeleteUserResponse>
}

export const apiName = 'usersApi'

const api = {
  list: async (data) => await ipcRenderer.invoke('users:list', data),
  create: async (data) => await ipcRenderer.invoke('users:create', data),
  update: async (data) => await ipcRenderer.invoke('users:update', data),
  delete: async (data) => await ipcRenderer.invoke('users:delete', data),
} satisfies UsersApi

export function usersApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
