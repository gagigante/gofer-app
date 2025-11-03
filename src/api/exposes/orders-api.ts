import { contextBridge, ipcRenderer } from 'electron'

import type {
  ListOrdersRequest,
  ListOrdersResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrderRequest,
  GetOrderResponse,
  GetOrderTemplateRequest,
  DeleteOrderRequest,
  DeleteOrderResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
} from '../controllers/orders-controller'
import type { Response } from '../types/response'

export interface OrdersApi {
  list: (data: ListOrdersRequest) => Promise<ListOrdersResponse>
  get: (data: GetOrderRequest) => Promise<GetOrderResponse>
  create: (data: CreateOrderRequest) => Promise<CreateOrderResponse>
  updateStatus: (data: UpdateOrderStatusRequest) => Promise<UpdateOrderStatusResponse>
  delete: (data: DeleteOrderRequest) => Promise<DeleteOrderResponse>
  generateFile: (data: GetOrderTemplateRequest) => Promise<Response<null>>
  downloadFile: (data: GetOrderTemplateRequest) => Promise<Response<{ is_canceled: boolean }>>
}

export const apiName = 'ordersApi'

const api = {
  list: async (data) => await ipcRenderer.invoke('orders:list', data),
  get: async (data) => await ipcRenderer.invoke('orders:get', data),
  create: async (data) => await ipcRenderer.invoke('orders:create', data),
  updateStatus: async (data) => await ipcRenderer.invoke('orders:update:status', data),
  delete: async (data) => await ipcRenderer.invoke('orders:delete', data),
  generateFile: async (data) => await ipcRenderer.invoke('orders:generate-file', data),
  downloadFile: async (data) => await ipcRenderer.invoke('orders:download-file', data),
} satisfies OrdersApi

export function ordersApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
