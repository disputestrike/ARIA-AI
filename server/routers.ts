import { COOKIE_NAME } from "@shared/const";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  abTests, creatives, analyticsEvents, automationWorkflows, billingTransactions,
  brandKits, brandVoices, campaigns, chatConversations,
  competitorProfiles, leads, contents, creditLedger, deals, dspAdWallets,
  dspCampaigns, emailSequences, emailSends, formSubmissions, forms, funnels,
  integrations, landingPages, products, reports, reviews, scheduledPosts,
  seoAudits, subscriptions, teamMembers, contentTemplates, userMemory, userSettings,
  users, videoAds, approvalWorkflows, reviewSources, projects, projectAssets, campaignVersions,
} from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { runARIAAgent } from "./aria/agent";

const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

const ariaRouter = router({
  chat: protectedProcedure
    .input(z.object({ message: z.string(), conversationId: z.number().optional(), context: z.record(z.string(), z.unknown()).optional(), attachments: z.array(z.object({ name: z.string(), url: z.string(), type: z.string(), content: z.string().optional() })).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { reply: "Database unavailable", conversationId: null, toolsUsed: [], artifacts: [] };
      let convId = input.conversationId;
      let convTitle: string | null = null;
      let history: Array<{ role: string; content: string }> = [];
      if (convId) {
        const [conv] = await db.select().from(chatConversations).where(and(eq(chatConversations.id, convId), eq(chatConversations.userId, ctx.user.id))).limit(1);
        if (conv) {
          history = (conv.messages as Array<{ role: string; content: string }>) ?? [];
          convTitle = conv.title ?? null;
        }
      }
      // Build message with attachment context
      let fullMessage = input.message;
      if (input.attachments && input.attachments.length > 0) {
        const attachCtx = input.attachments.map(a => {
          if (a.content) return `[Attached: ${a.name}]\n${a.content}`;
          return `[Attached: ${a.name} (${a.type}) at ${a.url}]`;
        }).join('\n\n');
        fullMessage = `${input.message}\n\n---\n${attachCtx}`;
      }
      const result = await runARIAAgent(ctx.user.id, fullMessage, history as never[]);
      const newHistory = [...history, { role: "user", content: fullMessage }, { role: "assistant", content: result.reply }];
      // Auto-generate title for new conversations from first user message
      if (!convId && !convTitle) {
        const words = input.message.trim().split(/\s+/).slice(0, 8).join(' ');
        convTitle = words.length > 50 ? words.slice(0, 50) + '...' : words;
      }
      if (convId) {
        await db.update(chatConversations).set({ messages: newHistory, updatedAt: new Date() }).where(eq(chatConversations.id, convId));
      } else {
        const [inserted] = await db.insert(chatConversations).values({ userId: ctx.user.id, title: convTitle ?? undefined, messages: newHistory });
        convId = (inserted as { insertId: number }).insertId;
      }
      return { reply: result.reply, conversationId: convId ?? null, title: convTitle, toolsUsed: result.toolResults?.map((t) => t.kind) ?? [], toolResults: result.toolResults ?? [], artifacts: [], dagSummary: result.dagSummary ?? null };
    }),
  conversations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb(); if (!db) return [];
    return db.select().from(chatConversations).where(eq(chatConversations.userId, ctx.user.id)).orderBy(desc(chatConversations.updatedAt)).limit(50);
  }),
  getConversation: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) return null;
    const [conv] = await db.select().from(chatConversations).where(and(eq(chatConversations.id, input.id), eq(chatConversations.userId, ctx.user.id))).limit(1);
    return conv ?? null;
  }),
  deleteConversation: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) return { success: false };
    await db.delete(chatConversations).where(and(eq(chatConversations.id, input.id), eq(chatConversations.userId, ctx.user.id)));
    return { success: true };
  }),
  memory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb(); if (!db) return null;
    const [mem] = await db.select().from(userMemory).where(eq(userMemory.userId, ctx.user.id)).limit(1);
    return mem ?? null;
  }),
  updateMemory: protectedProcedure
    .input(z.object({ businessContext: z.record(z.string(), z.unknown()).optional(), preferences: z.record(z.string(), z.unknown()).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) return { success: false };
      const [existing] = await db.select().from(userMemory).where(eq(userMemory.userId, ctx.user.id)).limit(1);
      if (existing) { await db.update(userMemory).set(input).where(eq(userMemory.userId, ctx.user.id)); }
      else { await db.insert(userMemory).values({ userId: ctx.user.id, ...input }); }
      return { success: true };
    }),
  researchBrand: protectedProcedure
    .input(z.object({ input: z.string(), entryPoint: z.enum(["new", "existing", "task", "clarify"]) }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Call real StrategyAgent with web research
      // For now, return mock strategy
      const strategy = {
        brandName: "Your Brand",
        positioning: "Market leader in your industry",
        audience: ["Entrepreneurs", "Business Owners"],
        channels: ["social", "email", "content", "ad"],
        recommendedAssets: ["blog", "email", "social", "ad", "landing", "seo"],
        competitors: [],
        tone: "professional",
      };
      return { strategy };
    }),
  createProject: protectedProcedure
    .input(z.object({ name: z.string(), strategy: z.any(), selectedAssets: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      const projectId = crypto.randomUUID();
      
      // Insert project
      await db.insert(projects).values({
        id: projectId,
        userId: ctx.user.id,
        name: input.name,
        strategy_json: input.strategy,
        status: "draft",
      });
      
      // Create placeholder assets for selected types
      const assets = [];
      for (const assetType of input.selectedAssets) {
        const assetId = crypto.randomUUID();
        await db.insert(projectAssets).values({
          id: assetId,
          projectId,
          type: assetType,
          status: "generating",
        });
        assets.push({
          id: assetId,
          type: assetType,
          status: "generating",
          versionNumber: 1,
        });
      }
      
      return {
        id: projectId,
        name: input.name,
        campaign_score: 0,
        assets,
      };
    }),
  generateCampaign: protectedProcedure
    .input(z.object({ projectId: z.string(), strategyJson: z.any(), selectedAssets: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Queue DAG execution via BullMQ
      // This would enqueue the 11-agent pipeline
      return { success: true };
    }),
  updateAsset: protectedProcedure
    .input(z.object({ assetId: z.string(), content: z.any().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      // Get current asset
      const [current] = await db.select().from(projectAssets).where(eq(projectAssets.id, input.assetId));
      if (!current) throw new Error("Asset not found");
      
      // Create new version
      const newVersionId = crypto.randomUUID();
      const newVersion = (current.version_number || 1) + 1;
      
      await db.insert(projectAssets).values({
        id: newVersionId,
        projectId: current.projectId,
        type: current.type,
        version_number: newVersion,
        parent_id: input.assetId,
        content_json: input.content || current.content_json,
        status: "ready",
        regen_count: (current.regen_count || 0) + 1,
      });
      
      return {
        id: newVersionId,
        type: current.type,
        versionNumber: newVersion,
        contentJson: input.content || current.content_json,
        status: "ready",
        regen_count: (current.regen_count || 0) + 1,
      };
    }),
  publishAsset: protectedProcedure
    .input(z.object({ assetId: z.string(), platform: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      
      // Update asset status to published
      await db.update(projectAssets)
        .set({
          status: "published",
          platform: input.platform,
          published_url: `https://${input.platform}.com/post/123`, // TODO: Real URL
        })
        .where(eq(projectAssets.id, input.assetId));
      
      return { success: true };
    }),
  saveBrandKit: protectedProcedure
    .input(z.object({
      logoUrl: z.string().optional(),
      primaryColor: z.string(),
      secondaryColor: z.string(),
      fontFamily: z.string(),
      tone_of_voice: z.string(),
      brand_keywords: z.array(z.string()),
      competitor_exclusions: z.array(z.string()),
      target_audience: z.string(),
      presenter_profile: z.any().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Check if brand kit exists for this user
      const [existing] = await db.select().from(brandKits)
        .where(eq(brandKits.userId, ctx.user.id))
        .limit(1);

      if (existing) {
        // Update existing - use only fields that exist in the schema
        await db.update(brandKits)
          .set({
            primaryColor: input.primaryColor,
            secondaryColor: input.secondaryColor,
            primaryFont: input.fontFamily,
            logoUrl: input.logoUrl,
          })
          .where(eq(brandKits.userId, ctx.user.id));
      } else {
        // Insert new
        await db.insert(brandKits).values({
          userId: ctx.user.id,
          name: "My Brand Kit",
          primaryColor: input.primaryColor,
          secondaryColor: input.secondaryColor,
          primaryFont: input.fontFamily,
          logoUrl: input.logoUrl,
          isDefault: true,
        });
      }

      return { success: true };
    }),
  getBrandKit: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const [kit] = await db.select().from(brandKits).where(eq(brandKits.userId, ctx.user.id));
      return kit || null;
    }),
  getDemoProject: protectedProcedure
    .query(async () => {
      // Return demo campaign for new users
      // TODO: Check if user has any projects, only show demo if none exist
      const { DEMO_CAMPAIGN, DEMO_BRAND_KIT } = await import("./demo-campaign");
      return {
        campaign: DEMO_CAMPAIGN,
        brandKit: DEMO_BRAND_KIT,
        isDemo: true,
      };
    }),
});

const campaignsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb(); if (!db) return [];
    return db.select().from(campaigns).where(eq(campaigns.userId, ctx.user.id)).orderBy(desc(campaigns.createdAt));
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string(), objective: z.enum(["awareness", "traffic", "engagement", "leads", "sales", "app_installs"]).optional(), budgetAllocation: z.record(z.string(), z.unknown()).optional(), startDate: z.string().optional(), endDate: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) return { success: false };
      await db.insert(campaigns).values({ userId: ctx.user.id, name: input.name, objective: input.objective ?? "awareness", budgetAllocation: input.budgetAllocation ?? {}, startDate: input.startDate ? new Date(input.startDate) : undefined, endDate: input.endDate ? new Date(input.endDate) : undefined });
      return { success: true };
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "active", "paused", "completed", "archived"]).optional(), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) return { success: false };
      const { id, ...rest } = input;
      await db.update(campaigns).set(rest).where(and(eq(campaigns.id, id), eq(campaigns.userId, ctx.user.id)));
      return { success: true };
    }),
});

