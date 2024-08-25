import * as z from 'zod'

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(1, 'O nome é obrigatório.')
      .refine((s) => !s.includes(' '), 'O nome não pode conter espaços.'),
    password: z.string().refine((s) => !s.includes(' '), 'A senha não pode conter espaços.'),
    newPassword: z.string().refine((s) => !s.includes(' '), 'A senha não pode conter espaços.'),
    newPasswordConfirmation: z.string(),
  })
  .refine(
    (data) => {
      if (data.password !== '') return data.newPassword !== ''

      return true
    },
    {
      message: 'Preencha a nova senha.',
      path: ['newPassword'],
    },
  )
  .refine(
    (data) => {
      if (data.password !== '') return data.newPasswordConfirmation !== ''

      return true
    },
    {
      message: 'Preencha a confirmação de senha.',
      path: ['newPasswordConfirmation'],
    },
  )
  .refine(
    (data) => {
      if (data.newPassword !== '' && data.newPasswordConfirmation !== '') {
        return data.newPassword === data.newPasswordConfirmation
      }

      return true
    },
    {
      message: 'A confirmação de senha está diferente da nova senha.',
      path: ['newPasswordConfirmation'],
    },
  )
