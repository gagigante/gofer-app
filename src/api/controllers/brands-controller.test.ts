import { describe, test, expect, beforeEach } from 'vitest'
import { eq } from 'drizzle-orm'

import { db } from '../db/client'
import { brands, products, users } from '../db/schema'

import { BrandsController } from './brands-controller'

import { WithoutPermissionError } from '../errors/WithoutPermissionError'
import { BrandAlreadyExistsError } from '../errors/BrandAlreadyExistsError'
import { NotFoundError } from '../errors/NotFoundError'

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
        updatedName: 'updated-brand-name'
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if the provided brand id does not correspond to an existing brand', async () => {
      const response = await brandsController.updateBrand({
        loggedUserId: 'test-user-id',
        brandId: 'brand-id',
        updatedName: 'updated-brand-name'
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
        }
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
        updatedName: 'updated brand name'
      })

      expect(response.data).toStrictEqual({
        id: 'brand-id',
        name: 'updated brand name'
      })
      expect(response.err).toBeNull()
    })
  })
})