const contentRouter = router({
  list: protectedProcedure.input(z.object({ campaignId: z.number().optional(), search: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) return [];
    const conditions = [eq(contents.userId, ctx.user.id)];
    if (input?.campaignId) conditions.push(eq(contents.campaignId, input.campaignId));
    return db.select().from(contents).where(and(...conditions)).orderBy(desc(contents.createdAt));
  }),
  create: protectedProcedure
    .input(z.object({ type: z.string(), title: z.string().optional(), body: z.string(), platform: z.string().optional(), campaignId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) return { success: false };
      await db.insert(contents).values({ userId: ctx.user.id, type: input.type as "ad_copy_short", title: input.title, body: input.body, platform: input.platform, campaignId: input.campaignId });
      return { success: true };
    }),
  update: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "approved", "scheduled", "published", "archived"]).optional(), body: z.string().optional(), title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) return { success: false };
      const { id, ...rest } = input;
      await db.update(contents).set(rest).where(and(eq(contents.id, id), eq(contents.userId, ctx.user.id)));
      return { success: true };
    }),
});

const analyticsRouter = router({
  overview: protectedProcedure.input(z.object({ campaignId: z.number().optional(), period: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) return { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0, ctr: "0%", roas: "0" };
    const conditions = [eq(analyticsEvents.userId, ctx.user.id)];
    if (input?.campaignId) conditions.push(eq(analyticsEvents.campaignId, input.campaignId));
    const events = await db.select().from(analyticsEvents).where(and(...conditions)).limit(1000);
    const totals = events.reduce((acc, e) => ({ impressions: acc.impressions + (e.impressions ?? 0), clicks: acc.clicks + (e.clicks ?? 0), conversions: acc.conversions + (e.conversions ?? 0), spend: acc.spend + (e.spend ?? 0), revenue: acc.revenue + (e.revenue ?? 0) }), { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 });
    return { ...totals, ctr: totals.impressions > 0 ? `${((totals.clicks / totals.impressions) * 100).toFixed(2)}%` : "0%", roas: totals.spend > 0 ? (totals.revenue / totals.spend).toFixed(2) : "0", period: input?.period ?? "month" };
  }),
  events: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb(); if (!db) return [];
    return db.select().from(analyticsEvents).where(eq(analyticsEvents.userId, ctx.user.id)).orderBy(desc(analyticsEvents.recordedAt)).limit(200);
  }),
});

