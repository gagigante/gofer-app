import { contextBridge, ipcRenderer } from 'electron'

import {
  type ListBrandsRequest,
  type ListBrandsResponse,
  type CreateBrandRequest,
  type CreateBrandResponse,
  type DeleteBrandRequest,
  type DeleteBrandResponse,
  type UpdateBrandRequest,
  type UpdateBrandResponse,
  type GetBrandRequest,
  type GetBrandResponse,
} from '../controllers/brands-controller'

export interface BrandsApi {
  list: (data: ListBrandsRequest) => Promise<ListBrandsResponse>
  get: (data: GetBrandRequest) => Promise<GetBrandResponse>
  create: (data: CreateBrandRequest) => Promise<CreateBrandResponse>
  update: (data: UpdateBrandRequest) => Promise<UpdateBrandResponse>
  delete: (data: DeleteBrandRequest) => Promise<DeleteBrandResponse>
}

export const apiName = 'brandsApi'

const api = {
  list: async (data) => await ipcRenderer.invoke('brands:list', data),
  get: async (data) => await ipcRenderer.invoke('brands:get', data),
  create: async (data) => await ipcRenderer.invoke('brands:create', data),
  update: async (data) => await ipcRenderer.invoke('brands:update', data),
  delete: async (data) => await ipcRenderer.invoke('brands:delete', data),
} satisfies BrandsApi

export function brandsApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
