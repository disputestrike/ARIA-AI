// server/aria/tools/publish.ts
// PUBLISH + ANALYZE tools — Anthropic Claude primary, OpenAI fallback

import { eq, desc, and, gte } from "drizzle-orm";
import { getDb } from "../../db";
import {
  contents, emailCampaigns, scheduledPosts, dspCampaigns, dspAdWallets,
  analyticsEvents, abTests, abTestVariants, seoAudits, reports, reviews,
} from "../../../drizzle/schema";
import { invokeStructuredLLM } from "../llm-provider";
import type { ToolResult } from "../memory";
import { nanoid } from "nanoid";

// ─── SCHEDULE POST ────────────────────────────────────────────────────────────
export async function schedulePost(userId: number, args: {
  contentId: number; platform: string; scheduledAt?: string; campaignId?: number;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "schedulePost", status: "error", data: {}, message: "DB unavailable" };

  try {
    const [content] = await db.select().from(contents).where(eq(contents.id, args.contentId)).limit(1);
    if (!content) return { kind: "schedulePost", status: "error", data: {}, message: "Content not found" };

    const scheduledAt = args.scheduledAt ? new Date(args.scheduledAt) : new Date(Date.now() + 3600000);
    const [inserted] = await db.insert(scheduledPosts).values({
      userId, contentId: args.contentId, campaignId: args.campaignId ?? null,
      platform: args.platform, scheduledAt, status: "pending",
    });
    const postId = (inserted as unknown as { insertId: number }).insertId;

    return { kind: "schedulePost", status: "success", recordId: postId, data: { id: postId, platform: args.platform, scheduledAt: scheduledAt.toISOString(), contentTitle: content.title } };
  } catch (err) {
    return { kind: "schedulePost", status: "error", data: {}, message: String(err) };
  }
}

// ─── SEND EMAIL CAMPAIGN ──────────────────────────────────────────────────────
export async function sendEmailCampaign(userId: number, args: {
  emailCampaignId: number; listId?: number; scheduledAt?: string;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "sendEmailCampaign", status: "error", data: {}, message: "DB unavailable" };

  try {
    const [email] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, args.emailCampaignId)).limit(1);
    if (!email) return { kind: "sendEmailCampaign", status: "error", data: {}, message: "Email campaign not found" };

    const scheduledAt = args.scheduledAt ? new Date(args.scheduledAt) : null;
    await db.update(emailCampaigns).set({
      listId: args.listId ?? email.listId,
      status: scheduledAt ? "scheduled" : "sending",
      scheduledAt: scheduledAt ?? undefined,
    }).where(eq(emailCampaigns.id, args.emailCampaignId));

    return { kind: "sendEmailCampaign", status: "success", recordId: args.emailCampaignId, data: { id: args.emailCampaignId, subject: email.subject, status: scheduledAt ? "scheduled" : "sending", scheduledAt: scheduledAt?.toISOString() } };
  } catch (err) {
    return { kind: "sendEmailCampaign", status: "error", data: {}, message: String(err) };
  }
}

// ─── LAUNCH DSP CAMPAIGN ──────────────────────────────────────────────────────
export async function launchDSPCampaign(userId: number, args: {
  name: string; dailyBudgetCents: number; totalBudgetCents: number;
  targetingGeo?: string[]; campaignId?: number;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "launchDSPCampaign", status: "error", data: {}, message: "DB unavailable" };

  try {
    // Check wallet balance
    const walletRows = await db.select().from(dspAdWallets).where(eq(dspAdWallets.userId, userId)).limit(1);
    const wallet = walletRows[0];
    const balance = wallet?.balanceCents ?? 0;
    if (balance < args.dailyBudgetCents) {
      return { kind: "launchDSPCampaign", status: "error", data: { balanceCents: balance, requiredCents: args.dailyBudgetCents }, message: `Insufficient DSP wallet balance. Have $${(balance / 100).toFixed(2)}, need $${(args.dailyBudgetCents / 100).toFixed(2)}.` };
    }

    const walletId = wallet?.id ?? 0;
    const [inserted] = await db.insert(dspCampaigns).values({
      userId, walletId, campaignId: args.campaignId ?? null, name: args.name,
      dailyBudgetCents: args.dailyBudgetCents, totalBudgetCents: args.totalBudgetCents,
      spentCents: 0, targetingGeo: args.targetingGeo ?? ["US"], status: "active",
    });
    const dspId = (inserted as unknown as { insertId: number }).insertId;

    return { kind: "launchDSPCampaign", status: "success", recordId: dspId, data: { id: dspId, name: args.name, dailyBudget: `$${(args.dailyBudgetCents / 100).toFixed(2)}`, totalBudget: `$${(args.totalBudgetCents / 100).toFixed(2)}`, status: "active" } };
  } catch (err) {
    return { kind: "launchDSPCampaign", status: "error", data: {}, message: String(err) };
  }
}

