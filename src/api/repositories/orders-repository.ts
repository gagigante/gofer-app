import { eq } from 'drizzle-orm'

import { db } from '@/api/db/client'

import { 
  type NewOrder,
  type Order,
  orders,
  ordersProducts,
  products as productsSchema
} from '@/api/db/schema'

export class OrdersRepository {
  public async createOrder({ 
    id,
    totalPrice,
    products,
  }: Omit<NewOrder, 'createdAt'> & { products: Array<{ id: string, quantity: number}>}): Promise<Order> {
    const response = await db.transaction(async (tx) => {
      const [{ insertedOrderId }] = await tx.insert(orders).values({ id, totalPrice }).returning({ insertedOrderId: orders.id })
      
      for (const { id, quantity } of products) {
        const product = await tx.select().from(productsSchema).where(eq(productsSchema.id, id)).get();

        if (!product) {
          tx.rollback()
          return  
        }

        const updatedProductAvailableQuantity = (product?.availableQuantity ?? 0) - quantity

        await tx.update(productsSchema)
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