const crmRouter = router({
  leads: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(leads).where(eq(leads.userId, ctx.user.id)).orderBy(desc(leads.createdAt)); }),
  deals: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(deals).where(eq(deals.userId, ctx.user.id)).orderBy(desc(deals.createdAt)); }),
  createLead: protectedProcedure.input(z.object({ firstName: z.string().optional(), lastName: z.string().optional(), email: z.string().optional(), company: z.string().optional(), phone: z.string().optional(), source: z.string().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.insert(leads).values({ userId: ctx.user.id, ...input }); return { success: true }; }),
  updateLeadStatus: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["new", "contacted", "qualified", "unqualified", "converted", "lost"]) })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.update(leads).set({ status: input.status }).where(and(eq(leads.id, input.id), eq(leads.userId, ctx.user.id))); return { success: true }; }),
});

const brandRouter = router({
  voices: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(brandVoices).where(eq(brandVoices.userId, ctx.user.id)).orderBy(desc(brandVoices.createdAt)); }),
  kit: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return null; const [k] = await db.select().from(brandKits).where(eq(brandKits.userId, ctx.user.id)).limit(1); return k ?? null; }),
  updateKit: protectedProcedure.input(z.object({ name: z.string().optional(), primaryColor: z.string().optional(), secondaryColor: z.string().optional(), primaryFont: z.string().optional(), logoUrl: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) return { success: false };
    const [existing] = await db.select().from(brandKits).where(eq(brandKits.userId, ctx.user.id)).limit(1);
    if (existing) { await db.update(brandKits).set(input).where(eq(brandKits.userId, ctx.user.id)); } else { await db.insert(brandKits).values({ userId: ctx.user.id, name: input.name ?? "My Brand", ...input }); }
    return { success: true };
  }),
  createVoice: protectedProcedure.input(z.object({ name: z.string(), toneProfile: z.string().optional(), sampleContent: z.string().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.insert(brandVoices).values({ userId: ctx.user.id, name: input.name, toneProfile: input.toneProfile, sampleContent: input.sampleContent }); return { success: true }; }),
});

