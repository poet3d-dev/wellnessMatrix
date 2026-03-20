CREATE TABLE `dailyEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entryDate` date NOT NULL,
	`weekNum` int NOT NULL,
	`dayNum` int NOT NULL,
	`morningGratitude1` text,
	`morningGratitude2` text,
	`morningGratitude3` text,
	`morningGratitude4` text,
	`morningGratitude5` text,
	`morningFocus` text,
	`morningImportant` text,
	`morningBetterMoments` text,
	`morningCompleted` boolean NOT NULL DEFAULT false,
	`eveningGratitude1` text,
	`eveningGratitude2` text,
	`eveningGratitude3` text,
	`eveningMoment` text,
	`eveningLearned` text,
	`eveningLetGo` text,
	`eveningCompleted` boolean NOT NULL DEFAULT false,
	`practiceIntended` boolean NOT NULL DEFAULT false,
	`practiceCompleted` enum('yes','partly','no','pending') NOT NULL DEFAULT 'pending',
	`practiceFeeling` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dailyEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `freeWrites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entryDate` date NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `freeWrites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journeyProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalDaysCompleted` int NOT NULL DEFAULT 0,
	`totalMorningEntries` int NOT NULL DEFAULT 0,
	`totalEveningEntries` int NOT NULL DEFAULT 0,
	`totalFreeWrites` int NOT NULL DEFAULT 0,
	`totalReflections` int NOT NULL DEFAULT 0,
	`week4TransitionShown` boolean NOT NULL DEFAULT false,
	`week8CompletionShown` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journeyProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `journeyProgress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `practices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekNum` int NOT NULL,
	`practiceText` text NOT NULL,
	`weekColor` enum('blue','yellow','green','red') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `practices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weeklyReflections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekNum` int NOT NULL,
	`answer1` text,
	`answer2` text,
	`answer3` text,
	`answer4` text,
	`answer5` text,
	`answer6` text,
	`completed` boolean NOT NULL DEFAULT false,
	`completedDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weeklyReflections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `visionText` text;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('none','active','cancelled') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `currentWeek` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingComplete` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `privacyAccepted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `journeyStartDate` date;