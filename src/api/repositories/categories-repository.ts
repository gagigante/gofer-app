import { asc, count, desc, eq, like, sql } from 'drizzle-orm'

import { db } from '@/api/db/client'

import { type Category, type NewCategory, categories, products } from '@/api/db/schema'

export interface OrderBy {
  column: Extract<keyof Category, 'name'> | 'products'
  order: 'asc' | 'desc'
}

export class CategoriesRepository {
  public async getCategories(
    name = '',
    page = 1,
    itemsPerPage = 15,
    orderBy: OrderBy = {
      column: 'name',
      order: 'asc',
    },
  ): Promise<Array<Category & { products: number }>> {
    function getOrderBy(orderBy: OrderBy) {
      if (orderBy.order === 'asc') {
        if (orderBy.column === 'products') {
          return asc(sql<number>`COUNT(${products.id})`)
        }

        return asc(categories[orderBy.column])
      }

      if (orderBy.column === 'products') {
        return desc(sql<number>`COUNT(${products.id})`)
      }

      return desc(categories[orderBy.column])
    }

    const response = await db
      .select({
        category: categories,
        productsCount: sql<number>`COUNT(${products.id})`,
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .where(like(categories.name, `%${name}%`))
      .groupBy(categories.name)
      .orderBy(getOrderBy(orderBy))
      .offset(page === 1 ? 0 : (page - 1) * itemsPerPage)
      .limit(itemsPerPage)

    return response.reduce<Array<Category & { products: number }>>((acc, item) => {
      if (item.category.id === null) {
        return acc
      }

      return [...acc, { ...item.category, products: item.productsCount }]
    }, [])
  }

  public async countCategories(name = ''): Promise<number> {
    const [response] = await db
      .select({ count: count() })
      .from(categories)
      .where(like(categories.name, `%${name}%`))

    return response.count
  }

  public async getCategoryById(categoryId: string): Promise<Category | null> {
    const response = await db.select().from(categories).where(eq(categories.id, categoryId)).get()

    return response ?? null
  }

  public async getCategoryByName(categoryName: string): Promise<Category | null> {
    const response = await db.select().from(categories).where(eq(categories.name, categoryName)).get()

    return response ?? null
  }

  public async createCategory({ id, name, description }: NewCategory): Promise<Category> {
    const [response] = await db
      .insert(categories)
      .values({
        id,
        name,
        description,
      })
      .returning()

    return response
  }

  public async updateCategory({ id, name, description }: Category): Promise<Category> {
    const [response] = await db
      .update(categories)
      .set({
        name,
        description,
      })
      .where(eq(categories.id, id))
      .returning()

    return response
  }

  public async deleteCategory(categoryId: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, categoryId))
  }
}
