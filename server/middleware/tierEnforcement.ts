import { getDb } from "../db";
import { subscriptions, userMonthlyUsage } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { ARIA_PLANS, type DbTier } from "../stripe/products";
import type { TrpcContext } from "../_core/context";
import { TRPCError } from "@trpc/server";

// ─── Tier Limits ──────────────────────────────────────────────────────────────
const TIER_LIMITS: Record<DbTier, { aiGenerations: number; campaigns: number; contents: number; landingPages: number; teamMembers: number }> = {
  free:         { aiGenerations: 50,    campaigns: 1,   contents: 10,   landingPages: 1,   teamMembers: 1 },
  starter:      { aiGenerations: 500,   campaigns: 5,   contents: 50,   landingPages: 3,   teamMembers: 1 },
  professional: { aiGenerations: 2000,  campaigns: 25,  contents: 500,  landingPages: 20,  teamMembers: 5 },
  business:     { aiGenerations: 10000, campaigns: 100, contents: 2000, landingPages: 100, teamMembers: 15 },
  agency:       { aiGenerations: -1,    campaigns: -1,  contents: -1,   landingPages: -1,  teamMembers: 25 },
};

type LimitKey = "aiGenerations" | "campaigns" | "contents" | "landingPages";

// ─── Get User Subscription Tier ───────────────────────────────────────────────
export async function getUserTier(userId: number): Promise<DbTier> {
  const db = await getDb();
  if (!db) return "free";

  const [sub] = await db
    .select({ tier: subscriptions.tier, status: subscriptions.status })
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1);

  if (!sub) return "free";
  return sub.tier as DbTier;
}

// ─── Get Current Month Usage ──────────────────────────────────────────────────
async function getMonthlyUsage(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [usage] = await db
    .select()
    .from(userMonthlyUsage)
    .where(and(eq(userMonthlyUsage.userId, userId), eq(userMonthlyUsage.month, monthKey)))
    .limit(1);

  return usage ?? null;
}

// ─── Check Limit (throws TRPCError if exceeded) ───────────────────────────────
export async function checkLimit(ctx: TrpcContext, key: LimitKey): Promise<void> {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

  const tier = await getUserTier(ctx.user.id);
  const limits = TIER_LIMITS[tier];
  const limit = limits[key];

  if (limit === -1) return; // unlimited

  const usage = await getMonthlyUsage(ctx.user.id);
  const current = key === "aiGenerations" ? (usage?.aiGenerationsUsed ?? 0) : 0;

  if (current >= limit) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You've reached your monthly ${key} limit (${limit}) on the ${tier} plan. Upgrade to continue.`,
    });
  }
}

// ─── Consume AI Generation (increments usage counter) ─────────────────────────
export async function consumeAiGeneration(userId: number, amount = 1): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [existing] = await db
    .select()
    .from(userMonthlyUsage)
    .where(and(eq(userMonthlyUsage.userId, userId), eq(userMonthlyUsage.month, monthKey)))
    .limit(1);

  if (existing) {
    await db.update(userMonthlyUsage)
      .set({ aiGenerationsUsed: (existing.aiGenerationsUsed ?? 0) + amount, updatedAt: new Date() })
      .where(and(eq(userMonthlyUsage.userId, userId), eq(userMonthlyUsage.month, monthKey)));
  } else {
    await db.insert(userMonthlyUsage).values({
      userId,
      month: monthKey,
      aiGenerationsUsed: amount,
    });
  }
}

// ─── Get Usage Summary for User ───────────────────────────────────────────────
export async function getUsageSummary(userId: number) {
  const tier = await getUserTier(userId);
  const usage = await getMonthlyUsage(userId);
  const limits = TIER_LIMITS[tier];

  const aiUsed = usage?.aiGenerationsUsed ?? 0;
  const aiLimit = limits.aiGenerations;

  return {
    tier,
    usage: {
      aiGenerations: aiUsed,
      aiImages: usage?.aiImagesUsed ?? 0,
      videoScripts: usage?.videoScriptsUsed ?? 0,
      scheduledPosts: usage?.scheduledPostsUsed ?? 0,
    },
    limits,
    percentages: {
      aiGenerations: aiLimit === -1 ? 0 : Math.min(100, Math.round((aiUsed / aiLimit) * 100)),
    },
  };
}
