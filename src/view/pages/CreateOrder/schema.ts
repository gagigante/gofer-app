import * as z from 'zod'

export const createOrderSchema = z.object({
  customer: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  obs: z.string(),
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      costPrice: z.number(),
      unityPrice: z.number(),
      customPrice: z.number(),
      quantity: z.number(),
      totalPrice: z.number(),
      totalCostPrice: z.number(),
      obs: z.string(),
    }),
  ),
  zipcode: z.string(),
  city: z.string(),
  street: z.string(),
  neighborhood: z.string(),
  complement: z.string(),
})

export type CreateOrderSchema = z.infer<typeof createOrderSchema>
