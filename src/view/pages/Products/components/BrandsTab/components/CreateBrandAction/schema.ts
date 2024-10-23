import * as z from 'zod'

export const createBrandSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
})