// ─── PUBLISH SOCIAL ───────────────────────────────────────────────────────────
export async function publishSocial(userId: number, args: {
  contentId: number; platform: string; mediaUrls?: string[];
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "publishSocial", status: "error", data: {}, message: "DB unavailable" };

  try {
    const [content] = await db.select().from(contents).where(eq(contents.id, args.contentId)).limit(1);
    if (!content) return { kind: "publishSocial", status: "error", data: {}, message: "Content not found" };

    // Mark content as published
    await db.update(contents).set({ status: "published" }).where(eq(contents.id, args.contentId));

    return { kind: "publishSocial", status: "success", recordId: args.contentId, data: { contentId: args.contentId, platform: args.platform, publishedAt: new Date().toISOString(), note: "Content queued for publishing via connected social account" } };
  } catch (err) {
    return { kind: "publishSocial", status: "error", data: {}, message: String(err) };
  }
}

// ─── GET ANALYTICS ────────────────────────────────────────────────────────────
export async function getAnalytics(userId: number, args: {
  campaignId?: number; platform?: string; period?: string;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "getAnalytics", status: "error", data: {}, message: "DB unavailable" };

  try {
    const periodMs: Record<string, number> = { today: 86400000, week: 604800000, month: 2592000000, all: 0 };
    const ms = periodMs[args.period ?? "month"] ?? 2592000000;
    const since = ms > 0 ? new Date(Date.now() - ms) : new Date(0);

    const conditions = [eq(analyticsEvents.userId, userId), gte(analyticsEvents.recordedAt, since)];
    if (args.campaignId) conditions.push(eq(analyticsEvents.campaignId, args.campaignId));
    if (args.platform) conditions.push(eq(analyticsEvents.platform, args.platform));

    const events = await db.select().from(analyticsEvents).where(and(...conditions)).limit(500);

    const totals = events.reduce((acc, e) => ({
      impressions: acc.impressions + (e.impressions ?? 0),
      clicks: acc.clicks + (e.clicks ?? 0),
      conversions: acc.conversions + (e.conversions ?? 0),
      spendCents: acc.spendCents + (e.spend ?? 0),
      revenueCents: acc.revenueCents + (e.revenue ?? 0),
    }), { impressions: 0, clicks: 0, conversions: 0, spendCents: 0, revenueCents: 0 });

    const ctr = totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : "0.00";
    const roas = totals.spendCents > 0 ? (totals.revenueCents / totals.spendCents).toFixed(2) : "0.00";
    const cpc = totals.clicks > 0 ? `$${(totals.spendCents / totals.clicks / 100).toFixed(2)}` : "$0.00";

    return {
      kind: "getAnalytics", status: "success",
      data: {
        period: args.period ?? "month",
        impressions: totals.impressions.toLocaleString(),
        clicks: totals.clicks.toLocaleString(),
        conversions: totals.conversions.toLocaleString(),
        spend: `$${(totals.spendCents / 100).toFixed(2)}`,
        revenue: `$${(totals.revenueCents / 100).toFixed(2)}`,
        ctr: `${ctr}%`, roas, cpc,
      },
    };
  } catch (err) {
    return { kind: "getAnalytics", status: "error", data: {}, message: String(err) };
  }
}

