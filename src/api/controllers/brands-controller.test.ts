import { describe, test, expect, beforeEach } from 'vitest'
import { eq } from 'drizzle-orm'

import { db } from '@/api/db/client'
import { brands, products, users } from '@/api/db/schema'

import { BrandsController } from './brands-controller'

import { WithoutPermissionError } from '../errors/WithoutPermissionError'
import { BrandAlreadyExistsError } from '../errors/BrandAlreadyExistsError'
import { NotFoundError } from '../errors/NotFoundError'
import { InvalidParamsError } from '../errors/InvalidParamsError'

describe('brands-controller', () => {
  const brandsController = new BrandsController()

  beforeEach(async () => {
    await db.insert(users).values({
      id: 'test-user-id',
      name: 'test-user',
      password: 'test-user-password',
      role: 'super-admin',
    })
  })

  describe('listBrands', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await brandsController.listBrands({
        loggedUserId: 'non-existing-user-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should be able to list brands', async () => {
      const BRANDS = [
        {
          id: 'brand-1',
          name: 'a brand',
        },
        {
          id: 'brand-2',
          name: 'b brand',
        },
        {
          id: 'brand-3',
          name: 'c brand',
        },
        {
          id: 'brand-4',
          name: 'd brand',
        },
        {
          id: 'brand-5',
          name: 'e brand',
        },
      ]

      await db.insert(brands).values(BRANDS)

      let response = await brandsController.listBrands({
        loggedUserId: 'test-user-id',
      })

      expect(response.data?.brands).length(5)
      expect(response.data?.brands).toStrictEqual(BRANDS.map((item) => ({ ...item, products: 0 })))
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(5)
      expect(response.data?.itemsPerPage).toBe(15)
      expect(response.err).toBeNull()

      response = await brandsController.listBrands({
        loggedUserId: 'test-user-id',
        page: 1,
        itemsPerPage: 2,
      })

      expect(response.data?.brands).length(2)
      expect(response.data?.brands).toStrictEqual(BRANDS.slice(0, 2).map((item) => ({ ...item, products: 0 })))
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(5)
      expect(response.data?.itemsPerPage).toBe(2)
      expect(response.err).toBeNull()

      response = await brandsController.listBrands({
        loggedUserId: 'test-user-id',
        page: 2,
        itemsPerPage: 2,
      })

      expect(response.data?.brands).length(2)
      expect(response.data?.brands).toStrictEqual(BRANDS.slice(2, 4).map((item) => ({ ...item, products: 0 })))
      expect(response.data?.page).toBe(2)
      expect(response.data?.total).toBe(5)
      expect(response.data?.itemsPerPage).toBe(2)
      expect(response.err).toBeNull()

      response = await brandsController.listBrands({
        loggedUserId: 'test-user-id',
        page: 3,
        itemsPerPage: 2,
      })

      expect(response.data?.brands).length(1)
      expect(response.data?.brands).toStrictEqual(BRANDS.slice(4, 5).map((item) => ({ ...item, products: 0 })))
      expect(response.data?.page).toBe(3)
      expect(response.data?.total).toBe(5)
      expect(response.data?.itemsPerPage).toBe(2)
      expect(response.err).toBeNull()
    })

    test('should be able to list brands with filter by name', async () => {
      const BRANDS = [
        {
          id: 'brand-1',
          name: 'a brand',
        },
        {
          id: 'brand-2',
          name: 'b brand',
        },
      ]

      await db.insert(brands).values(BRANDS)

      const response = await brandsController.listBrands({
        loggedUserId: 'test-user-id',
        name: 'a bra',
      })

      expect(response.data?.brands).length(1)
      expect(response.data?.brands).toStrictEqual([{ ...BRANDS[0], products: 0 }])
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(1)
      expect(response.data?.itemsPerPage).toBe(15)
      expect(response.err).toBeNull()
    })

    test('should be able to list brands and count the products associated to each one', async () => {
      const BRANDS = [
        {
          id: 'brand-1',
          name: 'a brand',
        },
        {
          id: 'brand-2',
          name: 'b brand',
        },
      ]

      await db.insert(brands).values(BRANDS)

      await db.insert(products).values([
        {
          id: 'product-id',
          brandId: 'brand-1',
        },
        {
          id: 'product-id-2',
          brandId: 'brand-2',
        },
      ])

      const response = await brandsController.listBrands({
        loggedUserId: 'test-user-id',
      })

      expect(response.data?.brands).length(2)
      expect(response.data?.brands).toStrictEqual(BRANDS.map((item) => ({ ...item, products: 1 })))
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(2)
      expect(response.data?.itemsPerPage).toBe(15)
      expect(response.err).toBeNull()
    })
  })

  describe('getBrand', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await brandsController.getBrand({
        loggedUserId: 'non-existing-user-id',
        brandId: 'brand-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if the provided brand id does not correspond to an existing brand', async () => {
      const response = await brandsController.getBrand({
        loggedUserId: 'test-user-id',
        brandId: 'non-existing-brand-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should be able to get a brand by its ID', async () => {
      await db.insert(brands).values({
        id: 'brand-id',
        name: 'brand name',
      })

      const response = await brandsController.getBrand({
        loggedUserId: 'test-user-id',
        brandId: 'brand-id',
      })

      expect(response.data).toStrictEqual({
        id: 'brand-id',
        name: 'brand name',
      })
      expect(response.err).toBeNull()
    })

    test('should be able to get a brand by its ID and list the products associated', async () => {
      await db.insert(brands).values({
        id: 'brand-id',
        name: 'brand name',
      })

      const response = await brandsController.getBrand({
        loggedUserId: 'test-user-id',
        brandId: 'brand-id',
      })

      expect(response.data).toStrictEqual({
        id: 'brand-id',
        name: 'brand name',
      })
      expect(response.err).toBeNull()
    })
  })

  describe('createBrand', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await brandsController.createBrand({
        loggedUserId: 'non-existing-user-id',
        name: 'brand-name',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should create a brand with success', async () => {
      const response = await brandsController.createBrand({
        loggedUserId: 'test-user-id',
        name: 'brand-name',
      })

      expect(response.data?.name).toBe('brand-name')
      expect(response.err).toBeNull()
    })

    test('should reject empty brand names', async () => {
      await db.insert(brands).values({
        id: 'brand-id',
        name: 'brand name',
      })

      const response = await brandsController.createBrand({
        loggedUserId: 'test-user-id',
        name: '',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should throw BrandAlreadyExistsError if the provided brand name already exists', async () => {
      const response = await brandsController.createBrand({
        loggedUserId: 'test-user-id',
        name: 'brand-name',
      })

      expect(response.data?.name).toBe('brand-name')
      expect(response.err).toBeNull()

      const anotherBrandWithSameName = await brandsController.createBrand({
        loggedUserId: 'test-user-id',
        name: 'brand-name',
      })

      expect(anotherBrandWithSameName.data).toBeNull()
      expect(anotherBrandWithSameName.err).toBeInstanceOf(BrandAlreadyExistsError)
    })
  })

  describe('deleteBrand', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await brandsController.deleteBrand({
        loggedUserId: 'non-existing-user-id',
        brandId: 'brand-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if the provided brand id does not correspond to an existing brand', async () => {
      const response = await brandsController.deleteBrand({
        loggedUserId: 'test-user-id',
        brandId: 'brand-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should be able to delete a brand', async () => {
      await db.insert(brands).values({
        id: 'brand-id',
        name: 'brand name',
      })

      const response = await brandsController.deleteBrand({
        loggedUserId: 'test-user-id',
        brandId: 'brand-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeNull()

      const brand = await db.select().from(brands).where(eq(brands.id, 'brand-id')).get()

      expect(brand).toBeUndefined()
    })

    test('should be able to delete a brand associated to a product', async () => {
      await db.insert(brands).values({
        id: 'brand-id',
        name: 'brand name',
      })

      await db.insert(products).values({
        id: 'product-id',
        brandId: 'brand-id',
      })

      const response = await brandsController.deleteBrand({
        loggedUserId: 'test-user-id',
        brandId: 'brand-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeNull()

      const product = await db.select().from(products).where(eq(products.id, 'product-id')).get()

      expect(product?.brandId).toBeNull()
    })
  })

  describe('updateBrand', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await brandsController.updateBrand({
        loggedUserId: 'non-existing-user-id',
        brandId: 'brand-id',
        updatedName: 'updated-brand-name',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if the provided brand id does not correspond to an existing brand', async () => {
      const response = await brandsController.updateBrand({
        loggedUserId: 'test-user-id',
        brandId: 'brand-id',
        updatedName: 'updated-brand-name',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should throw BrandAlreadyExistsError if the updated brand name is already in use by another brand', async () => {
      await db.insert(brands).values([
        {
          id: 'brand-id',
          name: 'brand name',
        },
        {
          id: 'brand-id-2',
          name: 'brand name 2',
        },
      ])

      const response = await brandsController.updateBrand({
        loggedUserId: 'test-user-id',
        brandId: 'brand-id',
        updatedName: 'brand name 2',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(BrandAlreadyExistsError)
    })

    test('should be able to update a brand', async () => {
      await db.insert(brands).values({
        id: 'brand-id',
        name: 'brand name',
      })

      const response = await brandsController.updateBrand({
        loggedUserId: 'test-user-id',
        brandId: 'brand-id',
        updatedName: 'updated brand name',
      })

      expect(response.data).toStrictEqual({
        id: 'brand-id',
        name: 'updated brand name',
      })
      expect(response.err).toBeNull()
    })

    test('should reject empty brand names', async () => {
      await db.insert(brands).values({
        id: 'brand-id',
        name: 'brand name',
      })

      const response = await brandsController.updateBrand({
        loggedUserId: 'test-user-id',
        brandId: 'brand-id',
        updatedName: '',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should allow updating to the same name', async () => {
      await db.insert(brands).values({
        id: 'brand-id',
        name: 'brand name',
      })

      const response = await brandsController.updateBrand({
        loggedUserId: 'test-user-id',
        brandId: 'brand-id',
        updatedName: 'brand name',
      })

      expect(response.data?.name).toBe('brand name')
      expect(response.err).toBeNull()
    })
  })
})
