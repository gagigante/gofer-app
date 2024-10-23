CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `brands_name_unique` ON `brands` (`name`);--> statement-breakpoint
ALTER TABLE `products` ADD `brand_id` text;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `brand`;