DROP INDEX IF EXISTS "brands_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "categories_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "products_fast_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "products_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_name_unique";--> statement-breakpoint
ALTER TABLE `categories` ALTER COLUMN "name" TO "name" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `brands_name_unique` ON `brands` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_fast_id_unique` ON `products` (`fast_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_name_unique` ON `products` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);--> statement-breakpoint
ALTER TABLE `products` ALTER COLUMN "category_id" TO "category_id" text REFERENCES categories(id) ON DELETE set null ON UPDATE no action;