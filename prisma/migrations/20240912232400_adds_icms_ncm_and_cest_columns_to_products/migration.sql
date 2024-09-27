/*
  Warnings:

  - Added the required column `cest` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icms` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ncm` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bar_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "cost_price" BIGINT NOT NULL,
    "available_quantity" INTEGER NOT NULL DEFAULT 0,
    "minimum_quantity" INTEGER NOT NULL DEFAULT 0,
    "category_id" TEXT,
    "icms" INTEGER NOT NULL,
    "ncm" TEXT NOT NULL,
    "cest" TEXT NOT NULL,
    "cestSegment" TEXT,
    "cestDescription" TEXT,
    CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("available_quantity", "bar_code", "brand", "category_id", "cost_price", "description", "id", "minimum_quantity", "name", "price") SELECT "available_quantity", "bar_code", "brand", "category_id", "cost_price", "description", "id", "minimum_quantity", "name", "price" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_bar_code_key" ON "products"("bar_code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
