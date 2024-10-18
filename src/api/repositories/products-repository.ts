import { asc, count, eq, inArray, like } from 'drizzle-orm'

import { db } from '../db/client'

import { type Category, NewProduct, type Product, categories, products } from '../db/schema'

export class ProductsRepository {
  public async getProducts(
    name = '',
    page = 1,
    itemsPerPage = 15,
  ): Promise<Array<Product & { category: Category | null }>> {
    const response = await db
      .select()
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(like(products.name, `%${name}%`))
      .orderBy(asc(products.name))
      .offset(page === 1 ? 0 : (page - 1) * itemsPerPage)
      .limit(itemsPerPage)

    return response.map(item => {
      return {
        ...item.products,
        category: item.categories,        
      }
    })
  }

  public async getProductsByIds(productIds: string[]): Promise<Product[]> {
    const response = await db.select().from(products).where(inArray(products.id, productIds))

    return response
  }

  public async countProducts(name = ''): Promise<number> {
    const [response] = await db.select({ count: count() }).from(products).where(like(products.name, `%${name}%`))

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

  public async getProductByBarCode(productBarCode: string): Promise<Product | null> {
    const response = await db.select().from(products).where(eq(products.barCode, productBarCode)).get()
    
    return response ?? null    
  }

  public async createProduct({
    id,
    barCode,
    name,
    description,
    brand,
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
  }: NewProduct): Promise<Product> {
    const [response] = await db.insert(products).values({
      id,
      barCode,
      name,
      description,
      brand,
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
    }).returning()

    return response    
  }

  public async updateProduct({ id, ...data }: Product): Promise<Product> {
    const [response] = await db.update(products).set({
      ...data,
    })
    .where(eq(products.id, id))
    .returning()

    return response
  }
}
