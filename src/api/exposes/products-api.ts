import { contextBridge, ipcRenderer } from 'electron'

import {
  type ListProductsRequest,
  type ListProductsResponse,
  type CreateProductRequest,
  type CreateProductResponse,
  type UpdateProductRequest,
  type UpdateProductResponse,
  type GetLastProductRequest,
  type GetLastProductResponse,
  type GetByBarcodeRequest,
  type GetByBarcodeResponse,
} from '../controllers/products-controller'

export interface ProductsApi {
  list: (data: ListProductsRequest) => Promise<ListProductsResponse>
  getLast: (data: GetLastProductRequest) => Promise<GetLastProductResponse>
  getByBarcode: (data: GetByBarcodeRequest) => Promise<GetByBarcodeResponse>
  create: (data: CreateProductRequest) => Promise<CreateProductResponse>
  update: (data: UpdateProductRequest) => Promise<UpdateProductResponse>
}

export const apiName = 'productsApi'

const api = {
  list: async (data) => await ipcRenderer.invoke('products:list', data),
  getLast: async (data) => await ipcRenderer.invoke('products:getLast', data),
  getByBarcode: async (data) => await ipcRenderer.invoke('products:getByBarcode', data),
  create: async (data) => await ipcRenderer.invoke('products:create', data),
  update: async (data) => await ipcRenderer.invoke('products:update', data),
} satisfies ProductsApi

export function productsApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
