import { contextBridge, ipcRenderer } from 'electron'

import type {
  CreateCustomerRequest,
  CreateCustomerResponse,
  DeleteCustomerRequest,
  DeleteCustomerResponse,
  GetCustomerRequest,
  GetCustomerResponse,
  ListCustomersRequest,
  ListCustomersResponse,
  UpdateCustomerRequest,
  UpdateCustomerResponse,
} from '../controllers/customers-controller'

export interface CustomersApi {
  list: (data: ListCustomersRequest) => Promise<ListCustomersResponse>
  get: (data: GetCustomerRequest) => Promise<GetCustomerResponse>
  create: (data: CreateCustomerRequest) => Promise<CreateCustomerResponse>
  update: (data: UpdateCustomerRequest) => Promise<UpdateCustomerResponse>
  delete: (data: DeleteCustomerRequest) => Promise<DeleteCustomerResponse>
}

export const apiName = 'customersApi'

const api = {
  list: async (data) => await ipcRenderer.invoke('customers:list', data),
  get: async (data) => await ipcRenderer.invoke('customers:get', data),
  create: async (data) => await ipcRenderer.invoke('customers:create', data),
  update: async (data) => await ipcRenderer.invoke('customers:update', data),
  delete: async (data) => await ipcRenderer.invoke('customers:delete', data),
} satisfies CustomersApi

export function customersApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
