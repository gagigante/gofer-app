import { and, asc, count, eq, inArray, like, max, SQL } from 'drizzle-orm'
import { type LibsqlError } from '@libsql/client'

import { db } from '../db/client'

import { RepositoryError } from '@/api/errors/RepositoryError'

import { type Response } from '@/api/types/response'
import { type Brand, type Category, NewProduct, type Product, brands, categories, products } from '../db/schema'

export type ProductWithCategoryAndBrand = Product & { category: Category | null } & { brand: Brand | null }

export class ProductsRepository {
  public async getProducts(
    page = 1,
    itemsPerPage = 15,
    filterOptions: {
      ids?: string[]
      name?: string
    } = {},
  ): Promise<Array<ProductWithCategoryAndBrand>> {
    const filters = this.listFilters(filterOptions)

    const response = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(and(...filters))
      .orderBy(asc(products.name))
      .offset(page === 1 ? 0 : (page - 1) * itemsPerPage)
      .limit(itemsPerPage)

    return response.map((item) => {
      return {
        ...item.products,
        category: item.categories,
        brand: item.brands,
      }
    })
  }

  public async getProductsByCategoryId(categoryId: string): Promise<Product[]> {
    const response = await db.select().from(products).where(eq(products.categoryId, categoryId))

    return response
  }

  public async getProductsByBrandId(brandId: string): Promise<Product[]> {
    const response = await db.select().from(products).where(eq(products.brandId, brandId))

    return response
  }

  public async countProducts(
    filterOptions: {
      ids?: string[]
      name?: string
    } = {},
  ): Promise<number> {
    const filters = this.listFilters(filterOptions)

    const [response] = await db
      .select({ count: count() })
      .from(products)
      .where(and(...filters))

    return response.count
  }

  public async getProductById(productId: string): Promise<Product | null> {
    const response = await db.select().from(products).where(eq(products.id, productId)).get()

    return response ?? null
  }

  public async getProductByName(productName: string): Promise<Product | null> {
    const response = await db.select().from(products).where(eq(products.name, productName)).get()

    return response ?? null
  }

  public async getProductByBarCode(productBarCode: string): Promise<ProductWithCategoryAndBrand | null> {
    const response = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(eq(products.barCode, productBarCode))
      .get()

    if (!response) return null

    return {
      ...response.products,
      category: response.categories,
      brand: response.brands,
    }
  }

  public async getLastProductCreated(): Promise<Product | null> {
    const response = await db
      .select({ products, value: max(products.fastId) })
      .from(products)
      .get()

    return response?.products ?? null
  }

  public async createProduct({
    id,
    fastId,
    barCode,
    name,
    description,
    price,
    costPrice,
    availableQuantity,
    minimumQuantity,
    categoryId,
    brandId,
    icms,
    ncm,
    cest,
    cestSegment,
    cestDescription,
  }: NewProduct): Promise<Response<Product>> {
    try {
      const [response] = await db
        .insert(products)
        .values({
          id,
          fastId,
          barCode,
          name,
          description,
          brandId,
          price,
          costPrice,
          availableQuantity,
          minimumQuantity,
          categoryId,
          icms,
          ncm,
          cest,
          cestSegment,
          cestDescription,
        })
        .returning()

      return { data: response, err: null }
    } catch (error) {
      return { data: null, err: new RepositoryError(error as LibsqlError) }
    }
  }

  public async updateProduct({ id, ...data }: Product): Promise<Product> {
    const [response] = await db
      .update(products)
      .set({
        ...data,
      })
      .where(eq(products.id, id))
      .returning()

    return response
  }

  private listFilters(filterOptions: { ids?: string[]; name?: string }): SQL[] {
    const filters: SQL[] = []

    if (filterOptions.ids) filters.push(inArray(products.id, filterOptions.ids))
    if (filterOptions.name) filters.push(like(products.name, `%${filterOptions.name}%`))

    return filters
  }
}
