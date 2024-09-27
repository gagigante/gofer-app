import { contextBridge, ipcRenderer } from 'electron'

import { type CreateProductRequest, type CreateProductResponse } from '../controllers/products-controller'

export interface ProductsApi {
  create: (data: CreateProductRequest) => Promise<CreateProductResponse>
}

export const apiName = 'productsApi'

const api = {
  create: async (data) => await ipcRenderer.invoke('products:create', data),
} satisfies ProductsApi

export function productsApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
