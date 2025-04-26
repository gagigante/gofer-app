import { describe, test, expect, beforeEach } from 'vitest'

import { db } from '@/api/db/client'
import { users, categories, brands } from '../db/schema'

import { ProductsController } from './products-controller'

import { WithoutPermissionError } from '@/api/errors/WithoutPermissionError'
import { InvalidParamsError } from '@/api/errors/InvalidParamsError'
import { ProductAlreadyExistsError } from '@/api/errors/ProductAlreadyExistsError'
import { RepositoryError } from '@/api/errors/RepositoryError'
import { ProductWithThisBarCodeALreadyExistsError } from '@/api/errors/ProductWithThisBarCodeALreadyExistsError'

const PRODUCT_DATA = {
  barCode: '088381178655',
  name: 'test-product',
  description: 'A test product description',
  price: 200,
  costPrice: 100,
  availableQuantity: 100,
  minimumQuantity: 50,
  categoryId: undefined,
  brandId: undefined,
  icms: 100,
  ncm: '39172300',
  cest: '1000600',
  cestSegment: 'cest-segment',
  cestDescription: 'cest-description',
}

describe('products-controller', () => {
  const productsController = new ProductsController()

  beforeEach(async () => {
    await db.insert(users).values({
      id: 'test-user-id',
      name: 'test-user',
      password: 'test-user-password',
      role: 'super-admin',
    })
  })

  describe('createProduct', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await productsController.createProduct({
        loggedUserId: 'non-existing-user-id',
        ...PRODUCT_DATA,
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw InvalidParamsError if required fields are missing', async () => {
      const response = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
        name: '',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should throw ProductAlreadyExistsError if name already exists', async () => {
      const firstResponse = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
      })

      expect(firstResponse.data).not.toBeNull()
      expect(firstResponse.err).toBeNull()

      const secondResponse = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
      })

      expect(secondResponse.data).toBeNull()
      expect(secondResponse.err).toBeInstanceOf(ProductAlreadyExistsError)
    })

    test('should throw ProductAlreadyExistsError if barCode already exists', async () => {
      const firstResponse = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
      })

      expect(firstResponse.data).not.toBeNull()
      expect(firstResponse.err).toBeNull()

      const secondResponse = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
        name: 'new-product-name',
      })

      expect(secondResponse.data).toBeNull()
      expect(secondResponse.err).toBeInstanceOf(ProductWithThisBarCodeALreadyExistsError)
    })

    test('should throw RepositoryError if categoryId is provided but does not exist', async () => {
      const response = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
        categoryId: 'non-existing-category-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(RepositoryError)
    })

    test('should throw RepositoryError if brandId is provided but does not exist', async () => {
      const response = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
        brandId: 'non-existing-brand-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(RepositoryError)
    })

    test('should create product successfully with only required data', async () => {
      const requiredProductData = {
        loggedUserId: 'test-user-id',
        name: 'minimal-product',
        price: 100,
        costPrice: 50,
        availableQuantity: 10,
        minimumQuantity: 5,
        icms: 0,
        ncm: '11111111',
        cest: '1111111',
      }

      const response = await productsController.createProduct(requiredProductData)

      expect(response.data).toMatchObject({
        name: requiredProductData.name,
        barCode: null,
        price: requiredProductData.price,
        costPrice: requiredProductData.costPrice,
        availableQuantity: requiredProductData.availableQuantity,
        minimumQuantity: requiredProductData.minimumQuantity,
        icms: requiredProductData.icms,
        ncm: requiredProductData.ncm,
        cest: requiredProductData.cest,
        description: null,
        categoryId: null,
        brandId: null,
        cestSegment: null,
        cestDescription: null,
      })
      expect(response.err).toBeNull()
    })

    test('should create product successfully with valid data', async () => {
      const response = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
      })

      expect(response.data).toMatchObject({
        barCode: PRODUCT_DATA.barCode,
        name: PRODUCT_DATA.name,
        description: PRODUCT_DATA.description,
        price: PRODUCT_DATA.price,
        costPrice: PRODUCT_DATA.costPrice,
        availableQuantity: PRODUCT_DATA.availableQuantity,
        minimumQuantity: PRODUCT_DATA.minimumQuantity,
        icms: PRODUCT_DATA.icms,
        ncm: PRODUCT_DATA.ncm,
        cest: PRODUCT_DATA.cest,
        cestSegment: PRODUCT_DATA.cestSegment,
        cestDescription: PRODUCT_DATA.cestDescription,
      })
      expect(response.err).toBeNull()
    })

    test('should create product successfully with category and brand', async () => {
      await db.insert(categories).values({
        id: 'test-category-id',
        name: 'Test Category',
      })

      await db.insert(brands).values({
        id: 'test-brand-id',
        name: 'Test Brand',
      })

      const response = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
        categoryId: 'test-category-id',
        brandId: 'test-brand-id',
      })

      expect(response.data).toMatchObject({
        ...PRODUCT_DATA,
        categoryId: 'test-category-id',
        brandId: 'test-brand-id',
      })
      expect(response.err).toBeNull()
    })
  })
})
