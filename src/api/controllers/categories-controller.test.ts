import { beforeEach, describe, expect, test } from 'vitest'

import { db } from '@/api/db/client'
import { categories, products, users } from '@/api/db/schema'

import { CategoriesController } from './categories-controller'

import { WithoutPermissionError } from '../errors/WithoutPermissionError'
import { InvalidParamsError } from '../errors/InvalidParamsError'
import { CategoryAlreadyExistsError } from '../errors/CategoryAlreadyExistsError'
import { NotFoundError } from '../errors/NotFoundError'
import { eq } from 'drizzle-orm'

describe('categories-controller', () => {
  const categoriesController = new CategoriesController()

  beforeEach(async () => {
    await db.insert(users).values({
      id: 'test-user-id',
      name: 'test-user',
      password: 'test-user-password',
      role: 'super-admin',
    })
  })

  describe('listCategories', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await categoriesController.listCategories({
        loggedUserId: 'non-existing-user-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should be able to list categories', async () => {
      const CATEGORIES = [
        {
          id: 'category-1',
          name: 'a category',
          description: null,
        },
        {
          id: 'category-2',
          name: 'b category',
          description: 'b category description',
        },
        {
          id: 'category-3',
          name: 'c category',
          description: 'c category description',
        },
        {
          id: 'category-4',
          name: 'd category',
          description: 'd category description',
        },
        {
          id: 'category-5',
          name: 'e category',
          description: 'e category description',
        },
      ]

      await db.insert(categories).values(CATEGORIES)

      let response = await categoriesController.listCategories({
        loggedUserId: 'test-user-id',
      })

      expect(response.data?.categories).length(5)
      expect(response.data?.categories).toStrictEqual(CATEGORIES.map((item) => ({ ...item, products: 0 })))
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(5)
      expect(response.data?.itemsPerPage).toBe(15)
      expect(response.err).toBeNull()

      response = await categoriesController.listCategories({
        loggedUserId: 'test-user-id',
        page: 1,
        itemsPerPage: 2,
      })

      expect(response.data?.categories).length(2)
      expect(response.data?.categories).toStrictEqual(CATEGORIES.slice(0, 2).map((item) => ({ ...item, products: 0 })))
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(5)
      expect(response.data?.itemsPerPage).toBe(2)
      expect(response.err).toBeNull()

      response = await categoriesController.listCategories({
        loggedUserId: 'test-user-id',
        page: 2,
        itemsPerPage: 2,
      })

      expect(response.data?.categories).length(2)
      expect(response.data?.categories).toStrictEqual(CATEGORIES.slice(2, 4).map((item) => ({ ...item, products: 0 })))
      expect(response.data?.page).toBe(2)
      expect(response.data?.total).toBe(5)
      expect(response.data?.itemsPerPage).toBe(2)
      expect(response.err).toBeNull()

      response = await categoriesController.listCategories({
        loggedUserId: 'test-user-id',
        page: 3,
        itemsPerPage: 2,
      })

      expect(response.data?.categories).length(1)
      expect(response.data?.categories).toStrictEqual(CATEGORIES.slice(4, 5).map((item) => ({ ...item, products: 0 })))
      expect(response.data?.page).toBe(3)
      expect(response.data?.total).toBe(5)
      expect(response.data?.itemsPerPage).toBe(2)
      expect(response.err).toBeNull()
    })

    test('should be able to list categories with filter by name', async () => {
      const CATEGORIES = [
        {
          id: 'category-1',
          name: 'a category',
          description: null,
        },
        {
          id: 'category-2',
          name: 'b category',
          description: null,
        },
      ]

      await db.insert(categories).values(CATEGORIES)

      const response = await categoriesController.listCategories({
        loggedUserId: 'test-user-id',
        name: 'a cat',
      })

      expect(response.data?.categories).length(1)
      expect(response.data?.categories).toStrictEqual([{ ...CATEGORIES[0], products: 0 }])
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(1)
      expect(response.data?.itemsPerPage).toBe(15)
      expect(response.err).toBeNull()
    })

    test('should be able to list categories and count the products associated to each one', async () => {
      const CATEGORIES = [
        {
          id: 'category-1',
          name: 'a category',
          description: null,
        },
        {
          id: 'category-2',
          name: 'b category',
          description: null,
        },
      ]

      await db.insert(categories).values(CATEGORIES)

      await db.insert(products).values([
        {
          id: 'product-id',
          categoryId: 'category-1',
        },
        {
          id: 'product-id-2',
          categoryId: 'category-2',
        },
      ])

      const response = await categoriesController.listCategories({
        loggedUserId: 'test-user-id',
      })

      expect(response.data?.categories).length(2)
      expect(response.data?.categories).toStrictEqual(CATEGORIES.map((item) => ({ ...item, products: 1 })))
      expect(response.data?.page).toBe(1)
      expect(response.data?.total).toBe(2)
      expect(response.data?.itemsPerPage).toBe(15)
      expect(response.err).toBeNull()
    })
  })

  describe('getCategory', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await categoriesController.getCategory({
        loggedUserId: 'non-existing-user-id',
        categoryId: 'category-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if the provided category id does not correspond to an existing category', async () => {
      const response = await categoriesController.getCategory({
        loggedUserId: 'test-user-id',
        categoryId: 'non-existing-category-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should be able to get a category by its ID', async () => {
      await db.insert(categories).values({
        id: 'category-id',
        name: 'category name',
      })

      const response = await categoriesController.getCategory({
        loggedUserId: 'test-user-id',
        categoryId: 'category-id',
      })

      expect(response.data).toStrictEqual({
        id: 'category-id',
        name: 'category name',
        description: null,
        products: [],
      })
      expect(response.err).toBeNull()
    })

    test('should be able to get a category by its ID and list the products associated', async () => {
      await db.insert(categories).values({
        id: 'category-id',
        name: 'category name',
      })

      await db.insert(products).values({
        id: 'product-id',
        categoryId: 'category-id',
      })

      const response = await categoriesController.getCategory({
        loggedUserId: 'test-user-id',
        categoryId: 'category-id',
      })

      expect(response.data).toStrictEqual({
        id: 'category-id',
        name: 'category name',
        description: null,
        products: [
          {
            id: 'product-id',
            availableQuantity: 0,
            barCode: null,
            brandId: null,
            categoryId: 'category-id',
            cest: null,
            cestDescription: null,
            cestSegment: null,
            costPrice: null,
            description: null,
            fastId: null,
            icms: null,
            minimumQuantity: 0,
            name: null,
            ncm: null,
            price: 0,
          },
        ],
      })
      expect(response.err).toBeNull()
    })
  })

  describe('createCategory', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await categoriesController.createCategory({
        loggedUserId: 'non-existing-user-id',
        name: 'category-name',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw InvalidParamsError if the provided category name is an empty string', async () => {
      const response = await categoriesController.createCategory({
        loggedUserId: 'test-user-id',
        name: '',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should create category with success', async () => {
      const response = await categoriesController.createCategory({
        loggedUserId: 'test-user-id',
        name: 'category-name',
        description: 'category-description',
      })

      expect(response.data?.name).toBe('category-name')
      expect(response.data?.description).toBe('category-description')
      expect(response.err).toBeNull()
    })

    test('should throw CategoryAlreadyExistsError if the provided category name already exists', async () => {
      const response = await categoriesController.createCategory({
        loggedUserId: 'test-user-id',
        name: 'category-name',
      })

      expect(response.data?.name).toBe('category-name')
      expect(response.err).toBeNull()

      const anotherCategoryWithSameName = await categoriesController.createCategory({
        loggedUserId: 'test-user-id',
        name: 'category-name',
      })

      expect(anotherCategoryWithSameName.data).toBeNull()
      expect(anotherCategoryWithSameName.err).toBeInstanceOf(CategoryAlreadyExistsError)
    })
  })

  describe('deleteCategory', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await categoriesController.deleteCategory({
        loggedUserId: 'non-existing-user-id',
        categoryId: 'category-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if the provided category id does not correspond to an existing category', async () => {
      const response = await categoriesController.deleteCategory({
        loggedUserId: 'test-user-id',
        categoryId: 'category-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should be able to delete a category', async () => {
      await db.insert(categories).values({
        id: 'category-id',
        name: 'category name',
      })

      const response = await categoriesController.deleteCategory({
        loggedUserId: 'test-user-id',
        categoryId: 'category-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeNull()

      const category = await db.select().from(categories).where(eq(categories.id, 'category-id')).get()

      expect(category).toBeUndefined()
    })

    test('should be able to delete a category associated to a product', async () => {
      await db.insert(categories).values({
        id: 'category-id',
        name: 'category name',
      })

      await db.insert(products).values({
        id: 'product-id',
        categoryId: 'category-id',
      })

      const response = await categoriesController.deleteCategory({
        loggedUserId: 'test-user-id',
        categoryId: 'category-id',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeNull()

      const product = await db.select().from(products).where(eq(products.id, 'product-id')).get()

      expect(product?.categoryId).toBeNull()
    })
  })

  describe('updateCategory', () => {
    test('should throw WithoutPermissionError if loggedUserId does not correspond to an user', async () => {
      const response = await categoriesController.updateCategory({
        loggedUserId: 'non-existing-user-id',
        categoryId: 'category-id',
        updatedName: 'updated-category-name',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(WithoutPermissionError)
    })

    test('should throw NotFoundError if the provided category id does not correspond to an existing category', async () => {
      const response = await categoriesController.updateCategory({
        loggedUserId: 'test-user-id',
        categoryId: 'category-id',
        updatedName: 'updated-category-name',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(NotFoundError)
    })

    test('should throw CategoryAlreadyExistsError if the updated category name is already in use by another category', async () => {
      await db.insert(categories).values([
        {
          id: 'category-id',
          name: 'category name',
        },
        {
          id: 'category-id-2',
          name: 'category name 2',
        },
      ])

      const response = await categoriesController.updateCategory({
        loggedUserId: 'test-user-id',
        categoryId: 'category-id',
        updatedName: 'category name 2',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(CategoryAlreadyExistsError)
    })

    test('should throw InvalidParamsError if the provided category name is an empty string', async () => {
      const response = await categoriesController.createCategory({
        loggedUserId: 'test-user-id',
        name: '',
      })

      expect(response.data).toBeNull()
      expect(response.err).toBeInstanceOf(InvalidParamsError)
    })

    test('should be able to update a category', async () => {
      await db.insert(categories).values({
        id: 'category-id',
        name: 'category name',
        description: 'category description',
      })

      const response = await categoriesController.updateCategory({
        loggedUserId: 'test-user-id',
        categoryId: 'category-id',
        updatedName: 'updated category name',
        updatedDescription: 'updated category description',
      })

      expect(response.data).toStrictEqual({
        id: 'category-id',
        name: 'updated category name',
        description: 'updated category description',
      })
      expect(response.err).toBeNull()
    })
  })
})
