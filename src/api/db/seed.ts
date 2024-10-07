import { randomUUID } from 'crypto'
import { hash } from 'bcryptjs'

import { db } from './client'
import { users } from './schema'

export async function seed() {
  const id = randomUUID()
  const name = 'admin'
  const hashedPassword = await hash('admin', 8)
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
