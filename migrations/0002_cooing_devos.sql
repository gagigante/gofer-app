CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`bar_code` text,
	`name` text,
	`description` text,
	`brand` text,
	`price` integer,
	`cost_price` integer,
	`available_quantity` integer DEFAULT 0,
	`minimum_quantity` integer DEFAULT 0,
	`category_id` text,
	`icms` integer,
	`ncm` text,
	`cest` text,
	`cest_segment` text,
	`cest_description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_bar_code_unique` ON `products` (`bar_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_name_unique` ON `products` (`name`);