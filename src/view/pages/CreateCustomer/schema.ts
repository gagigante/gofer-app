import * as z from 'zod'

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Nome é um campo obrigatório'),
  rg: z.string(),
  cpf: z.string(),
  cnpj: z.string(),
  ie: z.string(),
  email: z.string().email('E-mail inválido').or(z.literal('')),
  phone: z.string(),
  zipcode: z.string(),
  city: z.string(),
  street: z.string(),
  neighborhood: z.string(),
  complement: z.string(),
})
