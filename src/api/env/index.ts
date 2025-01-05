import { z } from 'zod'

const envsSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1),
  TURSO_AUTH_TOKEN: z.string().min(1),
  DEFAULT_SUPER_ADMIN_USERNAME: z.string().min(1),
  DEFAULT_SUPER_ADMIN_PASSWORD: z.string().min(1),
})

const _env = envsSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables.', _env.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = _env.data
