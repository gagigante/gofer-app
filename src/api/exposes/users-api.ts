import { contextBridge, ipcRenderer } from 'electron'

import { type DeleteUsersData, type CreateUserData, type ListUsersData } from '@/api/handlers/users-handler'

import { type User } from '../models/User'
import { type Response } from '../types/response'

export interface UsersApi {
  list: (data: ListUsersData) => Promise<Response<User[]>>
  create: (data: CreateUserData) => Promise<Response<User>>
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
