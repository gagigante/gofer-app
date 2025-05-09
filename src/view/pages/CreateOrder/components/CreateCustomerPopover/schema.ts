import * as z from 'zod'

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  phone: z.string(),
})
