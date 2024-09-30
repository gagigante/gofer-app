import * as z from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nome é um campo obrigatório'),
  category: z.string(),
  brand: z.string(),
  description: z.string(),
  barCode: z.string(),
  price: z.string().min(1, 'Preço é um campo obrigatório'),
  costPrice: z.string().min(1, 'Preço de custo é um campo obrigatório'),
  availableQuantity: z.number().int().min(0),
  minimumQuantity: z.number().int().min(0),
  icms: z.string().regex(/^\d{1,3}(,\d{1,2})?$/, 'ICMS precisa ser uma porcentagem valida'),
  ncm: z.string().regex(/^\d{4}\.\d{2}\.\d{2}$/, 'NCM precisa estar no formato correto'),
  cest: z.string().regex(/^\d{2}\.\d{3}\.\d{2}$/, 'CEST precisa estar no formato correto'),
  cestSegment: z.string(),
  cestDescription: z.string(),
})
