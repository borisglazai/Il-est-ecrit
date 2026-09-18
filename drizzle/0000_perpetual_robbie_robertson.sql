CREATE TABLE `learner_states` (
	`user_id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`revision` integer NOT NULL,
	`last_write_id` text NOT NULL,
	`updated_at` text NOT NULL
);
