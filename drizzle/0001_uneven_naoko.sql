CREATE TABLE `moradores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cpf` varchar(14),
	`telefone` varchar(20),
	`endereco` text NOT NULL,
	`numero` varchar(20),
	`complemento` varchar(255),
	`bairro` varchar(255),
	`cidade` varchar(255) NOT NULL,
	`estado` varchar(2) NOT NULL,
	`cep` varchar(10),
	`latitude` varchar(50),
	`longitude` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `moradores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `moradores` ADD CONSTRAINT `moradores_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;