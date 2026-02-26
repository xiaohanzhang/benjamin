-- Migration: Add phonics game tables

-- 1. phonics_history — round results (same schema as blocks/cannon)
CREATE TABLE IF NOT EXISTS `phonics_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`score` integer NOT NULL,
	`level` integer NOT NULL,
	`duration` integer NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- 2. phonics_progress — per-word mastery tracking
CREATE TABLE IF NOT EXISTS `phonics_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`word` text NOT NULL,
	`attempts` integer NOT NULL DEFAULT 0,
	`correct` integer NOT NULL DEFAULT 0,
	`streak` integer NOT NULL DEFAULT 0,
	`mastery` integer NOT NULL DEFAULT 0,
	`last_seen` integer NOT NULL DEFAULT 0,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- 3. Unique index on (user_id, word) for phonics_progress
CREATE UNIQUE INDEX IF NOT EXISTS `phonics_progress_user_word` ON `phonics_progress` (`user_id`, `word`);
