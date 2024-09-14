import { contextBridge, ipcRenderer } from 'electron'

import {
  type ListCategoriesData,
  type UpdateCategoryData,
  type CreateCategoryData,
  type DeleteCategoryData,
} from '../handlers/categories-handler'

import { type Response } from '../types/response'
import {
  type ListCategoriesResponse,
  type CreateCategoryResponse,
  type UpdateCategoryResponse,
} from '../controllers/categories-controller'

export interface CategoriesApi {
  list: (data: ListCategoriesData) => Promise<ListCategoriesResponse>
  create: (data: CreateCategoryData) => Promise<CreateCategoryResponse>
  update: (data: UpdateCategoryData) => Promise<UpdateCategoryResponse>
  delete: (data: DeleteCategoryData) => Promise<Response<null>>
}

export const apiName = 'categoriesApi'

const api = {
  list: async (data) => await ipcRenderer.invoke('categories:list', data),
  create: async (data) => await ipcRenderer.invoke('categories:create', data),
  update: async (data) => await ipcRenderer.invoke('categories:update', data),
  delete: async (data) => await ipcRenderer.invoke('categories:delete', data),
} satisfies CategoriesApi

export function categoriesApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
