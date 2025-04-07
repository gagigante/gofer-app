import { sql } from 'drizzle-orm'
import { text, sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(),
  password: text('password').notNull(),
  role: text('role').notNull().default('operator'),
})
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
})
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert

export const brands = sqliteTable('brands', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
})
export type Brand = typeof brands.$inferSelect
export type NewBrand = typeof brands.$inferInsert

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  fastId: integer('fast_id').unique(),
  barCode: text('bar_code'),
  name: text('name').unique(),
  description: text('description'),
  price: integer('price').notNull().default(0),
  costPrice: integer('cost_price').notNull().default(0),
  availableQuantity: integer('available_quantity').default(0),
  minimumQuantity: integer('minimum_quantity').default(0),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  brandId: text('brand_id').references(() => brands.id, { onDelete: 'set null' }),
  icms: integer('icms'),
  ncm: text('ncm'),
  cest: text('cest'),
  cestSegment: text('cest_segment'),
  cestDescription: text('cest_description'),
})
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  totalPrice: integer('total_price').notNull().default(0),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
  obs: text('obs'),
})
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert

export const ordersProducts = sqliteTable(
  'orders_products',
  {
    orderId: text('order_id').references(() => orders.id, { onDelete: 'cascade' }),
    productId: text('product_id').references(() => products.id),
    productCostPrice: integer('product_cost_price').notNull().default(0),
    productPrice: integer('product_price').notNull().default(0),
    customProductPrice: integer('custom_product_price').notNull().default(0),
    quantity: integer('quantity'),
  },
  (table) => {
    return {
      pk: primaryKey({ name: 'id', columns: [table.orderId, table.productId] }),
    }
  },
)

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  cpf: text('cpf'),
  rg: text('rg'),
  cnpj: text('cnpj'),
  ie: text('ie'),
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  zipcode: text('zipcode'),
  city: text('city'),
  street: text('street'),
  neighborhood: text('neighborhood'),
  complement: text('complement'),
})
export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
