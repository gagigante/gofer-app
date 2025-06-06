import { randomUUID } from 'crypto'
import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'

import { db } from './client'
import { users as usersSchema } from './schema'

import { env } from '@/api/env'

export async function seed() {
  const id = randomUUID()
  const name = env.DEFAULT_SUPER_ADMIN_USERNAME
  const hashedPassword = await hash(env.DEFAULT_SUPER_ADMIN_PASSWORD, 10)
  const role = 'super-admin'

  const superAdmins = await db.select().from(usersSchema).where(eq(usersSchema.role, 'super-admin')).all()

  if (superAdmins.length === 0) {
    await db.insert(usersSchema).values({
      id,
      name,
      password: hashedPassword,
      role,
    })
  }
}
