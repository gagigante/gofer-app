import { describe, test, expect, beforeEach } from 'vitest'

import { db } from '@/api/db/client'
import { users, categories, brands, products, type Product } from '../db/schema'

import { ProductsController } from './products-controller'

import { WithoutPermissionError } from '@/api/errors/WithoutPermissionError'
import { InvalidParamsError } from '@/api/errors/InvalidParamsError'
import { ProductAlreadyExistsError } from '@/api/errors/ProductAlreadyExistsError'
import { RepositoryError } from '@/api/errors/RepositoryError'
import { ProductWithThisBarCodeALreadyExistsError } from '@/api/errors/ProductWithThisBarCodeALreadyExistsError'
import { NotFoundError } from '@/api/errors/NotFoundError'

import { eq } from 'drizzle-orm'

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

  describe('listProducts', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await productsController.listProducts({
        loggedUserId: 'non-existing-user-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should be able to list products', async () => {
      const PRODUCTS: Product[] = [
        {
          id: 'product-1',
          name: 'a product',
          description: null,
          price: 100,
          costPrice: 50,
          availableQuantity: 10,
          minimumQuantity: 5,
          icms: 0,
          ncm: '11111111',
          cest: '1111111',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
        {
          id: 'product-2',
          name: 'b product',
          description: 'b product description',
          price: 200,
          costPrice: 100,
          availableQuantity: 20,
          minimumQuantity: 10,
          icms: 0,
          ncm: '22222222',
          cest: '2222222',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
        {
          id: 'product-3',
          name: 'c product',
          description: 'c product description',
          price: 300,
          costPrice: 150,
          availableQuantity: 30,
          minimumQuantity: 15,
          icms: 0,
          ncm: '33333333',
          cest: '3333333',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
        {
          id: 'product-4',
          name: 'd product',
          description: 'd product description',
          price: 400,
          costPrice: 200,
          availableQuantity: 40,
          minimumQuantity: 20,
          icms: 0,
          ncm: '44444444',
          cest: '4444444',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
        {
          id: 'product-5',
          name: 'e product',
          description: 'e product description',
          price: 500,
          costPrice: 250,
          availableQuantity: 50,
          minimumQuantity: 25,
          icms: 0,
          ncm: '55555555',
          cest: '5555555',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
      ]

      await db.insert(products).values(PRODUCTS)

      let response = await productsController.listProducts({
        loggedUserId: 'test-user-id',
      })

      expect(response.data?.products).length(5)
      expect(response.data?.products).toStrictEqual(
        PRODUCTS.map((product) => ({
          ...product,
          category: null,
          brand: null,
        })),
      )
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(5)
      expect(response.data?.itemsPerPage).toBe(15)
      expect(response.err).toBeNull()

      response = await productsController.listProducts({
        loggedUserId: 'test-user-id',
        page: 1,
        itemsPerPage: 2,
      })

      expect(response.data?.products).length(2)
      expect(response.data?.products).toStrictEqual(
        PRODUCTS.slice(0, 2).map((product) => ({
          ...product,
          category: null,
          brand: null,
        })),
      )
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(5)
      expect(response.data?.itemsPerPage).toBe(2)
      expect(response.err).toBeNull()

      response = await productsController.listProducts({
        loggedUserId: 'test-user-id',
        page: 2,
        itemsPerPage: 2,
      })

      expect(response.data?.products).length(2)
      expect(response.data?.products).toStrictEqual(
        PRODUCTS.slice(2, 4).map((product) => ({
          ...product,
          category: null,
          brand: null,
        })),
      )
      expect(response.data?.page).toBe(2)
      expect(response.data?.total).toBe(5)
      expect(response.data?.itemsPerPage).toBe(2)
      expect(response.err).toBeNull()

      response = await productsController.listProducts({
        loggedUserId: 'test-user-id',
        page: 3,
        itemsPerPage: 2,
      })

      expect(response.data?.products).length(1)
      expect(response.data?.products).toStrictEqual(
        PRODUCTS.slice(4, 5).map((product) => ({
          ...product,
          category: null,
          brand: null,
        })),
      )
      expect(response.data?.page).toBe(3)
      expect(response.data?.total).toBe(5)
      expect(response.data?.itemsPerPage).toBe(2)
      expect(response.err).toBeNull()
    })

    test('should be able to list products with filter by name', async () => {
      const PRODUCTS: Product[] = [
        {
          id: 'product-1',
          name: 'a product',
          description: null,
          price: 100,
          costPrice: 50,
          availableQuantity: 10,
          minimumQuantity: 5,
          icms: 0,
          ncm: '11111111',
          cest: '1111111',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
        {
          id: 'product-2',
          name: 'b product',
          description: null,
          price: 200,
          costPrice: 100,
          availableQuantity: 20,
          minimumQuantity: 10,
          icms: 0,
          ncm: '22222222',
          cest: '2222222',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
      ]

      await db.insert(products).values(PRODUCTS)

      const response = await productsController.listProducts({
        loggedUserId: 'test-user-id',
        name: 'a pro',
      })

      expect(response.data?.products).length(1)
      expect(response.data?.products).toStrictEqual([
        {
          ...PRODUCTS[0],
          category: null,
          brand: null,
        },
      ])
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(1)
      expect(response.data?.itemsPerPage).toBe(15)
      expect(response.err).toBeNull()
    })

    test('should return empty array when no products exist', async () => {
      const response = await productsController.listProducts({
        loggedUserId: 'test-user-id',
      })

      expect(response.data?.products).length(0)
      expect(response.data?.products).toStrictEqual([])
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(0)
      expect(response.data?.itemsPerPage).toBe(15)
      expect(response.err).toBeNull()
    })

    test('should handle zero items per page', async () => {
      const PRODUCTS: Product[] = [
        {
          id: 'product-1',
          name: 'a product',
          description: null,
          price: 100,
          costPrice: 50,
          availableQuantity: 10,
          minimumQuantity: 5,
          icms: 0,
          ncm: '11111111',
          cest: '1111111',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
        {
          id: 'product-2',
          name: 'b product',
          description: null,
          price: 200,
          costPrice: 100,
          availableQuantity: 20,
          minimumQuantity: 10,
          icms: 0,
          ncm: '22222222',
          cest: '2222222',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
      ]

      await db.insert(products).values(PRODUCTS)

      const response = await productsController.listProducts({
        loggedUserId: 'test-user-id',
        itemsPerPage: 0,
      })

      expect(response.data?.products).length(0)
      expect(response.data?.products).toStrictEqual([])
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(2)
      expect(response.data?.itemsPerPage).toBe(0)
      expect(response.err).toBeNull()
    })

    test('should handle negative page numbers', async () => {
      const PRODUCTS: Product[] = [
        {
          id: 'product-1',
          name: 'a product',
          description: null,
          price: 100,
          costPrice: 50,
          availableQuantity: 10,
          minimumQuantity: 5,
          icms: 0,
          ncm: '11111111',
          cest: '1111111',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
        {
          id: 'product-2',
          name: 'b product',
          description: null,
          price: 200,
          costPrice: 100,
          availableQuantity: 20,
          minimumQuantity: 10,
          icms: 0,
          ncm: '22222222',
          cest: '2222222',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
      ]

      await db.insert(products).values(PRODUCTS)

      const response = await productsController.listProducts({
        loggedUserId: 'test-user-id',
        page: -1,
        itemsPerPage: 1,
      })

      expect(response.data?.products).length(1)
      expect(response.data?.products).toStrictEqual([
        {
          ...PRODUCTS[0],
          category: null,
          brand: null,
        },
      ])
      expect(response.data?.page).toBe(-1)
      expect(response.data?.total).toBe(2)
      expect(response.data?.itemsPerPage).toBe(1)
      expect(response.err).toBeNull()
    })

    test('should handle very large page numbers', async () => {
      const PRODUCTS: Product[] = [
        {
          id: 'product-1',
          name: 'a product',
          description: null,
          price: 100,
          costPrice: 50,
          availableQuantity: 10,
          minimumQuantity: 5,
          icms: 0,
          ncm: '11111111',
          cest: '1111111',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
        {
          id: 'product-2',
          name: 'b product',
          description: null,
          price: 200,
          costPrice: 100,
          availableQuantity: 20,
          minimumQuantity: 10,
          icms: 0,
          ncm: '22222222',
          cest: '2222222',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
      ]

      await db.insert(products).values(PRODUCTS)

      const response = await productsController.listProducts({
        loggedUserId: 'test-user-id',
        page: 999999,
        itemsPerPage: 1,
      })

      expect(response.data?.products).length(0)
      expect(response.data?.products).toStrictEqual([])
      expect(response.data?.page).toBe(999999)
      expect(response.data?.total).toBe(2)
      expect(response.data?.itemsPerPage).toBe(1)
      expect(response.err).toBeNull()
    })

    test('should handle negative items per page', async () => {
      const PRODUCTS: Product[] = [
        {
          id: 'product-1',
          name: 'a product',
          description: null,
          price: 100,
          costPrice: 50,
          availableQuantity: 10,
          minimumQuantity: 5,
          icms: 0,
          ncm: '11111111',
          cest: '1111111',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
        {
          id: 'product-2',
          name: 'b product',
          description: null,
          price: 200,
          costPrice: 100,
          availableQuantity: 20,
          minimumQuantity: 10,
          icms: 0,
          ncm: '22222222',
          cest: '2222222',
          fastId: null,
          barCode: null,
          categoryId: null,
          brandId: null,
          cestSegment: null,
          cestDescription: null,
        },
      ]

      await db.insert(products).values(PRODUCTS)

      const response = await productsController.listProducts({
        loggedUserId: 'test-user-id',
        itemsPerPage: -1,
      })

      expect(response.data?.products).length(2)
      expect(response.data?.products).toStrictEqual(
        PRODUCTS.map((product) => ({
          ...product,
          category: null,
          brand: null,
        })),
      )
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(2)
      expect(response.data?.itemsPerPage).toBe(-1)
      expect(response.err).toBeNull()
    })
  })

  describe('getByBarCode', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await productsController.getByBarCode({
        loggedUserId: 'non-existing-user-id',
        barcode: '123456789',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if product with barcode does not exist', async () => {
      const response = await productsController.getByBarCode({
        loggedUserId: 'test-user-id',
        barcode: 'non-existing-barcode',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should return product when barcode exists', async () => {
      // First create a product
      const createResponse = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
      })

      expect(createResponse.data).not.toBeNull()
      expect(createResponse.err).toBeNull()

      // Then try to get it by barcode
      const response = await productsController.getByBarCode({
        loggedUserId: 'test-user-id',
        barcode: PRODUCT_DATA.barCode!,
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
  })

  describe('getLastProduct', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await productsController.getLastProduct({
        loggedUserId: 'non-existing-user-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should return null when no products exist', async () => {
      const response = await productsController.getLastProduct({
        loggedUserId: 'test-user-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeNull()
    })

    test('should return the last created product', async () => {
      // Create first product
      const firstProductResponse = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
        name: 'first-product',
        barCode: '088381178655',
      })

      expect(firstProductResponse.data).not.toBeNull()
      expect(firstProductResponse.err).toBeNull()

      // Create second product
      const secondProductResponse = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
        name: 'second-product',
        barCode: '088381178656',
      })

      expect(secondProductResponse.data).not.toBeNull()
      expect(secondProductResponse.err).toBeNull()

      // Get last product
      const response = await productsController.getLastProduct({
        loggedUserId: 'test-user-id',
      })

      expect(response.data).toMatchObject({
        name: 'second-product',
        barCode: '088381178656',
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
  })

  describe('updateProduct', () => {
    let existingProduct: Product

    beforeEach(async () => {
      // Create a product to update
      const createResponse = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
      })

      existingProduct = createResponse.data!
    })

    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await productsController.updateProduct({
        loggedUserId: 'non-existing-user-id',
        productId: existingProduct.id,
        ...PRODUCT_DATA,
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if product does not exist', async () => {
      const response = await productsController.updateProduct({
        loggedUserId: 'test-user-id',
        productId: 'non-existing-product-id',
        ...PRODUCT_DATA,
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should throw ProductAlreadyExistsError if name already exists in another product', async () => {
      // Create another product with a different name
      const secondProductResponse = await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
        name: 'another-product',
        barCode: '123456789012',
      })

      expect(secondProductResponse.data).not.toBeNull()
      expect(secondProductResponse.err).toBeNull()

      // Try to update the first product with the name of the second product
      const response = await productsController.updateProduct({
        loggedUserId: 'test-user-id',
        productId: existingProduct.id,
        ...PRODUCT_DATA,
        name: 'another-product',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(ProductAlreadyExistsError)
    })

    test('should throw ProductWithThisBarCodeALreadyExistsError if barCode already exists in another product', async () => {
      // Create another product with a different barCode
      await productsController.createProduct({
        loggedUserId: 'test-user-id',
        ...PRODUCT_DATA,
        name: 'another-product',
        barCode: '123456789012',
      })

      // Try to update the first product with the barCode of the second product
      const response = await productsController.updateProduct({
        loggedUserId: 'test-user-id',
        productId: existingProduct.id,
        ...PRODUCT_DATA,
        barCode: '123456789012',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(ProductWithThisBarCodeALreadyExistsError)
    })

    test('should throw RepositoryError if categoryId is provided but does not exist', async () => {
      // First ensure the product has no category
      await db.update(products).set({ categoryId: null }).where(eq(products.id, existingProduct.id))

      const response = await productsController.updateProduct({
        loggedUserId: 'test-user-id',
        productId: existingProduct.id,
        ...PRODUCT_DATA,
        categoryId: 'non-existing-category-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(RepositoryError)
    })

    test('should throw RepositoryError if brandId is provided but does not exist', async () => {
      const response = await productsController.updateProduct({
        loggedUserId: 'test-user-id',
        productId: existingProduct.id,
        ...PRODUCT_DATA,
        brandId: 'non-existing-brand-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(RepositoryError)
    })

    test('should update product successfully with only required data', async () => {
      const requiredProductData = {
        loggedUserId: 'test-user-id',
        productId: existingProduct.id,
        name: 'updated-minimal-product',
        price: 150,
        costPrice: 75,
        availableQuantity: 15,
        minimumQuantity: 8,
        icms: 0,
        ncm: '22222222',
        cest: '2222222',
      }

      const response = await productsController.updateProduct(requiredProductData)

      expect(response.data).toMatchObject({
        id: existingProduct.id,
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

    test('should update product successfully with valid data', async () => {
      const updatedData = {
        ...PRODUCT_DATA,
        name: 'updated-product-name',
        price: 250,
        costPrice: 125,
      }

      const response = await productsController.updateProduct({
        loggedUserId: 'test-user-id',
        productId: existingProduct.id,
        ...updatedData,
      })

      expect(response.data).toMatchObject({
        id: existingProduct.id,
        barCode: updatedData.barCode,
        name: updatedData.name,
        description: updatedData.description,
        price: updatedData.price,
        costPrice: updatedData.costPrice,
        availableQuantity: updatedData.availableQuantity,
        minimumQuantity: updatedData.minimumQuantity,
        icms: updatedData.icms,
        ncm: updatedData.ncm,
        cest: updatedData.cest,
        cestSegment: updatedData.cestSegment,
        cestDescription: updatedData.cestDescription,
      })
      expect(response.err).toBeNull()
    })

    test('should update product successfully with category and brand', async () => {
      await db.insert(categories).values({
        id: 'test-category-id',
        name: 'Test Category',
      })

      await db.insert(brands).values({
        id: 'test-brand-id',
        name: 'Test Brand',
      })

      const response = await productsController.updateProduct({
        loggedUserId: 'test-user-id',
        productId: existingProduct.id,
        ...PRODUCT_DATA,
        categoryId: 'test-category-id',
        brandId: 'test-brand-id',
      })

      expect(response.data).toMatchObject({
        id: existingProduct.id,
        ...PRODUCT_DATA,
        categoryId: 'test-category-id',
        brandId: 'test-brand-id',
      })
      expect(response.err).toBeNull()
    })
  })
})
