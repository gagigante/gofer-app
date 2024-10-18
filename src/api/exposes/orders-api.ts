import { contextBridge, ipcRenderer } from 'electron'

import { type CreateOrderRequest, type CreateOrderResponse } from '../controllers/orders-controller'

export interface OrdersApi {  
  create: (data: CreateOrderRequest) => Promise<CreateOrderResponse>  
}

export const apiName = 'ordersApi'

const api = {
  create: async (data) => await ipcRenderer.invoke('orders:create', data),  
} satisfies OrdersApi

export function ordersApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
