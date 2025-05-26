import { asc, eq, like, count } from 'drizzle-orm'
import { type LibsqlError } from '@libsql/client'

import { db } from '@/api/db/client'

import { RepositoryError } from '@/api/errors/RepositoryError'

import { type Response } from '@/api/types/response'
import { type NewCustomer, type Customer, customers } from '../db/schema'

export class CustomersRepository {
  public async getCustomerById(customerId: string): Promise<Customer | null> {
    const response = await db.select().from(customers).where(eq(customers.id, customerId)).get()

    return response ?? null
  }

  public async getCustomers(name = '', page = 1, itemsPerPage = 4): Promise<Customer[]> {
    const response = await db
      .select()
      .from(customers)
      .where(like(customers.name, `%${name}%`))
      .orderBy(asc(customers.name))
      .offset(page === 1 ? 0 : (page - 1) * itemsPerPage)
      .limit(itemsPerPage)

    return response
  }

  public async countCustomers(name = ''): Promise<number> {
    const [response] = await db
      .select({ count: count() })
      .from(customers)
      .where(like(customers.name, `%${name}%`))

    return response.count
  }

  public async createCustomer(data: NewCustomer): Promise<Response<Customer>> {
    try {
      const [response] = await db.insert(customers).values(data).returning()

      return { data: response, err: null }
    } catch (error) {
      return { data: null, err: new RepositoryError(error as LibsqlError) }
    }
  }

  public async deleteCustomer(customerId: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, customerId))
  }

  public async updateCustomer({ id, ...rest }: Customer): Promise<Customer> {
    const [response] = await db.update(customers).set(rest).where(eq(customers.id, id)).returning()

    return response
  }
}
