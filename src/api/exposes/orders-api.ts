import { contextBridge, ipcRenderer } from 'electron'

import { 
  type ListOrdersRequest,
  type ListOrdersResponse,
  type CreateOrderRequest,
  type CreateOrderResponse,
} from '../controllers/orders-controller'

export interface OrdersApi {  
  list: (data: ListOrdersRequest) => Promise<ListOrdersResponse>
  create: (data: CreateOrderRequest) => Promise<CreateOrderResponse>  
}

export const apiName = 'ordersApi'

const api = {
  list: async (data) => await ipcRenderer.invoke('orders:list', data),
  create: async (data) => await ipcRenderer.invoke('orders:create', data),  
} satisfies OrdersApi

export function ordersApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
