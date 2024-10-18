import { ipcMain } from 'electron'

import { type CreateOrderRequest, OrdersController } from '../controllers/orders-controller'

const ordersController = new OrdersController()

ipcMain.handle(
  'orders:create',
  async (_event, data: CreateOrderRequest) => await ordersController.createOrder(data),
)

export {}
