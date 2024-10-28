ALTER TABLE `products` ADD `fast_id` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `products_fast_id_unique` ON `products` (`fast_id`);