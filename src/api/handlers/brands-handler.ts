import { ipcMain } from 'electron'

import {
  BrandsController,
  type ListBrandsRequest,
  type CreateBrandRequest,
  type UpdateBrandRequest,
  type DeleteBrandRequest,
  type GetBrandRequest,
} from '@/api/controllers/brands-controller'

const brandController = new BrandsController()

ipcMain.handle('brands:list', async (_event, data: ListBrandsRequest) => await brandController.listBrands(data))

ipcMain.handle('brands:get', async (_event, data: GetBrandRequest) => await brandController.getBrand(data))

ipcMain.handle('brands:create', async (_event, data: CreateBrandRequest) => await brandController.createBrand(data))

ipcMain.handle('brands:update', async (_event, data: UpdateBrandRequest) => {
  const response = await brandController.updateBrand(data)

  return response
})

ipcMain.handle('brands:delete', async (_event, data: DeleteBrandRequest) => await brandController.deleteBrand(data))

export {}
