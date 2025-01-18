import { afterEach, vi } from 'vitest'
import { db } from './src/api/db/client'
import { users, orders, customers, products, brands, categories, ordersProducts } from './src/api/db/schema'

vi.mock('drizzle-orm/libsql/web', () => {
  return import('drizzle-orm/libsql') // Redirect to the desired module
})

// REVIEW: find a better approach to teardown the test database
afterEach(async () => {
  await Promise.all([
    db.delete(users),
    db.delete(orders),
    db.delete(customers),
    db.delete(products),
    db.delete(brands),
    db.delete(categories),
    db.delete(ordersProducts),
  ])
})
