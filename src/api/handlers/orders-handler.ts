import { ipcMain } from 'electron'

import { type CreateOrderRequest, type ListOrdersRequest, OrdersController } from '../controllers/orders-controller'

const ordersController = new OrdersController()

ipcMain.handle(
  'orders:list',
  async (_event, data: ListOrdersRequest) => await ordersController.listOrders(data),
)

ipcMain.handle(
  'orders:create',
  async (_event, data: CreateOrderRequest) => await ordersController.createOrder(data),
)

export {}
