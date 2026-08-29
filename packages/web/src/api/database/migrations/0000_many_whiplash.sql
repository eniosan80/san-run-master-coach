CREATE TABLE `athletes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`sex` text NOT NULL,
	`experience` text NOT NULL,
	`weekly_frequency` text NOT NULL,
	`goal` text NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`phase` text DEFAULT 'Adaptação' NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `checkins` (
	`id` text PRIMARY KEY NOT NULL,
	`athlete_id` text NOT NULL,
	`sleep` integer NOT NULL,
	`energy` integer NOT NULL,
	`pain` integer NOT NULL,
	`motivation` integer NOT NULL,
	`readiness` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`athlete_id` text NOT NULL,
	`title` text NOT NULL,
	`duration` text NOT NULL,
	`rpe` integer NOT NULL,
	`instructions` text NOT NULL,
	`why` text NOT NULL,
	`success_criteria` text NOT NULL,
	`completed` integer DEFAULT false,
	`created_at` integer,
	FOREIGN KEY (`athlete_id`) REFERENCES `athletes`(`id`) ON UPDATE no action ON DELETE no action
);
