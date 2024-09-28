import { randomUUID } from 'node:crypto'
import { type Category, type Product } from '@prisma/client'

import { ProductsRepository } from '../repositories/products-repository'
import { UsersRepository } from '../repositories/users-repository'

import { WithoutPermissionError } from '../errors/WithoutPermissionError'
import { ProductAlreadyExistsError } from '../errors/ProductAlreadyExistsError'
import { ProductWithThisBarCodeALreadyExistsError } from '../errors/ProductWithThisBarCodeALreadyExistsError'

import { type Response } from '@/api/types/response'

export interface ListProductsRequest {
  loggedUserId: string
  name?: string
  page?: number
  itemsPerPage?: number
}

export type ListProductsResponse = Response<{
  products: Array<Product & { category: Category | null }>
  page: number
  itemsPerPage: number
  total: number
}>

export interface CreateProductRequest {
  loggedUserId: string
  barCode: string
  name: string
  description?: string
  brand: string
  price: number
  costPrice: number
  availableQuantity?: number
  minimumQuantity?: number
  categoryId?: string
  icms: number
  ncm: string
  cest: string
  cestSegment?: string
  cestDescription?: string
}

export type CreateProductResponse = Response<Product>

export class ProductsController {
  private readonly usersRepository: UsersRepository
  private readonly productsRepository: ProductsRepository

  constructor() {
    this.usersRepository = new UsersRepository()
    this.productsRepository = new ProductsRepository()
  }

  public async listProducts({
    loggedUserId,
    name = '',
    page = 1,
    itemsPerPage = 15,
  }: ListProductsRequest): Promise<ListProductsResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const total = await this.productsRepository.countProducts(name)
    const products = await this.productsRepository.getProducts(name, page, itemsPerPage)

    const data = { products, total, page, itemsPerPage }

    return { data, err: null }
  }

  public async createProduct({
    loggedUserId,
    barCode,
    name,
    description = '',
    brand,
    price,
    costPrice,
    availableQuantity = 0,
    minimumQuantity = 0,
    categoryId,
    icms,
    ncm,
    cest,
    cestSegment = '',
    cestDescription = '',
  }: CreateProductRequest): Promise<CreateProductResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    let response = await this.productsRepository.getProductByName(name)

    if (response) {
      const err = new ProductAlreadyExistsError()

      return { data: null, err }
    }

    if (barCode) {
      response = await this.productsRepository.getProductByBarCode(barCode)

      if (response) {
        const err = new ProductWithThisBarCodeALreadyExistsError()

        return { data: null, err }
      }
    }

    const createProduct = await this.productsRepository.createProduct({
      id: randomUUID(),
      barCode,
      name,
      description,
      brand,
      price,
      costPrice,
      availableQuantity,
      minimumQuantity,
      categoryId: categoryId ?? null,
      icms,
      ncm,
      cest,
      cestSegment,
      cestDescription,
    })

    return { data: createProduct, err: null }
  }
}