const schedulerRouter = router({
  queue: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(scheduledPosts).where(eq(scheduledPosts.userId, ctx.user.id)).orderBy(desc(scheduledPosts.scheduledAt)).limit(100); }),
  schedule: protectedProcedure.input(z.object({ contentId: z.number(), platform: z.string(), scheduledAt: z.string() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.insert(scheduledPosts).values({ userId: ctx.user.id, contentId: input.contentId, platform: input.platform, scheduledAt: new Date(input.scheduledAt) }); return { success: true }; }),
  cancel: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.update(scheduledPosts).set({ status: "canceled" }).where(and(eq(scheduledPosts.id, input.id), eq(scheduledPosts.userId, ctx.user.id))); return { success: true }; }),
});

const dspRouter = router({
  wallet: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return null; const [w] = await db.select().from(dspAdWallets).where(eq(dspAdWallets.userId, ctx.user.id)).limit(1); return w ?? null; }),
  campaigns: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(dspCampaigns).where(eq(dspCampaigns.userId, ctx.user.id)).orderBy(desc(dspCampaigns.createdAt)); }),
  fundWallet: protectedProcedure.input(z.object({ amountCents: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) return { success: false };
    const [existing] = await db.select().from(dspAdWallets).where(eq(dspAdWallets.userId, ctx.user.id)).limit(1);
    if (existing) { await db.update(dspAdWallets).set({ balanceCents: existing.balanceCents + input.amountCents, totalDepositedCents: existing.totalDepositedCents + input.amountCents }).where(eq(dspAdWallets.userId, ctx.user.id)); }
    else { await db.insert(dspAdWallets).values({ userId: ctx.user.id, balanceCents: input.amountCents, totalDepositedCents: input.amountCents }); }
    return { success: true };
  }),
});

const seoRouter = router({
  audits: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(seoAudits).where(eq(seoAudits.userId, ctx.user.id)).orderBy(desc(seoAudits.createdAt)); }),
});

const competitorsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(competitorProfiles).where(eq(competitorProfiles.userId, ctx.user.id)).orderBy(desc(competitorProfiles.createdAt)); }),
  add: protectedProcedure.input(z.object({ name: z.string(), url: z.string(), positioning: z.string().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.insert(competitorProfiles).values({ userId: ctx.user.id, name: input.name, url: input.url, positioning: input.positioning }); return { success: true }; }),
});

const reviewsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(reviews).where(eq(reviews.userId, ctx.user.id)).orderBy(desc(reviews.createdAt)); }),
  sources: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(reviewSources).where(eq(reviewSources.userId, ctx.user.id)); }),
  reply: protectedProcedure.input(z.object({ id: z.number(), aiReply: z.string() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.update(reviews).set({ aiReply: input.aiReply, repliedAt: new Date() }).where(and(eq(reviews.id, input.id), eq(reviews.userId, ctx.user.id))); return { success: true }; }),
});

const reportsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(reports).where(eq(reports.userId, ctx.user.id)).orderBy(desc(reports.createdAt)); }),
  getByToken: publicProcedure.input(z.object({ token: z.string() })).query(async ({ input }) => { const db = await getDb(); if (!db) return null; const [r] = await db.select().from(reports).where(eq(reports.shareToken, input.token)).limit(1); return r ?? null; }),
});

const abTestsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(abTests).where(eq(abTests.userId, ctx.user.id)).orderBy(desc(abTests.createdAt)); }),
  create: protectedProcedure.input(z.object({ name: z.string(), type: z.string(), variants: z.array(z.record(z.string(), z.unknown())).optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.insert(abTests).values({ userId: ctx.user.id, name: input.name, type: input.type }); return { success: true }; }),
});

const funnelsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(funnels).where(eq(funnels.userId, ctx.user.id)).orderBy(desc(funnels.createdAt)); }),
  create: protectedProcedure.input(z.object({ name: z.string(), description: z.string().optional(), conversionGoal: z.string().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.insert(funnels).values({ userId: ctx.user.id, name: input.name, description: input.description, conversionGoal: input.conversionGoal }); return { success: true }; }),
});

const automationsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(automationWorkflows).where(eq(automationWorkflows.userId, ctx.user.id)).orderBy(desc(automationWorkflows.createdAt)); }),
  toggle: protectedProcedure.input(z.object({ id: z.number(), isActive: z.boolean() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.update(automationWorkflows).set({ isActive: input.isActive }).where(and(eq(automationWorkflows.id, input.id), eq(automationWorkflows.userId, ctx.user.id))); return { success: true }; }),
});

const videoRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(videoAds).where(eq(videoAds.userId, ctx.user.id)).orderBy(desc(videoAds.createdAt)); }),
  create: protectedProcedure.input(z.object({ script: z.string(), platform: z.enum(["tiktok", "youtube", "reels", "youtube_shorts", "facebook", "snapchat", "pinterest"]), hook: z.string().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.insert(videoAds).values({ userId: ctx.user.id, platform: input.platform, script: input.script, hook: input.hook }); return { success: true }; }),
});

const creativesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(creatives).where(eq(creatives.userId, ctx.user.id)).orderBy(desc(creatives.createdAt)); }),
});

const templatesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(contentTemplates).where(eq(contentTemplates.userId, ctx.user.id)).orderBy(desc(contentTemplates.createdAt)); }),
  create: protectedProcedure.input(z.object({ name: z.string(), type: z.string(), structure: z.string(), description: z.string().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.insert(contentTemplates).values({ userId: ctx.user.id, name: input.name, type: input.type, structure: input.structure, description: input.description }); return { success: true }; }),
});

const productsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(products).where(eq(products.userId, ctx.user.id)).orderBy(desc(products.createdAt)); }),
  create: protectedProcedure.input(z.object({ name: z.string(), description: z.string().optional(), url: z.string().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.insert(products).values({ userId: ctx.user.id, name: input.name, description: input.description, url: input.url }); return { success: true }; }),
});

const teamRouter = router({
  members: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(teamMembers).where(eq(teamMembers.ownerId, ctx.user.id)).orderBy(desc(teamMembers.createdAt)); }),
  approvals: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(approvalWorkflows).where(eq(approvalWorkflows.requestedBy, ctx.user.id)).orderBy(desc(approvalWorkflows.createdAt)); }),
  invite: protectedProcedure.input(z.object({ email: z.string(), role: z.enum(["owner", "admin", "member", "viewer"]).optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; const token = Math.random().toString(36).slice(2, 18); await db.insert(teamMembers).values({ ownerId: ctx.user.id, email: input.email, role: input.role ?? "member", inviteToken: token }); return { success: true, token }; }),
  remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.update(teamMembers).set({ status: "inactive" }).where(and(eq(teamMembers.id, input.id), eq(teamMembers.ownerId, ctx.user.id))); return { success: true }; }),
});

const settingsRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return null; const [s] = await db.select().from(userSettings).where(eq(userSettings.userId, ctx.user.id)).limit(1); return s ?? null; }),
  update: protectedProcedure.input(z.object({ timezone: z.string().optional(), defaultLanguage: z.string().optional(), emailNotifications: z.boolean().optional(), pushNotifications: z.boolean().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) return { success: false };
    const [existing] = await db.select().from(userSettings).where(eq(userSettings.userId, ctx.user.id)).limit(1);
    if (existing) { await db.update(userSettings).set(input).where(eq(userSettings.userId, ctx.user.id)); } else { await db.insert(userSettings).values({ userId: ctx.user.id, ...input }); }
    return { success: true };
  }),
  integrations: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(integrations).where(eq(integrations.userId, ctx.user.id)).orderBy(desc(integrations.createdAt)); }),
  disconnectIntegration: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.update(integrations).set({ isActive: false }).where(and(eq(integrations.id, input.id), eq(integrations.userId, ctx.user.id))); return { success: true }; }),
});

const billingRouter = router({
  subscription: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return null; const [s] = await db.select().from(subscriptions).where(eq(subscriptions.userId, ctx.user.id)).limit(1); return s ?? null; }),
  history: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(billingTransactions).where(eq(billingTransactions.userId, ctx.user.id)).orderBy(desc(billingTransactions.createdAt)).limit(50); }),
  credits: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb(); if (!db) return { balance: 0, history: [] };
    const ledger = await db.select().from(creditLedger).where(eq(creditLedger.userId, ctx.user.id)).orderBy(desc(creditLedger.createdAt)).limit(20);
    const balance = ledger.reduce((sum, e) => sum + (e.type === "spend" ? -e.amount : e.amount), 0);
    return { balance, history: ledger };
  }),
  createCheckoutSession: protectedProcedure.input(z.object({ tier: z.string(), origin: z.string() })).mutation(async ({ ctx, input }) => {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
    const tierPrices: Record<string, string> = {
      starter: process.env.STRIPE_PRICE_STARTER ?? "",
      professional: process.env.STRIPE_PRICE_PROFESSIONAL ?? "",
      business: process.env.STRIPE_PRICE_BUSINESS ?? "",
      agency: process.env.STRIPE_PRICE_AGENCY ?? "",
      growth: process.env.STRIPE_PRICE_GROWTH ?? process.env.STRIPE_PRICE_PROFESSIONAL ?? "", // legacy alias
    };
    const priceId = tierPrices[input.tier];
    if (!priceId) throw new TRPCError({ code: "BAD_REQUEST", message: `Stripe Price ID not configured for tier '${input.tier}'. Add STRIPE_PRICE_${input.tier.toUpperCase()} in Settings → Payment.` });
    const session = await stripe.checkout.sessions.create({ mode: "subscription", payment_method_types: ["card"], line_items: [{ price: priceId, quantity: 1 }], success_url: `${input.origin}/billing?success=1`, cancel_url: `${input.origin}/billing?canceled=1`, metadata: { userId: String(ctx.user.id), tier: input.tier } });
    return { url: session.url };
  }),
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb(); if (!db) return { success: false };
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, ctx.user.id)).limit(1);
    if (!sub?.stripeSubscriptionId) return { success: false };
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
    await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
    await db.update(subscriptions).set({ status: "canceled" }).where(eq(subscriptions.userId, ctx.user.id));
    return { success: true };
  }),
});

