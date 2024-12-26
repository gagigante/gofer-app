import { ipcMain } from 'electron'

import {
  CustomersController,
  type CreateCustomerRequest,
  type UpdateCustomerRequest,
  type ListCustomersRequest,
  type DeleteCustomerRequest,
  type GetCustomerRequest,
} from '@/api/controllers/customers-controller'

const customerController = new CustomersController()

ipcMain.handle(
  'customers:list',
  async (_event, data: ListCustomersRequest) => await customerController.listCustomers(data),
)

ipcMain.handle('customers:get', async (_event, data: GetCustomerRequest) => await customerController.getCustomer(data))

ipcMain.handle(
  'customers:create',
  async (_event, data: CreateCustomerRequest) => await customerController.createCustomer(data),
)

ipcMain.handle('customers:update', async (_event, data: UpdateCustomerRequest) => {
  const response = await customerController.updateCustomer(data)

  return response
})

ipcMain.handle(
  'customers:delete',
  async (_event, data: DeleteCustomerRequest) => await customerController.deleteCustomer(data),
)

export {}
