CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`host` text NOT NULL,
	`guest` text,
	`orders0` text,
	`orders1` text,
	`version` integer DEFAULT 0 NOT NULL,
	`expires` integer NOT NULL
);
