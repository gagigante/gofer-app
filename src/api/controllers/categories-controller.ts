import { randomUUID } from 'node:crypto'

import { UsersRepository } from '@/api/repositories/users-repository'
import { CategoriesRepository } from '@/api/repositories/categories-repository'
import { ProductsRepository } from '@/api/repositories/products-repository'
import { AuthMiddleware } from '@/api/middlewares/auth'

import { NotFoundError } from '@/api/errors/NotFoundError'
import { CategoryAlreadyExistsError } from '@/api/errors/CategoryAlreadyExistsError'
import { InvalidParamsError } from '../errors/InvalidParamsError'

import { type Response } from '@/api/types/response'
import { Product, type Category } from '@/api/db/schema'

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
  private readonly authMiddleware: AuthMiddleware

  constructor() {
    this.usersRepository = new UsersRepository()
    this.categoriesRepository = new CategoriesRepository()
    this.productsRepository = new ProductsRepository()
    this.authMiddleware = new AuthMiddleware(this.usersRepository)
  }

  public async listCategories({
    loggedUserId,
    name = '',
    page = 1,
    itemsPerPage = 15,
  }: ListCategoriesRequest): Promise<ListCategoriesResponse> {
    const { err } = await this.authMiddleware.handle(loggedUserId)
    if (err) {
      return { data: null, err }
    }

    const total = await this.categoriesRepository.countCategories(name)
    const categories = await this.categoriesRepository.getCategories(name, page, itemsPerPage)

    const data = { categories, total, page, itemsPerPage }

    return { data, err: null }
  }

  public async getCategory({ loggedUserId, categoryId }: GetCategoryRequest) {
    const { err } = await this.authMiddleware.handle(loggedUserId)
    if (err) {
      return { data: null, err }
    }

    const category = await this.categoriesRepository.getCategoryById(categoryId)

    if (!category) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    const products = await this.productsRepository.getProductsByCategoryId(category.id)

    return { data: { ...category, products }, err: null }
  }

  public async createCategory({
    loggedUserId,
    name,
    description = '',
  }: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const { err } = await this.authMiddleware.handle(loggedUserId)
    if (err) {
      return { data: null, err }
    }

    if (name.trim() === '') {
      const err = new InvalidParamsError()

      return { data: null, err }
    }

    const response = await this.categoriesRepository.getCategoryByName(name)

    if (response) {
      const err = new CategoryAlreadyExistsError()

      return { data: null, err }
    }

    const createdCategory = await this.categoriesRepository.createCategory({
      id: randomUUID(),
      name: name.trim(),
      description: description.trim(),
    })

    return { data: createdCategory, err: null }
  }

  public async deleteCategory({ loggedUserId, categoryId }: DeleteCategoryRequest): Promise<DeleteCategoryResponse> {
    const { err } = await this.authMiddleware.handle(loggedUserId)
    if (err) {
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
    const { err } = await this.authMiddleware.handle(loggedUserId)
    if (err) {
      return { data: null, err }
    }

    if (updatedName.trim() === '') {
      const err = new InvalidParamsError()

      return { data: null, err }
    }

    let categoryWithUpdatedName = await this.categoriesRepository.getCategoryById(categoryId)

    if (!categoryWithUpdatedName) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    categoryWithUpdatedName = await this.categoriesRepository.getCategoryByName(updatedName.trim())

    if (categoryWithUpdatedName && categoryWithUpdatedName.id !== categoryId) {
      const err = new CategoryAlreadyExistsError()

      return { data: null, err }
    }

    const response = await this.categoriesRepository.updateCategory({
      id: categoryId,
      name: updatedName.trim(),
      description: updatedDescription.trim(),
    })

    return { data: response, err: null }
  }
}
