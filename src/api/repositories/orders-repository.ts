import { and, count, desc, eq, gte, lte, SQL } from 'drizzle-orm'

import { db } from '@/api/db/client'

import {
  type Customer,
  type NewOrder,
  type Order,
  orders,
  ordersProducts,
  customers,
  products as productsSchema,
} from '@/api/db/schema'

export type OrderResponse = Order & {
  customer: Customer | null
  products: Array<{
    productId: string | null
    quantity: number | null
    costPrice: number | null
    price: number | null
    customPrice: number | null
    currentCostPrice: number | null
    currentPrice: number | null
    obs: string | null
    name: string | null
    barCode: string | null
    fastId: number | null
  }>
}

export type OrderWithCustomer = Order & { customer: Customer | null }

type FilterOptions = {
  customerId?: string
  draft?: boolean
  startDate?: Date
  endDate?: Date
}

export class OrdersRepository {
  public async getOrders(page = 1, itemsPerPage = 15, filterOptions: FilterOptions = {}): Promise<OrderWithCustomer[]> {
    const filters = this.listFilters(filterOptions)

    const response = await db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(and(...filters))
      .orderBy(desc(orders.createdAt))
      .offset(page === 1 ? 0 : (page - 1) * itemsPerPage)
      .limit(itemsPerPage)

    return response.map((item) => {
      return {
        ...item.orders,
        customer: item.customers,
      }
    })
  }

  public async countOrders(filterOptions: FilterOptions = {}): Promise<number> {
    const filters = this.listFilters(filterOptions)

    const [response] = await db
      .select({ count: count() })
      .from(orders)
      .where(and(...filters))

    return response.count
  }

  public async getOrderById(orderId: string): Promise<OrderResponse | null> {
    const response = await db
      .select({
        order: orders,
        customer: customers,
        orderProduct: {
          productId: ordersProducts.productId,
          quantity: ordersProducts.quantity,
          costPrice: ordersProducts.productCostPrice,
          price: ordersProducts.productPrice,
          customPrice: ordersProducts.customProductPrice,
          currentCostPrice: productsSchema.costPrice,
          currentPrice: productsSchema.price,
          obs: ordersProducts.obs,
          name: productsSchema.name,
          barCode: productsSchema.barCode,
          fastId: productsSchema.fastId,
        },
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(ordersProducts, eq(orders.id, ordersProducts.orderId))
      .leftJoin(productsSchema, eq(ordersProducts.productId, productsSchema.id))
      .where(eq(orders.id, orderId))

    if (response.length === 0) return null

    const formattedResponse = response.reduce<OrderResponse>((acc, item) => {
      const { order, orderProduct } = item

      const updatedOrderProducts = acc.products ?? []
      if (orderProduct.productId !== null) {
        updatedOrderProducts.push(orderProduct)
      }

      return {
        ...acc,
        ...order,
        customer: item.customer,
        products: updatedOrderProducts,
      }
    }, {} as OrderResponse)

    return formattedResponse
  }

  public async createOrder({
    id,
    totalPrice,
    totalCostPrice,
    products,
    customerId,
    obs,
    city,
    complement,
    neighborhood,
    street,
    zipcode,
    draft,
  }: Omit<NewOrder, 'createdAt'> & {
    products: Array<{ id: string; quantity: number; customProductPrice: number; obs?: string }>
  }): Promise<Order> {
    // FIXME: Use transaction
    const [{ insertedOrderId }] = await db
      .insert(orders)
      .values({
        id,
        totalPrice,
        totalCostPrice,
        customerId,
        obs,
        city,
        complement,
        neighborhood,
        street,
        zipcode,
        draft,
      })
      .returning({ insertedOrderId: orders.id })

    for (const { id, quantity, customProductPrice, obs } of products) {
      const product = await db.select().from(productsSchema).where(eq(productsSchema.id, id)).get()

      // if (!product) {
      //   console.error('Product not found')
      //   throw new Error('Product not found')
      // }

      const updatedProductAvailableQuantity = (product?.availableQuantity ?? 0) - quantity

      await db.batch([
        db
          .update(productsSchema)
          .set({ availableQuantity: updatedProductAvailableQuantity })
          .where(eq(productsSchema.id, product!.id)),
        db.insert(ordersProducts).values({
          orderId: insertedOrderId,
          productId: product!.id,
          productCostPrice: product!.costPrice,
          productPrice: product!.price,
          customProductPrice,
          quantity,
          obs,
        }),
      ])
    }

    const response = await db.select().from(orders).where(eq(orders.id, insertedOrderId)).get()

    return response!
  }

  public async deleteOrder(orderId: string): Promise<void> {
    await db.transaction(async (tx) => {
      const orderProducts = await tx.select().from(ordersProducts).where(eq(ordersProducts.orderId, orderId))

      for (const { productId, quantity } of orderProducts) {
        if (!productId) continue

        const productToBeUpdated = await tx.select().from(productsSchema).where(eq(productsSchema.id, productId)).get()

        if (!productToBeUpdated) {
          tx.rollback()
          return
        }

        await tx
          .update(productsSchema)
          .set({ availableQuantity: (productToBeUpdated.availableQuantity ?? 0) + (quantity ?? 0) })
          .where(eq(productsSchema.id, productToBeUpdated.id))
      }

      await tx.delete(ordersProducts).where(eq(ordersProducts.orderId, orderId))

      await tx.delete(orders).where(eq(orders.id, orderId))
    })
  }

  private listFilters(filterOptions: FilterOptions = {}): SQL[] {
    const filters: SQL[] = []

    if (filterOptions.customerId) {
      filters.push(eq(orders.customerId, filterOptions.customerId))
    }

    if (filterOptions.draft !== undefined) {
      filters.push(eq(orders.draft, filterOptions.draft ? 1 : 0))
    }

    if (filterOptions.startDate) {
      filters.push(gte(orders.createdAt, filterOptions.startDate.toISOString()))
    }

    if (filterOptions.endDate) {
      filters.push(lte(orders.createdAt, filterOptions.endDate.toISOString()))
    }

    return filters
  }
}
