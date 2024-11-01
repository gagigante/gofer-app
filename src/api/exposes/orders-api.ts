import { contextBridge, ipcRenderer } from 'electron'

import {
  type ListOrdersRequest,
  type ListOrdersResponse,
  type CreateOrderRequest,
  type CreateOrderResponse,
  type GetOrderRequest,
  type GetOrderResponse,
} from '../controllers/orders-controller'

export interface OrdersApi {
  list: (data: ListOrdersRequest) => Promise<ListOrdersResponse>
  get: (data: GetOrderRequest) => Promise<GetOrderResponse>
  create: (data: CreateOrderRequest) => Promise<CreateOrderResponse>
  print: (data: unknown) => Promise<unknown>
}

export const apiName = 'ordersApi'

const api = {
  list: async (data) => await ipcRenderer.invoke('orders:list', data),
  get: async (data) => await ipcRenderer.invoke('orders:get', data),
  create: async (data) => await ipcRenderer.invoke('orders:create', data),
  print: async (data) => await ipcRenderer.invoke('orders:print', data),
} satisfies OrdersApi

export function ordersApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
