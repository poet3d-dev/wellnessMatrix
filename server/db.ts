import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  practices,
  dailyEntries,
  weeklyReflections,
  freeWrites,
  journeyProgress,
  type InsertPractice,
  type InsertDailyEntry,
  type InsertWeeklyReflection,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── User helpers ────────────────────────────────────────────────────────────

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.id, id));
  return rows[0] ?? null;
}

export async function updateUserProfile(
  id: number,
  data: {
    visionText?: string;
    currentWeek?: number;
    onboardingComplete?: boolean;
    privacyAccepted?: boolean;
    subscriptionStatus?: "none" | "active" | "cancelled";
    journeyStartDate?: Date;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq(users.id, id));
}

// ─── Practices ───────────────────────────────────────────────────────────────

export async function getUserPractices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(practices).where(eq(practices.userId, userId));
}

export async function getPracticeByWeek(userId: number, weekNum: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(practices)
    .where(and(eq(practices.userId, userId), eq(practices.weekNum, weekNum)));
  return rows[0] ?? null;
}

export async function upsertPractice(data: InsertPractice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getPracticeByWeek(data.userId, data.weekNum);
  if (existing) {
    await db
      .update(practices)
      .set({ practiceText: data.practiceText, weekColor: data.weekColor })
      .where(eq(practices.id, existing.id));
    return existing.id;
  }
  const result = await db.insert(practices).values(data);
  return result[0].insertId;
}

// ─── Daily Entries ────────────────────────────────────────────────────────────

export async function getDailyEntry(userId: number, entryDate: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(dailyEntries)
    .where(and(eq(dailyEntries.userId, userId), eq(dailyEntries.entryDate, entryDate as unknown as Date)));
  return rows[0] ?? null;
}

export async function getUserDailyEntries(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dailyEntries).where(eq(dailyEntries.userId, userId));
}

export async function upsertDailyEntry(userId: number, entryDate: string, data: Partial<InsertDailyEntry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getDailyEntry(userId, entryDate);
  if (existing) {
    await db.update(dailyEntries).set(data).where(eq(dailyEntries.id, existing.id));
    return existing.id;
  }
  const result = await db.insert(dailyEntries).values({
    userId,
    entryDate: entryDate as unknown as Date,
    weekNum: data.weekNum ?? 1,
    dayNum: data.dayNum ?? 1,
    ...data,
  });
  return result[0].insertId;
}

// ─── Weekly Reflections ───────────────────────────────────────────────────────

export async function getWeeklyReflection(userId: number, weekNum: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(weeklyReflections)
    .where(and(eq(weeklyReflections.userId, userId), eq(weeklyReflections.weekNum, weekNum)));
  return rows[0] ?? null;
}

export async function getUserReflections(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weeklyReflections).where(eq(weeklyReflections.userId, userId));
}

export async function upsertWeeklyReflection(userId: number, weekNum: number, data: Partial<InsertWeeklyReflection>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getWeeklyReflection(userId, weekNum);
  if (existing) {
    await db.update(weeklyReflections).set(data).where(eq(weeklyReflections.id, existing.id));
    return existing.id;
  }
  const result = await db.insert(weeklyReflections).values({ userId, weekNum, ...data });
  return result[0].insertId;
}

// ─── Free Writes ──────────────────────────────────────────────────────────────

export async function getUserFreeWrites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(freeWrites).where(eq(freeWrites.userId, userId));
}

export async function getFreeWriteByDate(userId: number, entryDate: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(freeWrites)
    .where(and(eq(freeWrites.userId, userId), eq(freeWrites.entryDate, entryDate as unknown as Date)));
  return rows[0] ?? null;
}

export async function upsertFreeWrite(userId: number, entryDate: string, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getFreeWriteByDate(userId, entryDate);
  if (existing) {
    await db.update(freeWrites).set({ content }).where(eq(freeWrites.id, existing.id));
    return existing.id;
  }
  const result = await db.insert(freeWrites).values({
    userId,
    entryDate: entryDate as unknown as Date,
    content,
  });
  return result[0].insertId;
}

export async function deleteFreeWrite(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(freeWrites).where(and(eq(freeWrites.id, id), eq(freeWrites.userId, userId)));
}

// ─── Journey Progress ─────────────────────────────────────────────────────────

export async function getJourneyProgress(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(journeyProgress).where(eq(journeyProgress.userId, userId));
  return rows[0] ?? null;
}

export async function upsertJourneyProgress(
  userId: number,
  data: Partial<typeof journeyProgress.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getJourneyProgress(userId);
  if (existing) {
    await db.update(journeyProgress).set(data).where(eq(journeyProgress.userId, userId));
    return existing.id;
  }
  const result = await db.insert(journeyProgress).values({ userId, ...data });
  return result[0].insertId;
}

export async function deleteUserData(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(freeWrites).where(eq(freeWrites.userId, userId));
  await db.delete(weeklyReflections).where(eq(weeklyReflections.userId, userId));
  await db.delete(dailyEntries).where(eq(dailyEntries.userId, userId));
  await db.delete(practices).where(eq(practices.userId, userId));
  await db.delete(journeyProgress).where(eq(journeyProgress.userId, userId));
  await db.update(users).set({
    visionText: null,
    currentWeek: 0,
    onboardingComplete: false,
    privacyAccepted: false,
    subscriptionStatus: "none",
    journeyStartDate: null,
  }).where(eq(users.id, userId));
}
