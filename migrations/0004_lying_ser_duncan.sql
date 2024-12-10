CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`cpf` text,
	`rg` text,
	`cnpj` text,
	`ie` text,
	`name` text,
	`email` text,
	`phone` text,
	`zipcode` text,
	`city` text,
	`street` text,
	`neighborhood` text,
	`complement` text
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `customer_id` text;