const emailRouter = router({
  sequences: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(emailSequences).where(eq(emailSequences.userId, ctx.user.id)).orderBy(desc(emailSequences.createdAt)); }),
  sends: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(emailSends).where(eq(emailSends.userId, ctx.user.id)).orderBy(desc(emailSends.createdAt)).limit(100); }),
  send: protectedProcedure.input(z.object({ toEmail: z.string(), subject: z.string(), body: z.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb(); if (!db) return { success: false };
    await db.insert(emailSends).values({ userId: ctx.user.id, toEmail: input.toEmail, subject: input.subject, body: input.body });
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY ?? "");
      const result = await resend.emails.send({ from: "ARIA <noreply@aria.ai>", to: input.toEmail, subject: input.subject, html: input.body });
      if (result.data?.id) { await db.update(emailSends).set({ status: "sent", resendMessageId: result.data.id, sentAt: new Date() }).where(and(eq(emailSends.userId, ctx.user.id), eq(emailSends.toEmail, input.toEmail))); }
    } catch (e) { console.error("[Email] Send failed:", e); }
    return { success: true };
  }),
});

const landingPagesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(landingPages).where(eq(landingPages.userId, ctx.user.id)).orderBy(desc(landingPages.createdAt)); }),
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => { const db = await getDb(); if (!db) return null; const [page] = await db.select().from(landingPages).where(and(eq(landingPages.slug, input.slug), eq(landingPages.isPublished, true))).limit(1); return page ?? null; }),
  create: protectedProcedure.input(z.object({ name: z.string(), slug: z.string(), htmlContent: z.string().optional(), campaignId: z.number().optional() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.insert(landingPages).values({ userId: ctx.user.id, name: input.name, slug: input.slug, htmlContent: input.htmlContent, campaignId: input.campaignId }); return { success: true }; }),
  publish: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => { const db = await getDb(); if (!db) return { success: false }; await db.update(landingPages).set({ isPublished: true }).where(and(eq(landingPages.id, input.id), eq(landingPages.userId, ctx.user.id))); return { success: true }; }),
});

const formsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => { const db = await getDb(); if (!db) return []; return db.select().from(forms).where(eq(forms.userId, ctx.user.id)).orderBy(desc(forms.createdAt)); }),
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => { const db = await getDb(); if (!db) return null; const [f] = await db.select().from(forms).where(eq(forms.slug, input.slug)).limit(1); return f ?? null; }),
  submit: publicProcedure.input(z.object({ formId: z.number(), data: z.record(z.string(), z.unknown()), ipAddress: z.string().optional() })).mutation(async ({ input }) => { const db = await getDb(); if (!db) return { success: false }; await db.insert(formSubmissions).values({ formId: input.formId, data: input.data, ipAddress: input.ipAddress }); return { success: true }; }),
});

const voiceRouter = router({
  transcribe: protectedProcedure
    .input(z.object({ audioUrl: z.string(), language: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        const { transcribeAudio } = await import("./_core/voiceTranscription");
        const result = await transcribeAudio({ audioUrl: input.audioUrl, language: input.language });
        if ('error' in result) return { text: "", language: "en" };
        return { text: (result as { text: string; language?: string }).text, language: (result as { text: string; language?: string }).language ?? "en" };
      } catch (e) {
        console.error("[Voice] Transcription failed:", e);
        return { text: "", language: "en" };
      }
    }),
});

const adminRouter = router({
  users: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Forbidden");
    const db = await getDb(); if (!db) return [];
    return db.select().from(users).orderBy(desc(users.createdAt)).limit(100);
  }),
  stats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Forbidden");
    const db = await getDb(); if (!db) return { totalUsers: 0, totalCampaigns: 0 };
    const allUsers = await db.select().from(users);
    const allCampaigns = await db.select().from(campaigns);
    return { totalUsers: allUsers.length, totalCampaigns: allCampaigns.length };
  }),
});

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  aria: ariaRouter,
  campaigns: campaignsRouter,
  content: contentRouter,
  analytics: analyticsRouter,
  crm: crmRouter,
  brand: brandRouter,
  scheduler: schedulerRouter,
  dsp: dspRouter,
  seo: seoRouter,
  competitors: competitorsRouter,
  reviews: reviewsRouter,
  reports: reportsRouter,
  abTests: abTestsRouter,
  funnels: funnelsRouter,
  automations: automationsRouter,
  video: videoRouter,
  creatives: creativesRouter,
  templates: templatesRouter,
  products: productsRouter,
  team: teamRouter,
  settings: settingsRouter,
  billing: billingRouter,
  email: emailRouter,
  landingPages: landingPagesRouter,
  forms: formsRouter,
  voice: voiceRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
