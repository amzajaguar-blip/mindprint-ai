import { pgEnum, pgTable, serial, integer, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "canceled", "past_due", "on_trial"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  archetypeName: varchar("archetypeName", { length: 128 }),
  archetypeDescription: text("archetypeDescription"),
  keyTraits: text("keyTraits"),
  surprisePhrase: text("surprisePhrase"),
  rarityPercentage: integer("rarityPercentage"),
  imageUrl: text("imageUrl"),
  isPremiumUnlocked: integer("isPremiumUnlocked").default(0),
  // Premium AI content — generato sempre, mostrato solo a premium
  strengthPoints: text("strengthPoints"),
  shadowZones: text("shadowZones"),
  weeklyAdvice: text("weeklyAdvice"),
  premiumAnalysis: text("premiumAnalysis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Test = typeof tests.$inferSelect;
export type InsertTest = typeof tests.$inferInsert;

export const testResponses = pgTable("testResponses", {
  id: serial("id").primaryKey(),
  testId: integer("testId").notNull().references(() => tests.id),
  questionNumber: integer("questionNumber").notNull(),
  questionText: text("questionText").notNull(),
  selectedAnswer: text("selectedAnswer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TestResponse = typeof testResponses.$inferSelect;
export type InsertTestResponse = typeof testResponses.$inferInsert;

export const mindprintCards = pgTable("mindprintCards", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  testId: integer("testId").notNull().references(() => tests.id),
  shareToken: varchar("shareToken", { length: 64 }).unique().notNull(),
  cardImageUrl: text("cardImageUrl"),
  shareCount: integer("shareCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MindprintCard = typeof mindprintCards.$inferSelect;
export type InsertMindprintCard = typeof mindprintCards.$inferInsert;

export const premiumSubscriptions = pgTable("premiumSubscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique().references(() => users.id),
  lemonsqueezyCustomerId: varchar("lemonsqueezyCustomerId", { length: 128 }),
  lemonsqueezySubscriptionId: varchar("lemonsqueezySubscriptionId", { length: 128 }),
  lemonsqueezyOrderId: varchar("lemonsqueezyOrderId", { length: 128 }),
  status: subscriptionStatusEnum("status").default("active"),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PremiumSubscription = typeof premiumSubscriptions.$inferSelect;
export type InsertPremiumSubscription = typeof premiumSubscriptions.$inferInsert;

export const userProfiles = pgTable("userProfiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique().references(() => users.id),
  currentArchetype: varchar("currentArchetype", { length: 128 }),
  currentTestId: integer("currentTestId").references(() => tests.id),
  totalTestsTaken: integer("totalTestsTaken").default(0),
  lastTestDate: timestamp("lastTestDate"),
  bio: text("bio"),
  isPublicProfile: integer("isPublicProfile").default(1),
  rewardCount: integer("rewardCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
