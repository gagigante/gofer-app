import { randomUUID } from 'node:crypto'

import { ProductsRepository } from '../repositories/products-repository'
import { UsersRepository } from '../repositories/users-repository'

import { WithoutPermissionError } from '../errors/WithoutPermissionError'
import { ProductAlreadyExistsError } from '../errors/ProductAlreadyExistsError'
import { ProductWithThisBarCodeALreadyExistsError } from '../errors/ProductWithThisBarCodeALreadyExistsError'
import { NotFoundError } from '../errors/NotFoundError'

import { type Brand, type Category, type Product } from '@/api/db/schema'
import { type Response } from '@/api/types/response'

export interface ListProductsRequest {
  loggedUserId: string
  name?: string
  page?: number
  itemsPerPage?: number
}

export type ListProductsResponse = Response<{
  products: Array<Product & { category: Category | null } & { brand: Brand | null }>
  page: number
  itemsPerPage: number
  total: number
}>

export interface GetLastProductRequest {
  loggedUserId: string
}

export type GetLastProductResponse = Response<Product | null>

export interface CreateProductRequest {
  loggedUserId: string
  barCode: string
  name: string
  description?: string
  price: number
  costPrice: number
  availableQuantity?: number
  minimumQuantity?: number
  categoryId?: string
  brandId?: string
  icms: number
  ncm: string
  cest: string
  cestSegment?: string
  cestDescription?: string
}

export type CreateProductResponse = Response<Product>

export interface UpdateProductRequest {
  loggedUserId: string
  productId: string
  barCode: string
  name: string
  description?: string
  price: number
  costPrice: number
  availableQuantity?: number
  minimumQuantity?: number
  categoryId?: string
  brandId?: string
  icms: number
  ncm: string
  cest: string
  cestSegment?: string
  cestDescription?: string
}

export type UpdateProductResponse = Response<Product>

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

  public async getLastProduct({ loggedUserId }: GetLastProductRequest): Promise<GetLastProductResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const response = await this.productsRepository.getLastProductCreated()

    return { data: response, err: null }
  }

  public async createProduct({
    loggedUserId,
    barCode,
    name,
    description = '',
    price,
    costPrice,
    availableQuantity = 0,
    minimumQuantity = 0,
    categoryId,
    brandId,
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

    const lastProduct = await this.productsRepository.getLastProductCreated()
    const newProductFastId = (lastProduct?.fastId ?? 0) + 1

    const createdProduct = await this.productsRepository.createProduct({
      id: randomUUID(),
      fastId: newProductFastId,
      barCode,
      name,
      description,
      price,
      costPrice,
      availableQuantity,
      minimumQuantity,
      categoryId: categoryId ?? null,
      brandId: brandId ?? null,
      icms,
      ncm,
      cest,
      cestSegment,
      cestDescription,
    })

    return { data: createdProduct, err: null }
  }

  public async updateProduct({
    loggedUserId,
    productId,
    barCode,
    name,
    description = '',
    price,
    costPrice,
    availableQuantity = 0,
    minimumQuantity = 0,
    categoryId,
    brandId,
    icms,
    ncm,
    cest,
    cestSegment = '',
    cestDescription = '',
  }: UpdateProductRequest): Promise<UpdateProductResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const productToBeUpdated = await this.productsRepository.getProductById(productId)

    if (!productToBeUpdated) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    let response = await this.productsRepository.getProductByName(name)

    if (response && response.id !== productId) {
      const err = new ProductAlreadyExistsError()

      return { data: null, err }
    }

    if (barCode) {
      response = await this.productsRepository.getProductByBarCode(barCode)

      if (response && response.id !== productId) {
        const err = new ProductWithThisBarCodeALreadyExistsError()

        return { data: null, err }
      }
    }

    const updatedProduct = await this.productsRepository.updateProduct({
      id: productId,
      barCode,
      fastId: productToBeUpdated.fastId,
      name,
      description,
      price,
      costPrice,
      availableQuantity,
      minimumQuantity,
      categoryId: categoryId ?? null,
      brandId: brandId ?? null,
      icms,
      ncm,
      cest,
      cestSegment,
      cestDescription,
    })

    return { data: updatedProduct, err: null }
  }
}
