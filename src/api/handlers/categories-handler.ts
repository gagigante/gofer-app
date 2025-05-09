import { ipcMain } from 'electron'

import {
  CategoriesController,
  type ListCategoriesRequest,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
  type DeleteCategoryRequest,
  type GetCategoryRequest,
} from '@/api/controllers/categories-controller'

const categoryController = new CategoriesController()

ipcMain.handle(
  'categories:list',
  async (_event, data: ListCategoriesRequest) => await categoryController.listCategories(data),
)

ipcMain.handle('categories:get', async (_event, data: GetCategoryRequest) => await categoryController.getCategory(data))

ipcMain.handle(
  'categories:create',
  async (_event, data: CreateCategoryRequest) => await categoryController.createCategory(data),
)

ipcMain.handle('categories:update', async (_event, data: UpdateCategoryRequest) => {
  const response = await categoryController.updateCategory(data)

  return response
})

ipcMain.handle(
  'categories:delete',
  async (_event, data: DeleteCategoryRequest) => await categoryController.deleteCategory(data),
)

export {}
