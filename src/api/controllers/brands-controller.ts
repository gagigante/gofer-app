import { randomUUID } from 'node:crypto'

import { UsersRepository } from '@/api/repositories/users-repository'
import { BrandsRepository } from '@/api/repositories/brands-repository'

import { WithoutPermissionError } from '@/api/errors/WithoutPermissionError'
import { NotFoundError } from '@/api/errors/NotFoundError'
import { BrandAlreadyExistsError } from '@/api/errors/BrandAlreadyExistsError'

import { type Response } from '@/api/types/response'
import { Product, type Brand } from '@/api/db/schema'
import { ProductsRepository } from '../repositories/products-repository'

export interface ListBrandsRequest {
  loggedUserId: string
  name?: string
  page?: number
  itemsPerPage?: number
}

export type ListBrandsResponse = Response<{
  brands: Array<Brand & { products: number }>
  page: number
  itemsPerPage: number
  total: number
}>

export interface GetBrandRequest {
  loggedUserId: string
  brandId: string
}

export type GetBrandResponse = Response<Brand & { products: Product[] }>

export interface CreateBrandRequest {
  loggedUserId: string
  name: string
}

export type CreateBrandResponse = Response<Brand>

export interface DeleteBrandRequest {
  loggedUserId: string
  brandId: string
}

export type DeleteBrandResponse = Response<null>

export interface UpdateBrandRequest {
  loggedUserId: string
  brandId: string
  updatedName: string
}

export type UpdateBrandResponse = Response<Brand>

export class BrandsController {
  private readonly usersRepository: UsersRepository
  private readonly brandsRepository: BrandsRepository
  private readonly productsRepository: ProductsRepository

  constructor() {
    this.usersRepository = new UsersRepository()
    this.brandsRepository = new BrandsRepository()
    this.productsRepository = new ProductsRepository()
  }

  public async listBrands({
    loggedUserId,
    name = '',
    page = 1,
    itemsPerPage = 15,
  }: ListBrandsRequest): Promise<ListBrandsResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const total = await this.brandsRepository.countBrands(name)
    const brands = await this.brandsRepository.getBrands(name, page, itemsPerPage)

    const data = { brands, total, page, itemsPerPage }

    return { data, err: null }
  }

  public async getBrand({ loggedUserId, brandId }: GetBrandRequest) {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const brand = await this.brandsRepository.getBrandById(brandId)

    if (!brand) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    const products = await this.productsRepository.getProductsByBrandId(brand.id)

    return { data: { ...brand, products }, err: null }
  }

  public async createBrand({ loggedUserId, name }: CreateBrandRequest): Promise<CreateBrandResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const response = await this.brandsRepository.getBrandByName(name)

    if (response) {
      const err = new BrandAlreadyExistsError()

      return { data: null, err }
    }

    const createdBrand = await this.brandsRepository.createBrand({
      id: randomUUID(),
      name,
    })

    return { data: createdBrand, err: null }
  }

  public async deleteBrand({ loggedUserId, brandId }: DeleteBrandRequest): Promise<DeleteBrandResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    const brandToDelete = await this.brandsRepository.getBrandById(brandId)

    if (!brandToDelete) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    await this.brandsRepository.deleteBrand(brandId)

    return { data: null, err: null }
  }

  public async updateBrand({ loggedUserId, brandId, updatedName }: UpdateBrandRequest): Promise<UpdateBrandResponse> {
    const loggedUser = await this.usersRepository.getUserById(loggedUserId)

    if (!loggedUser) {
      const err = new WithoutPermissionError()
      return { data: null, err }
    }

    let brandWithUpdatedName = await this.brandsRepository.getBrandById(brandId)

    if (!brandWithUpdatedName) {
      const err = new NotFoundError()

      return { data: null, err }
    }

    brandWithUpdatedName = await this.brandsRepository.getBrandByName(updatedName)

    if (brandWithUpdatedName && brandWithUpdatedName.id !== brandId) {
      const err = new BrandAlreadyExistsError()

      return { data: null, err }
    }

    const response = await this.brandsRepository.updateBrand({
      id: brandId,
      name: updatedName,
    })

    return { data: response, err: null }
  }
}
