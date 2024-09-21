import { contextBridge, ipcRenderer } from 'electron'

import { type ListCategoriesData, type UpdateCategoryData } from '../handlers/categories-handler'

import {
  type ListCategoriesResponse,
  type CreateCategoryRequest,
  type CreateCategoryResponse,
  type DeleteCategoryRequest,
  type DeleteCategoryResponse,
  type UpdateCategoryResponse,
} from '../controllers/categories-controller'

export interface CategoriesApi {
  list: (data: ListCategoriesData) => Promise<ListCategoriesResponse>
  create: (data: CreateCategoryRequest) => Promise<CreateCategoryResponse>
  update: (data: UpdateCategoryData) => Promise<UpdateCategoryResponse>
  delete: (data: DeleteCategoryRequest) => Promise<DeleteCategoryResponse>
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
