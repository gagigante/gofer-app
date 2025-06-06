import { randomUUID } from 'crypto'
import { hash } from 'bcryptjs'

import { db } from './client'
import { users as usersSchema } from './schema'

import { env } from '@/api/env'

export async function seed() {
  const id = randomUUID()
  const name = env.DEFAULT_SUPER_ADMIN_USERNAME
  const hashedPassword = await hash(env.DEFAULT_SUPER_ADMIN_PASSWORD, 10)
  const role = 'super-admin'

  const users = await db.select().from(usersSchema).all()
  const superAdmins = users.filter((user) => user.role === 'super-admin')

  if (superAdmins.length === 0) {
    await db.insert(usersSchema).values({
      id,
      name,
      password: hashedPassword,
      role,
    })
  }
}
