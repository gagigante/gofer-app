import { randomUUID } from 'crypto'
import { hash } from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seed() {
  const id = randomUUID()
  const name = 'admin'
  const hashedPassword = await hash('admin', 8)
  const role = 'super-admin'

  const superAdmins = await prisma.user.findMany({
    where: { role: 'super-admin' },
  })

  if (superAdmins.length === 0) {
    await prisma.user.create({
      data: { id, name, password: hashedPassword, role },
    })
  }
}
