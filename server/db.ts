import { eq, sql, lt, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser, InsertTest, InsertTestResponse, InsertMindprintCard, InsertUserProfile,
  users, tests, testResponses, mindprintCards, userProfiles, premiumSubscriptions,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      const client = postgres(ENV.databaseUrl);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
    }
  }
  return _db;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = getDb();
  if (!db) { console.warn("[DB] upsertUser: no DB"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) { values[field] = user[field]; updateSet[field] = user[field]; }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }

  if (user.role !== undefined) {
    values.role = user.role; updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin"; updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// ── Tests ─────────────────────────────────────────────────────────────────────

export async function createTest(test: Pick<InsertTest, "userId">) {
  const db = getDb();
  if (!db) { console.warn("[DB] createTest: no DB"); return undefined; }
  const result = await db.insert(tests).values({ ...test, createdAt: new Date(), updatedAt: new Date() }).returning({ id: tests.id });
  return result[0];
}

export async function getTestById(testId: number) {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(tests).where(eq(tests.id, testId)).limit(1);
  return result[0];
}

export async function getUserTests(userId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(tests).where(eq(tests.userId, userId));
}

export async function updateTest(testId: number, updates: Partial<InsertTest>) {
  const db = getDb();
  if (!db) return;
  await db.update(tests).set({ ...updates, updatedAt: new Date() }).where(eq(tests.id, testId));
}

// ── Test Responses ────────────────────────────────────────────────────────────

export async function createTestResponse(response: Omit<InsertTestResponse, "createdAt">) {
  const db = getDb();
  if (!db) return;
  await db.insert(testResponses).values({ ...response, createdAt: new Date() });
}

// ── MindPrint Cards ───────────────────────────────────────────────────────────

export async function createMindprintCard(card: Pick<InsertMindprintCard, "userId" | "testId" | "shareToken" | "cardImageUrl">) {
  const db = getDb();
  if (!db) return;
  await db.insert(mindprintCards).values({ ...card, createdAt: new Date(), updatedAt: new Date() });
}

export async function getMindprintCardByShareToken(shareToken: string) {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(mindprintCards).where(eq(mindprintCards.shareToken, shareToken)).limit(1);
  return result[0];
}

export async function getUserMindprintCards(userId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(mindprintCards).where(eq(mindprintCards.userId, userId));
}

// ── User Profiles ─────────────────────────────────────────────────────────────

export async function createUserProfile(profile: Omit<InsertUserProfile, "createdAt" | "updatedAt">) {
  const db = getDb();
  if (!db) return;
  await db.insert(userProfiles).values({ ...profile, createdAt: new Date(), updatedAt: new Date() });
}

export async function getUserProfile(userId: number) {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function updateUserProfile(userId: number, updates: Partial<InsertUserProfile>) {
  const db = getDb();
  if (!db) return;
  await db.update(userProfiles).set({ ...updates, updatedAt: new Date() }).where(eq(userProfiles.userId, userId));
}

export async function incrementRewardCount(userId: number): Promise<number> {
  const db = getDb();
  if (!db) return 0;

  // Atomic single-query increment — eliminates TOCTOU race condition.
  // LEAST() caps at 3; WHERE rewardCount < 3 prevents over-increment.
  const updated = await db
    .update(userProfiles)
    .set({
      rewardCount: sql`LEAST(${userProfiles.rewardCount} + 1, 3)`,
      updatedAt: new Date(),
    })
    .where(and(eq(userProfiles.userId, userId), lt(userProfiles.rewardCount, 3)))
    .returning({ rewardCount: userProfiles.rewardCount });

  if (updated.length > 0) return updated[0].rewardCount;

  // Row doesn't exist yet — insert with count=1
  const profile = await getUserProfile(userId);
  if (!profile) {
    await db.insert(userProfiles).values({
      userId, rewardCount: 1, isPublicProfile: 1,
      createdAt: new Date(), updatedAt: new Date(),
    });
    return 1;
  }

  // Already at cap (3) — row exists but WHERE blocked the update
  return profile.rewardCount;
}

// ── Subscriptions ─────────────────────────────────────────────────────────────

export async function getSubscriptionByUserId(userId: number) {
  const db = getDb();
  if (!db) return undefined;
  const result = await db.select().from(premiumSubscriptions).where(eq(premiumSubscriptions.userId, userId)).limit(1);
  return result[0];
}

export async function upsertSubscription(data: {
  userId: number;
  lemonsqueezyCustomerId?: string;
  lemonsqueezySubscriptionId?: string;
  lemonsqueezyOrderId?: string;
  status: "active" | "canceled" | "past_due" | "on_trial";
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}) {
  const db = getDb();
  if (!db) return;
  const existing = await getSubscriptionByUserId(data.userId);
  if (existing) {
    await db.update(premiumSubscriptions).set({ ...data, updatedAt: new Date() }).where(eq(premiumSubscriptions.userId, data.userId));
  } else {
    await db.insert(premiumSubscriptions).values({ ...data, createdAt: new Date(), updatedAt: new Date() });
  }
}
