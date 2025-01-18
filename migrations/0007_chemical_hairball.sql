PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_orders_products` (
	`order_id` text,
	`product_id` text,
	`product_price` integer DEFAULT 0 NOT NULL,
	`custom_product_price` integer DEFAULT 0 NOT NULL,
	`quantity` integer,
	PRIMARY KEY(`order_id`, `product_id`),
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_orders_products`("order_id", "product_id", "product_price", "custom_product_price", "quantity") SELECT "order_id", "product_id", "product_price", "custom_product_price", "quantity" FROM `orders_products`;--> statement-breakpoint
DROP TABLE `orders_products`;--> statement-breakpoint
ALTER TABLE `__new_orders_products` RENAME TO `orders_products`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS "brands_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "categories_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "products_fast_id_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "products_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "users_name_unique";--> statement-breakpoint
ALTER TABLE `orders` ALTER COLUMN "total_price" TO "total_price" integer NOT NULL DEFAULT 0;--> statement-breakpoint
CREATE UNIQUE INDEX `brands_name_unique` ON `brands` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_fast_id_unique` ON `products` (`fast_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_name_unique` ON `products` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);--> statement-breakpoint
ALTER TABLE `orders` ALTER COLUMN "total_price" TO "total_price" integer NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ALTER COLUMN "price" TO "price" integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `products` ALTER COLUMN "price" TO "price" integer NOT NULL;