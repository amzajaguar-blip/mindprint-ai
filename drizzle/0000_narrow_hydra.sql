CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'canceled', 'past_due', 'on_trial');--> statement-breakpoint
CREATE TABLE "mindprintCards" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"testId" integer NOT NULL,
	"shareToken" varchar(64) NOT NULL,
	"cardImageUrl" text,
	"shareCount" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mindprintCards_shareToken_unique" UNIQUE("shareToken")
);
--> statement-breakpoint
CREATE TABLE "premiumSubscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"lemonsqueezyCustomerId" varchar(128),
	"lemonsqueezySubscriptionId" varchar(128),
	"lemonsqueezyOrderId" varchar(128),
	"status" "subscription_status" DEFAULT 'active',
	"currentPeriodStart" timestamp,
	"currentPeriodEnd" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "premiumSubscriptions_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "testResponses" (
	"id" serial PRIMARY KEY NOT NULL,
	"testId" integer NOT NULL,
	"questionNumber" integer NOT NULL,
	"questionText" text NOT NULL,
	"selectedAnswer" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"archetypeName" varchar(128),
	"archetypeDescription" text,
	"keyTraits" text,
	"surprisePhrase" text,
	"rarityPercentage" integer,
	"imageUrl" text,
	"isPremiumUnlocked" integer DEFAULT 0,
	"strengthPoints" text,
	"shadowZones" text,
	"weeklyAdvice" text,
	"premiumAnalysis" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userProfiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"currentArchetype" varchar(128),
	"currentTestId" integer,
	"totalTestsTaken" integer DEFAULT 0,
	"lastTestDate" timestamp,
	"bio" text,
	"isPublicProfile" integer DEFAULT 1,
	"rewardCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "userProfiles_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
ALTER TABLE "mindprintCards" ADD CONSTRAINT "mindprintCards_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mindprintCards" ADD CONSTRAINT "mindprintCards_testId_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premiumSubscriptions" ADD CONSTRAINT "premiumSubscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testResponses" ADD CONSTRAINT "testResponses_testId_tests_id_fk" FOREIGN KEY ("testId") REFERENCES "public"."tests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tests" ADD CONSTRAINT "tests_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userProfiles" ADD CONSTRAINT "userProfiles_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userProfiles" ADD CONSTRAINT "userProfiles_currentTestId_tests_id_fk" FOREIGN KEY ("currentTestId") REFERENCES "public"."tests"("id") ON DELETE no action ON UPDATE no action;