// ─── GET MOMENTUM ─────────────────────────────────────────────────────────────
export async function getMomentum(userId: number, args: { campaignId?: number }): Promise<ToolResult> {
  const analyticsResult = await getAnalytics(userId, { campaignId: args.campaignId, period: "week" });

  try {
    const momentum = await invokeStructuredLLM<{ trend: string; insights: string[]; urgentActions: string[]; score: number }>({
      systemPrompt: "You are a marketing performance analyst. Provide actionable momentum analysis.",
      userPrompt: `Analyze this week's marketing performance and provide momentum insights:\n${JSON.stringify(analyticsResult.data)}`,
      schemaName: "momentum",
      schema: {
        type: "object",
        properties: {
          trend: { type: "string", description: "up/down/stable" },
          insights: { type: "array", items: { type: "string" } },
          urgentActions: { type: "array", items: { type: "string" } },
          score: { type: "number", description: "0-100 momentum score" },
        },
        required: ["trend", "insights", "urgentActions", "score"],
        additionalProperties: false,
      },
    });

    return { kind: "getMomentum", status: "success", data: { analytics: analyticsResult.data, ...momentum } };
  } catch (err) {
    return { kind: "getMomentum", status: "error", data: analyticsResult.data, message: String(err) };
  }
}

// ─── SCORE CONTENT ────────────────────────────────────────────────────────────
export async function scoreContent(userId: number, args: { contentId: number }): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "scoreContent", status: "error", data: {}, message: "DB unavailable" };

  try {
    const [content] = await db.select().from(contents).where(eq(contents.id, args.contentId)).limit(1);
    if (!content) return { kind: "scoreContent", status: "error", data: {}, message: "Content not found" };

    const score = await invokeStructuredLLM<{ clarity: number; persuasiveness: number; engagement: number; seoStrength: number; overallScore: number; suggestions: string[] }>({
      systemPrompt: "You are a content quality expert. Score content on multiple dimensions and provide improvement suggestions.",
      userPrompt: `Score this ${content.type} content:\nTitle: ${content.title}\nBody: ${content.body?.substring(0, 1000)}`,
      schemaName: "content_score",
      schema: {
        type: "object",
        properties: {
          clarity: { type: "number" },
          persuasiveness: { type: "number" },
          engagement: { type: "number" },
          seoStrength: { type: "number" },
          overallScore: { type: "number" },
          suggestions: { type: "array", items: { type: "string" } },
        },
        required: ["clarity", "persuasiveness", "engagement", "seoStrength", "overallScore", "suggestions"],
        additionalProperties: false,
      },
    });

    return { kind: "scoreContent", status: "success", recordId: args.contentId, data: { contentId: args.contentId, title: content.title, ...score } };
  } catch (err) {
    return { kind: "scoreContent", status: "error", data: {}, message: String(err) };
  }
}

// ─── GENERATE SEO AUDIT ───────────────────────────────────────────────────────
export async function generateSEOAudit(userId: number, args: { url: string; keywords?: string[] }): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "generateSEOAudit", status: "error", data: {}, message: "DB unavailable" };

  try {
    const audit = await invokeStructuredLLM<{
      domainAuthority: number; pageSpeed: number; mobileScore: number;
      onPageScore: number; backlinks: number; issues: string[]; recommendations: string[];
      keywordRankings: Array<{ keyword: string; position: number }>;
    }>({
      systemPrompt: "You are an SEO expert. Provide comprehensive SEO audits with actionable recommendations.",
      userPrompt: `Perform a comprehensive SEO audit for: ${args.url}\nTarget keywords: ${(args.keywords ?? []).join(", ")}`,
      schemaName: "seo_audit",
      schema: {
        type: "object",
        properties: {
          domainAuthority: { type: "number" },
          pageSpeed: { type: "number" },
          mobileScore: { type: "number" },
          onPageScore: { type: "number" },
          backlinks: { type: "number" },
          issues: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          keywordRankings: { type: "array", items: { type: "object", properties: { keyword: { type: "string" }, position: { type: "number" } }, required: ["keyword", "position"], additionalProperties: false } },
        },
        required: ["domainAuthority", "pageSpeed", "mobileScore", "onPageScore", "backlinks", "issues", "recommendations", "keywordRankings"],
        additionalProperties: false,
      },
    });

    const [inserted] = await db.insert(seoAudits).values({
      userId, url: args.url, keywords: args.keywords ?? [],
      rankTracking: audit.keywordRankings,
      siteStructure: { domainAuthority: audit.domainAuthority, pageSpeed: audit.pageSpeed, mobileScore: audit.mobileScore, onPageScore: audit.onPageScore, backlinks: audit.backlinks, issues: audit.issues },
      recommendations: audit.recommendations,
      score: audit.onPageScore,
    });
    const auditId = (inserted as unknown as { insertId: number }).insertId;

    return { kind: "generateSEOAudit", status: "success", recordId: auditId, data: { id: auditId, url: args.url, ...audit } };
  } catch (err) {
    return { kind: "generateSEOAudit", status: "error", data: {}, message: String(err) };
  }
}

