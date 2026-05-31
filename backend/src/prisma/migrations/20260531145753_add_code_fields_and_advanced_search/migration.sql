/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `order_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `products` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add code columns as nullable first
ALTER TABLE "products" ADD COLUMN "code" VARCHAR(50);
ALTER TABLE "orders" ADD COLUMN "code" VARCHAR(50);
ALTER TABLE "order_items" ADD COLUMN "code" VARCHAR(50);

-- Step 2: Generate unique codes for existing products
UPDATE "products" SET "code" = 'PRD' || LPAD(id::text, 4, '0') WHERE "code" IS NULL;

-- Step 3: Generate unique codes for existing orders
UPDATE "orders" SET "code" = 'ORD' || LPAD(id::text, 4, '0') WHERE "code" IS NULL;

-- Step 4: Generate unique codes for existing order items
UPDATE "order_items" SET "code" = 'ITM' || LPAD(id::text, 4, '0') WHERE "code" IS NULL;

-- Step 5: Make columns NOT NULL
ALTER TABLE "products" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "code" SET NOT NULL;
ALTER TABLE "order_items" ALTER COLUMN "code" SET NOT NULL;

-- Step 6: Create unique indexes
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");
CREATE UNIQUE INDEX "order_items_code_key" ON "order_items"("code");
