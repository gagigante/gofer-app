import { ipcMain } from 'electron'

import { CategoriesController } from '@/api/controllers/categories-controller'

export interface ListCategoriesData {
  loggedUserId: string
  name?: string
  page?: number
  itemsPerPage?: number
}

export interface CreateCategoryData {
  loggedUserId: string
  name: string
  description: string
  productsIds?: string[]
}

export interface UpdateCategoryData {
  loggedUserId: string
  categoryId: string
  updatedName: string
  updatedDescription?: string
}

export interface DeleteCategoryData {
  loggedUserId: string
  categoryId: string
}

const categoryController = new CategoriesController()

ipcMain.handle(
  'categories:list',
  async (_event, { loggedUserId, name, page, itemsPerPage }: ListCategoriesData) =>
    await categoryController.listCategories(loggedUserId, name, page, itemsPerPage),
)

ipcMain.handle(
  'categories:create',
  async (_event, data: CreateCategoryData) =>
    await categoryController.createCategory(data.loggedUserId, data.name, data.description, data.productsIds),
)

ipcMain.handle('categories:update', async (_event, data: UpdateCategoryData) => {
  const response = await categoryController.updateCategory(
    data.loggedUserId,
    data.categoryId,
    data.updatedName,
    data.updatedDescription,
  )

  return response
})

ipcMain.handle(
  'categories:delete',
  async (_event, data: DeleteCategoryData) =>
    await categoryController.deleteCategory(data.loggedUserId, data.categoryId),
)

export {}
