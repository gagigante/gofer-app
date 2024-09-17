import { randomUUID } from 'node:crypto'
import { type Category } from '@prisma/client'

import { UsersRepository } from '@/api/repositories/users-repository'
import { CategoriesRepository } from '@/api/repositories/categories-repository'

import { WithoutPermissionError } from '@/api/errors/WithoutPermissionError'
import { NotFoundError } from '@/api/errors/NotFoundError'
import { CategoryAlreadyExistsError } from '@/api/errors/CategoryAlreadyExistsError'

import { type Response } from '@/api/types/response'

export type ListCategoriesResponse = Response<{
  categories: Category[]
  page: number
  itemsPerPage: number
  total: number
}>

export type CreateCategoryResponse = Response<Category>

export type UpdateCategoryResponse = Response<Category>

export class CategoriesController {
  private readonly usersRepository: UsersRepository
  private readonly categoriesRepository: CategoriesRepository

  constructor() {
    this.usersRepository = new UsersRepository()
    this.categoriesRepository = new CategoriesRepository()
  }

  public async listCategories(
    loggedUserId: string,
    name = '',
    page = 1,
    itemsPerPage = 15,
  ): Promise<ListCategoriesResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const total = await this.categoriesRepository.countCategories(name)
    const categories = await this.categoriesRepository.getCategories(name, page, itemsPerPage)

    const data = { categories, total, page, itemsPerPage }

    return { data, err: null }
  }

  public async createCategory(
    loggedUserId: string,
    name: string,
    description: string,
    productsIds: string[] = [],
  ): Promise<CreateCategoryResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const response = await this.categoriesRepository.getCategoryByName(name)

    if (response) {
      const err = new CategoryAlreadyExistsError()

      return { data: null, err }
    }

    const createdCategory = await this.categoriesRepository.createCategory({
      id: randomUUID(),
      name,
      description,
      productsIds,
    })

    return { data: createdCategory, err: null }
  }

  public async deleteCategory(loggedUserId: string, categoryId: string): Promise<Response<null>> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const categoryToDelete = await this.categoriesRepository.getCategoryById(categoryId)

    if (!categoryToDelete) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    await this.categoriesRepository.deleteCategory(categoryId)

    return { data: null, err: null }
  }

  public async updateCategory(
    loggedUserId: string,
    categoryId: string,
    updatedName: string,
    updatedDescription = '',
  ): Promise<UpdateCategoryResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const categoryToBeUpdated = await this.categoriesRepository.getCategoryById(categoryId)

    if (!categoryToBeUpdated) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    categoryToBeUpdated = await this.categoriesRepository.getCategoryByName(updatedName)

    if (categoryToBeUpdated) {
      const err = new CategoryAlreadyExistsError()

      return { data: null, err }
    }

    const response = await this.categoriesRepository.updateCategory({
      id: categoryId,
      name: updatedName,
      description: updatedDescription,
    })

    return { data: response, err: null }
  }
}
