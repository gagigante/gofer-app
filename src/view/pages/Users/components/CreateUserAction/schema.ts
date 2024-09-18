import * as z from 'zod'

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório!')
    .refine((s) => !s.includes(' '), 'Espaços não são permitidos.'),
  password: z.string().min(1, 'Senha é obrigatória!'),
  role: z.enum(['admin', 'operator']),
})
