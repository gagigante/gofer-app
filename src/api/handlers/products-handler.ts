import { ipcMain } from 'electron'

import {
  type CreateProductRequest,
  type ListProductsRequest,
  ProductsController,
} from '../controllers/products-controller'

const productsController = new ProductsController()

ipcMain.handle('products:list', async (_event, data: ListProductsRequest) => {
  return await productsController.listProducts(data)
})

ipcMain.handle(
  'products:create',
  async (_event, data: CreateProductRequest) => await productsController.createProduct(data),
)

export {}
