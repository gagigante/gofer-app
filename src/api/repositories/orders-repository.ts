import { count, desc, eq } from 'drizzle-orm'

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

export interface OrderResponse {
  id: string
  totalPrice: number | null
  createdAt: string | null
  customer: Customer | null
  products: Array<{
    productId: string | null
    quantity: number | null
    price: number | null
    name: string | null
    barCode: string | null
    fastId: number | null
  }>
}

export type OrderWithCustomer = Order & { customer: Customer | null }

export class OrdersRepository {
  public async getOrders(page = 1, itemsPerPage = 15, customerId?: string): Promise<OrderWithCustomer[]> {
    const response = await db
      .select()
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(customerId ? eq(orders.customerId, customerId) : undefined)
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

  public async countOrders(customerId?: string): Promise<number> {
    const [response] = await db
      .select({ count: count() })
      .from(orders)
      .where(customerId ? eq(orders.customerId, customerId) : undefined)

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
          price: ordersProducts.productPrice,
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

      return {
        ...acc,
        ...order,
        customer: item.customer,
        products: [...(acc.products ?? []), orderProduct],
      }
    }, {} as OrderResponse)

    return formattedResponse
  }

  public async createOrder({
    id,
    totalPrice,
    products,
    customerId,
  }: Omit<NewOrder, 'createdAt'> & {
    products: Array<{ id: string; quantity: number; customProductPrice: number }>
  }): Promise<Order> {
    const response = await db.transaction(async (tx) => {
      const [{ insertedOrderId }] = await tx
        .insert(orders)
        .values({ id, totalPrice, customerId })
        .returning({ insertedOrderId: orders.id })

      for (const { id, quantity, customProductPrice } of products) {
        const product = await tx.select().from(productsSchema).where(eq(productsSchema.id, id)).get()

        if (!product) {
          tx.rollback()
          return
        }

        const updatedProductAvailableQuantity = (product?.availableQuantity ?? 0) - quantity

        await tx
          .update(productsSchema)
          .set({ availableQuantity: updatedProductAvailableQuantity })
          .where(eq(productsSchema.id, product.id))

        await tx.insert(ordersProducts).values({
          orderId: insertedOrderId,
          productId: product.id,
          productPrice: product.price,
          customProductPrice,
          quantity,
        })
      }

      const response = await tx.select().from(orders).where(eq(orders.id, insertedOrderId)).get()

      return response
    })

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
}