// ─── GENERATE REPORT ──────────────────────────────────────────────────────────
export async function generateReport(userId: number, args: { name: string; campaignId?: number }): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "generateReport", status: "error", data: {}, message: "DB unavailable" };

  try {
    const analyticsResult = await getAnalytics(userId, { campaignId: args.campaignId, period: "month" });
    const shareToken = nanoid(16);

    const [inserted] = await db.insert(reports).values({
      userId, campaignId: args.campaignId ?? null, name: args.name,
      reportData: analyticsResult.data, shareToken,
    });
    const reportId = (inserted as unknown as { insertId: number }).insertId;

    return { kind: "generateReport", status: "success", recordId: reportId, data: { id: reportId, name: args.name, shareToken, shareUrl: `/report/${shareToken}`, analytics: analyticsResult.data } };
  } catch (err) {
    return { kind: "generateReport", status: "error", data: {}, message: String(err) };
  }
}

// ─── REPLY TO REVIEW ──────────────────────────────────────────────────────────
export async function replyToReview(userId: number, args: {
  reviewId?: number; reviewContent?: string; platform?: string; rating?: number;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "replyToReview", status: "error", data: {}, message: "DB unavailable" };

  try {
    const reply = await invokeStructuredLLM<{ reply: string }>({
      systemPrompt: "You are a customer success expert. Write professional, empathetic, and helpful review replies that build brand reputation.",
      userPrompt: `Write a reply to this ${args.rating ?? 3}-star review on ${args.platform ?? "Google"}:\n"${args.reviewContent ?? "Review content not provided"}"`,
      schemaName: "review_reply",
      schema: {
        type: "object",
        properties: { reply: { type: "string" } },
        required: ["reply"],
        additionalProperties: false,
      },
    });

    if (args.reviewId) {
      await db.update(reviews).set({ aiReply: reply.reply, repliedAt: new Date() }).where(eq(reviews.id, args.reviewId));
    }

    return { kind: "replyToReview", status: "success", recordId: args.reviewId, data: { reviewId: args.reviewId, reply: reply.reply, platform: args.platform } };
  } catch (err) {
    return { kind: "replyToReview", status: "error", data: {}, message: String(err) };
  }
}

// ─── PREDICT PERFORMANCE ──────────────────────────────────────────────────────
export async function predictPerformance(userId: number, args: { contentId?: number; campaignId?: number }): Promise<ToolResult> {
  try {
    const prediction = await invokeStructuredLLM<{ ctr: number; engagement: number; conversionProbability: number; qualityScore: number; recommendations: string[] }>({
      systemPrompt: "You are a predictive marketing AI. Provide data-driven performance predictions.",
      userPrompt: `Predict performance for content ID: ${args.contentId ?? "N/A"}, campaign ID: ${args.campaignId ?? "N/A"}. Provide realistic CTR, engagement rate, conversion probability, and quality score.`,
      schemaName: "performance_prediction",
      schema: {
        type: "object",
        properties: {
          ctr: { type: "number" },
          engagement: { type: "number" },
          conversionProbability: { type: "number" },
          qualityScore: { type: "number" },
          recommendations: { type: "array", items: { type: "string" } },
        },
        required: ["ctr", "engagement", "conversionProbability", "qualityScore", "recommendations"],
        additionalProperties: false,
      },
    });

    return { kind: "predictPerformance", status: "success", data: { contentId: args.contentId, campaignId: args.campaignId, ...prediction } };
  } catch (err) {
    return { kind: "predictPerformance", status: "error", data: {}, message: String(err) };
  }
}
