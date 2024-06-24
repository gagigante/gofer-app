import { contextBridge, ipcRenderer } from 'electron'

import { type DeleteUsersData, type CreateUserData, type ListUsersData } from '@/api/handlers/users-handler'

import { type Response } from '../types/response'
import { type CreateUserResponse, type ListUsersResponse } from '../controllers/users-controller'

export interface UsersApi {
  list: (data: ListUsersData) => Promise<ListUsersResponse>
  create: (data: CreateUserData) => Promise<CreateUserResponse>
  delete: (data: DeleteUsersData) => Promise<Response<null>>
}

export const apiName = 'usersApi'

const api = {
  list: async (data) => await ipcRenderer.invoke('users:list', data),
  create: async (data) => await ipcRenderer.invoke('users:create', data),
  delete: async (data) => await ipcRenderer.invoke('users:delete', data),
} satisfies UsersApi

export function usersApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
