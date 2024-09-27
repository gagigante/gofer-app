import { ipcMain } from 'electron'

import { type CreateProductRequest, ProductsController } from '../controllers/products-controller'

const productsController = new ProductsController()

ipcMain.handle(
  'products:create',
  async (_event, data: CreateProductRequest) => await productsController.createProduct(data),
)

export {}
