import { randomUUID } from 'crypto'
import { hash } from 'bcryptjs'

import { db } from './client'
import { users } from './schema'

import { env } from '@/api/env'

export async function seed() {
  const id = randomUUID()
  const name = env.DEFAULT_SUPER_ADMIN_USERNAME
  const hashedPassword = await hash(env.DEFAULT_SUPER_ADMIN_PASSWORD, 10)
  const role = 'super-admin'

  const superAdmins = await db.select().from(users).all()

  if (superAdmins.length === 0) {
    await db.insert(users).values({
      id,
      name,
      password: hashedPassword,
      role,
    })
  }
}
