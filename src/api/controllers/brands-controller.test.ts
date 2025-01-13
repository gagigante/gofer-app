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
})
