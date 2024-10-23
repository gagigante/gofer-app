import { asc, count, eq, like, sql } from 'drizzle-orm'

import { db } from '@/api/db/client'

import { type Brand, type NewBrand, brands, products } from '@/api/db/schema'

export class BrandsRepository {
  public async getBrands(name = '', page = 1, itemsPerPage = 15): Promise<Array<Brand & { products: number }>> {
    const response = await db
      .select({
        brand: brands,
        productsCount: sql<number>`COUNT(${products.id})`,
      })
      .from(brands)
      .leftJoin(products, eq(brands.id, products.brandId))
      .where(like(brands.name, `%${name}%`))
      .groupBy(brands.name)
      .orderBy(asc(brands.name))
      .offset(page === 1 ? 0 : (page - 1) * itemsPerPage)
      .limit(itemsPerPage)

    return response.reduce<Array<Brand & { products: number }>>((acc, item) => {
      if (item.brand.id === null) {
        return acc
      }

      return [...acc, { ...item.brand, products: item.productsCount }]
    }, [])
  }

  public async countBrands(name = ''): Promise<number> {
    const [response] = await db
      .select({ count: count() })
      .from(brands)
      .where(like(brands.name, `%${name}%`))

    return response.count
  }

  public async getBrandById(brandId: string): Promise<Brand | null> {
    const response = await db.select().from(brands).where(eq(brands.id, brandId)).get()

    return response ?? null
  }

  public async getBrandByName(brandName: string): Promise<Brand | null> {
    const response = await db.select().from(brands).where(eq(brands.name, brandName)).get()

    return response ?? null
  }

  public async createBrand({ id, name }: NewBrand): Promise<Brand> {
    const [response] = await db
      .insert(brands)
      .values({
        id,
        name,
      })
      .returning()

    return response
  }

  public async updateBrand({ id, name }: Brand): Promise<Brand> {
    const [response] = await db
      .update(brands)
      .set({
        name,
      })
      .where(eq(brands.id, id))
      .returning()

    return response
  }

  public async deleteBrand(brandId: string): Promise<void> {
    await db.delete(brands).where(eq(brands.id, brandId))
  }
}
