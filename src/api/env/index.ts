import { z } from 'zod'

type Env = 'production' | 'development' | 'test'

const envsSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1),
  TURSO_AUTH_TOKEN: z.string().optional(),
  DEFAULT_SUPER_ADMIN_USERNAME: z.string().min(1),
  DEFAULT_SUPER_ADMIN_PASSWORD: z.string().min(1),
})

const currentEnv = process.env.NODE_ENV as Env // TODO: ensure type

const variables: Record<Env, Record<string, string | undefined>> = {
  production: {
    TURSO_DATABASE_URL: process.env.PROD_TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.PROD_TURSO_AUTH_TOKEN,
    DEFAULT_SUPER_ADMIN_USERNAME: process.env.PROD_DEFAULT_SUPER_ADMIN_USERNAME,
    DEFAULT_SUPER_ADMIN_PASSWORD: process.env.PROD_DEFAULT_SUPER_ADMIN_PASSWORD,
  },
  development: {
    TURSO_DATABASE_URL: process.env.DEV_TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.DEV_TURSO_AUTH_TOKEN,
    DEFAULT_SUPER_ADMIN_USERNAME: process.env.DEV_DEFAULT_SUPER_ADMIN_USERNAME,
    DEFAULT_SUPER_ADMIN_PASSWORD: process.env.DEV_DEFAULT_SUPER_ADMIN_PASSWORD,
  },
  test: {
    TURSO_DATABASE_URL: process.env.TEST_TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: undefined,
    DEFAULT_SUPER_ADMIN_USERNAME: process.env.TEST_DEFAULT_SUPER_ADMIN_USERNAME,
    DEFAULT_SUPER_ADMIN_PASSWORD: process.env.TEST_DEFAULT_SUPER_ADMIN_PASSWORD,
  },
}

const _env = envsSchema.safeParse(variables[currentEnv])

if (_env.success === false) {
  console.error('Invalid environment variables.', _env.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = _env.data
