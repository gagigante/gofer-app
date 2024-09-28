import { contextBridge, ipcRenderer } from 'electron'

import {
  type ListProductsRequest,
  type ListProductsResponse,
  type CreateProductRequest,
  type CreateProductResponse,
} from '../controllers/products-controller'

export interface ProductsApi {
  list: (data: ListProductsRequest) => Promise<ListProductsResponse>
  create: (data: CreateProductRequest) => Promise<CreateProductResponse>
}

export const apiName = 'productsApi'

const api = {
  list: async (data) => await ipcRenderer.invoke('products:list', data),
  create: async (data) => await ipcRenderer.invoke('products:create', data),
} satisfies ProductsApi

export function productsApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
