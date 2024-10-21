import { randomUUID } from 'node:crypto'

import { UsersRepository } from '@/api/repositories/users-repository'
import { CategoriesRepository } from '@/api/repositories/categories-repository'

import { WithoutPermissionError } from '@/api/errors/WithoutPermissionError'
import { NotFoundError } from '@/api/errors/NotFoundError'
import { CategoryAlreadyExistsError } from '@/api/errors/CategoryAlreadyExistsError'

import { type Response } from '@/api/types/response'
import { Product, type Category } from '@/api/db/schema'
import { ProductsRepository } from '../repositories/products-repository'

export interface ListCategoriesRequest {
  loggedUserId: string
  name?: string
  page?: number
  itemsPerPage?: number
}

export type ListCategoriesResponse = Response<{
  categories: Array<Category & { products: number }>
  page: number
  itemsPerPage: number
  total: number
}>

export interface GetCategoryRequest {
  loggedUserId: string
  categoryId: string
}

export type GetCategoryResponse = Response<Category & { products: Product[] }>

export interface CreateCategoryRequest {
  loggedUserId: string
  name: string
  description?: string
}

export type CreateCategoryResponse = Response<Category>

export interface DeleteCategoryRequest {
  loggedUserId: string
  categoryId: string
}

export type DeleteCategoryResponse = Response<null>

export interface UpdateCategoryRequest {
  loggedUserId: string
  categoryId: string
  updatedName: string
  updatedDescription?: string
}

export type UpdateCategoryResponse = Response<Category>

export class CategoriesController {
  private readonly usersRepository: UsersRepository
  private readonly categoriesRepository: CategoriesRepository
  private readonly productsRepository: ProductsRepository

  constructor() {
    this.usersRepository = new UsersRepository()
    this.categoriesRepository = new CategoriesRepository()
    this.productsRepository = new ProductsRepository()
  }

  public async listCategories({
    loggedUserId,
    name = '',
    page = 1,
    itemsPerPage = 15,
  }: ListCategoriesRequest): Promise<ListCategoriesResponse> {
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

  public async getCategory({ loggedUserId, categoryId }: GetCategoryRequest) {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const category = await this.categoriesRepository.getCategoryById(categoryId)

    if (!category) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    const products = await this.productsRepository.getProductsByCategoryId(category.id)

    return {
      ...category,
      products,
    }
  }

  public async createCategory({
    loggedUserId,
    name,
    description = '',
  }: CreateCategoryRequest): Promise<CreateCategoryResponse> {
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
    })

    return { data: createdCategory, err: null }
  }

  public async deleteCategory({ loggedUserId, categoryId }: DeleteCategoryRequest): Promise<DeleteCategoryResponse> {
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

  public async updateCategory({
    loggedUserId,
    categoryId,
    updatedName,
    updatedDescription = '',
  }: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    let categoryWithUpdatedName = await this.categoriesRepository.getCategoryById(categoryId)

    if (!categoryWithUpdatedName) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    categoryWithUpdatedName = await this.categoriesRepository.getCategoryByName(updatedName)

    if (categoryWithUpdatedName && categoryWithUpdatedName.id !== categoryId) {
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
