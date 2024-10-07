import { relations } from 'drizzle-orm'
import { text, sqliteTable, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull(),
})
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(),
  description: text('description'),
})
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  barCode: text('bar_code').unique(),
  name: text('name').unique(),
  description: text('description'),
  brand: text('brand'),
  price: integer('price'),
  costPrice: integer('cost_price'),
  availableQuantity: integer('available_quantity').default(0),
  minimumQuantity: integer('minimum_quantity').default(0),
  categoryId: text('category_id'),
  icms: integer('icms'),
  ncm: text('ncm'),
  cest: text('cest'),
  cestSegment: text('cest_segment'),
  cestDescription: text('cest_description'),
})
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}))
