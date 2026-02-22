-- Migration: round_history → math_history
-- Creates math_history, migrates data, then drops unused tables.

-- 1. Create math_history table (same schema as blocks_history / cannon_history)
CREATE TABLE IF NOT EXISTS `math_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`score` integer NOT NULL,
	`level` integer NOT NULL,
	`duration` integer NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint

-- 2. Migrate round_history → math_history (score=correct, level=difficulty, duration=0)
INSERT INTO `math_history` (`user_id`, `score`, `level`, `duration`, `timestamp`)
SELECT `user_id`, `correct`, `difficulty`, 0, `timestamp`
FROM `round_history`;
--> statement-breakpoint

-- 3. Drop tables no longer needed
DROP TABLE IF EXISTS `wrong_answers`;
--> statement-breakpoint
DROP TABLE IF EXISTS `question_history`;
--> statement-breakpoint
DROP TABLE IF EXISTS `round_history`;
