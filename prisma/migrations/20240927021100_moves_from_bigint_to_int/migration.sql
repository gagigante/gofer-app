/*
  Warnings:

  - You are about to alter the column `cost_price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bar_code" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "price" INTEGER NOT NULL,
    "cost_price" INTEGER NOT NULL,
    "available_quantity" INTEGER DEFAULT 0,
    "minimum_quantity" INTEGER DEFAULT 0,
    "category_id" TEXT,
    "icms" INTEGER NOT NULL,
    "ncm" TEXT NOT NULL,
    "cest" TEXT NOT NULL,
    "cestSegment" TEXT,
    "cestDescription" TEXT,
    CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("available_quantity", "bar_code", "brand", "category_id", "cest", "cestDescription", "cestSegment", "cost_price", "description", "icms", "id", "minimum_quantity", "name", "ncm", "price") SELECT "available_quantity", "bar_code", "brand", "category_id", "cest", "cestDescription", "cestSegment", "cost_price", "description", "icms", "id", "minimum_quantity", "name", "ncm", "price" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_bar_code_key" ON "products"("bar_code");
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
