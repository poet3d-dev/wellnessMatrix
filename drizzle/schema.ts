import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  date,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  // Wellness Matrix specific fields
  visionText: text("visionText"),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["none", "active", "cancelled"]).default("none").notNull(),
  currentWeek: int("currentWeek").default(0).notNull(), // 0 = prep week
  onboardingComplete: boolean("onboardingComplete").default(false).notNull(),
  privacyAccepted: boolean("privacyAccepted").default(false).notNull(),
  journeyStartDate: date("journeyStartDate"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Weekly practices chosen by the user (one per week, Weeks 1-4).
 */
export const practices = mysqlTable("practices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weekNum: int("weekNum").notNull(), // 1-4
  practiceText: text("practiceText").notNull(),
  weekColor: mysqlEnum("weekColor", ["blue", "yellow", "green", "red"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Practice = typeof practices.$inferSelect;
export type InsertPractice = typeof practices.$inferInsert;

/**
 * Daily journal entries (morning + evening combined per day).
 */
export const dailyEntries = mysqlTable("dailyEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entryDate: date("entryDate").notNull(),
  weekNum: int("weekNum").notNull(),
  dayNum: int("dayNum").notNull(),
  // Morning fields
  morningGratitude1: text("morningGratitude1"),
  morningGratitude2: text("morningGratitude2"),
  morningGratitude3: text("morningGratitude3"),
  morningGratitude4: text("morningGratitude4"),
  morningGratitude5: text("morningGratitude5"),
  morningFocus: text("morningFocus"),
  morningImportant: text("morningImportant"),
  morningBetterMoments: text("morningBetterMoments"),
  morningCompleted: boolean("morningCompleted").default(false).notNull(),
  // Evening fields
  eveningGratitude1: text("eveningGratitude1"),
  eveningGratitude2: text("eveningGratitude2"),
  eveningGratitude3: text("eveningGratitude3"),
  eveningMoment: text("eveningMoment"),
  eveningLearned: text("eveningLearned"),
  eveningLetGo: text("eveningLetGo"),
  eveningCompleted: boolean("eveningCompleted").default(false).notNull(),
  // Practice tracking
  practiceIntended: boolean("practiceIntended").default(false).notNull(),
  practiceCompleted: mysqlEnum("practiceCompleted", ["yes", "partly", "no", "pending"]).default("pending").notNull(),
  practiceFeeling: text("practiceFeeling"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyEntry = typeof dailyEntries.$inferSelect;
export type InsertDailyEntry = typeof dailyEntries.$inferInsert;

/**
 * Weekly reflection answers (6 questions per week, Weeks 1-8).
 */
export const weeklyReflections = mysqlTable("weeklyReflections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weekNum: int("weekNum").notNull(), // 1-8
  answer1: text("answer1"),
  answer2: text("answer2"),
  answer3: text("answer3"),
  answer4: text("answer4"),
  answer5: text("answer5"),
  answer6: text("answer6"),
  completed: boolean("completed").default(false).notNull(),
  completedDate: timestamp("completedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyReflection = typeof weeklyReflections.$inferSelect;
export type InsertWeeklyReflection = typeof weeklyReflections.$inferInsert;

/**
 * Free-form journal entries (always available).
 */
export const freeWrites = mysqlTable("freeWrites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entryDate: date("entryDate").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FreeWrite = typeof freeWrites.$inferSelect;
export type InsertFreeWrite = typeof freeWrites.$inferInsert;

/**
 * Overall journey progress tracking.
 */
export const journeyProgress = mysqlTable("journeyProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalDaysCompleted: int("totalDaysCompleted").default(0).notNull(),
  totalMorningEntries: int("totalMorningEntries").default(0).notNull(),
  totalEveningEntries: int("totalEveningEntries").default(0).notNull(),
  totalFreeWrites: int("totalFreeWrites").default(0).notNull(),
  totalReflections: int("totalReflections").default(0).notNull(),
  week4TransitionShown: boolean("week4TransitionShown").default(false).notNull(),
  week8CompletionShown: boolean("week8CompletionShown").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JourneyProgress = typeof journeyProgress.$inferSelect;
export type InsertJourneyProgress = typeof journeyProgress.$inferInsert;
