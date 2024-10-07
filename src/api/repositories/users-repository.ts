import { asc, eq, like, count } from 'drizzle-orm'

import { db } from '@/api/db/client'
import { type NewUser, type User, users } from '../db/schema'

import { type UserRole } from '../types/user-role'

export class UsersRepository {
  public async getUserById(userId: string): Promise<User | null> {
    const response = await db.select().from(users).where(eq(users.id, userId)).get()

    return response ?? null
  }

  public async getUserByName(name: string): Promise<User | null> {
    const response = await db.select().from(users).where(eq(users.name, name)).get()

    return response ?? null
  }

  public async getUsers(name = '', page = 1, itemsPerPage = 4): Promise<User[]> {
    const response = await db
      .select()
      .from(users)
      .where(like(users.name, `%${name}%`))
      .orderBy(asc(users.name))
      .offset(page === 1 ? 0 : (page - 1) * itemsPerPage)
      .limit(itemsPerPage)

    return response
  }

  public async countUsers(name = ''): Promise<number> {
    const [response] = await db.select({ count: count() }).from(users).where(like(users.name, `%${name}%`))

    return response.count
  }

  public async createUser({ id, name, password, role }: NewUser & { role: UserRole }): Promise<User> {
    const [response] = await db
      .insert(users)
      .values({
        id,
        name,
        password,
        role,
      })
      .returning()

    return response
  }

  public async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId))
  }

  public async updateUser({ id, name, password }: Pick<User, 'id' | 'name'> & { password?: string }): Promise<User> {
    const [response] = await db
      .update(users)
      .set({
        name,
        password,
      })
      .where(eq(users.id, id))
      .returning()

    return response
  }
}
