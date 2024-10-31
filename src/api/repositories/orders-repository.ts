import { count, desc, eq } from 'drizzle-orm'

import { db } from '@/api/db/client'

import { type NewOrder, type Order, orders, ordersProducts, products as productsSchema } from '@/api/db/schema'

interface OrderResponse {
  id: string
  totalPrice: number | null
  createdAt: string | null
  products: Array<{
    productId: string | null
    quantity: number | null
    price: number | null
    name: string | null
    barCode: string | null
  }>
}

export class OrdersRepository {
  public async getOrders(page = 1, itemsPerPage = 15): Promise<any> {
    const response = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .offset(page === 1 ? 0 : (page - 1) * itemsPerPage)
      .limit(itemsPerPage)

    return response
  }

  public async countOrders(): Promise<number> {
    const [response] = await db.select({ count: count() }).from(orders)

    return response.count
  }

  public async getOrderById(orderId: string): Promise<OrderResponse | null> {
    const response = await db
      .select({
        order: orders,
        orderProduct: {
          productId: ordersProducts.productId,
          quantity: ordersProducts.quantity,
          price: ordersProducts.productPrice,
          name: productsSchema.name,
          barCode: productsSchema.barCode,
        },
      })
      .from(orders)
      .leftJoin(ordersProducts, eq(orders.id, ordersProducts.orderId))
      .leftJoin(productsSchema, eq(ordersProducts.productId, productsSchema.id))
      .where(eq(orders.id, orderId))

    if (response.length === 0) return null

    const formattedResponse = response.reduce<OrderResponse>((acc, item) => {
      const { order, orderProduct } = item

      return {
        ...acc,
        ...order,
        products: [...(acc.products ?? []), orderProduct],
      }
    }, {} as OrderResponse)

    return formattedResponse
  }

  public async createOrder({
    id,
    totalPrice,
    products,
  }: Omit<NewOrder, 'createdAt'> & { products: Array<{ id: string; quantity: number }> }): Promise<Order> {
    const response = await db.transaction(async (tx) => {
      const [{ insertedOrderId }] = await tx
        .insert(orders)
        .values({ id, totalPrice })
        .returning({ insertedOrderId: orders.id })

      for (const { id, quantity } of products) {
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
          quantity: quantity,
        })
      }

      const response = await tx.select().from(orders).where(eq(orders.id, insertedOrderId)).get()

      return response
    })

    return response!
  }
}
