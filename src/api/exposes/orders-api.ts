import { contextBridge, ipcRenderer } from 'electron'

import {
  type ListOrdersRequest,
  type ListOrdersResponse,
  type CreateOrderRequest,
  type CreateOrderResponse,
  type GetOrderRequest,
  type GetOrderResponse,
  type GetOrderTemplateRequest,
  type DeleteOrderRequest,
  type DeleteOrderResponse,
} from '../controllers/orders-controller'
import { type Response } from '../types/response'

export interface OrdersApi {
  list: (data: ListOrdersRequest) => Promise<ListOrdersResponse>
  get: (data: GetOrderRequest) => Promise<GetOrderResponse>
  create: (data: CreateOrderRequest) => Promise<CreateOrderResponse>
  delete: (data: DeleteOrderRequest) => Promise<DeleteOrderResponse>
  generateFile: (data: GetOrderTemplateRequest) => Promise<Response<null>>
  downloadFile: (data: GetOrderTemplateRequest) => Promise<Response<{ is_canceled: boolean }>>
}

export const apiName = 'ordersApi'

const api = {
  list: async (data) => await ipcRenderer.invoke('orders:list', data),
  get: async (data) => await ipcRenderer.invoke('orders:get', data),
  create: async (data) => await ipcRenderer.invoke('orders:create', data),
  delete: async (data) => await ipcRenderer.invoke('orders:delete', data),
  generateFile: async (data) => await ipcRenderer.invoke('orders:generate-file', data),
  downloadFile: async (data) => await ipcRenderer.invoke('orders:download-file', data),
} satisfies OrdersApi

export function ordersApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
