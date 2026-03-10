// server/aria/tools/build.ts
// BUILD tools — all use Anthropic Claude (primary) via invokeStructuredLLM, OpenAI fallback

import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import {
  campaigns, campaignAssets, contents, emailCampaigns,
  landingPages, videoAds, creatives, brandVoices, abTests, abTestVariants,
  funnels, funnelSteps, automationWorkflows, leads, deals,
} from "../../../drizzle/schema";
import { invokeStructuredLLM } from "../llm-provider";
import { generateImage } from "../../_core/imageGeneration";
import type { ToolResult } from "../memory";
import { nanoid } from "nanoid";

// ─── CREATE CAMPAIGN ──────────────────────────────────────────────────────────
export async function createCampaign(userId: number, args: {
  name: string; objective?: string; platforms?: string[]; productId?: number;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "createCampaign", status: "error", data: {}, message: "DB unavailable" };

  try {
    const strategy = await invokeStructuredLLM<{
      channelStrategy: string; postingSchedule: string; audienceTargeting: string;
      budgetAllocation: string; kpis: string[];
    }>({
      systemPrompt: "You are a senior marketing strategist. Create data-driven, actionable campaign strategies.",
      userPrompt: `Create a complete campaign strategy for: "${args.name}"\nObjective: ${args.objective ?? "awareness"}\nPlatforms: ${(args.platforms ?? ["instagram", "facebook"]).join(", ")}`,
      schemaName: "campaign_strategy",
      schema: {
        type: "object",
        properties: {
          channelStrategy: { type: "string" },
          postingSchedule: { type: "string" },
          audienceTargeting: { type: "string" },
          budgetAllocation: { type: "string" },
          kpis: { type: "array", items: { type: "string" } },
        },
        required: ["channelStrategy", "postingSchedule", "audienceTargeting", "budgetAllocation", "kpis"],
        additionalProperties: false,
      },
    });

    const [inserted] = await db.insert(campaigns).values({
      userId,
      productId: args.productId ?? null,
      name: args.name,
      objective: (args.objective as "awareness" | "traffic" | "engagement" | "leads" | "sales" | "app_installs") ?? "awareness",
      platforms: args.platforms ?? ["instagram", "facebook"],
      strategy,
      postingSchedule: { description: strategy.postingSchedule },
      audienceTargeting: { description: strategy.audienceTargeting },
      budgetAllocation: { description: strategy.budgetAllocation },
      kpis: strategy.kpis,
      status: "draft",
    });

    const campaignId = (inserted as unknown as { insertId: number }).insertId;
    return { kind: "createCampaign", status: "success", recordId: campaignId, data: { id: campaignId, name: args.name, objective: args.objective, platforms: args.platforms, strategy } };
  } catch (err) {
    return { kind: "createCampaign", status: "error", data: {}, message: String(err) };
  }
}

// ─── GENERATE CONTENT ─────────────────────────────────────────────────────────
export async function generateContent(userId: number, args: {
  type: string; topic?: string; platform?: string; productId?: number;
  campaignId?: number; brandVoiceId?: number; language?: string; instruction?: string;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "generateContent", status: "error", data: {}, message: "DB unavailable" };

  try {
    const { title, body } = await invokeStructuredLLM<{ title: string; body: string }>({
      systemPrompt: "You are an expert marketing copywriter. Write compelling, conversion-focused content that sounds human and authentic.",
      userPrompt: `Write ${args.type.replace(/_/g, " ")} content.\nTopic/Product: ${args.topic ?? "the product"}\nPlatform: ${args.platform ?? "general"}\n${args.instruction ? `Special instruction: ${args.instruction}` : ""}\nLanguage: ${args.language ?? "English"}\n\nReturn a title and body.`,
      schemaName: "content",
      schema: {
        type: "object",
        properties: { title: { type: "string" }, body: { type: "string" } },
        required: ["title", "body"],
        additionalProperties: false,
      },
    });

    const validTypes = ["ad_copy_short","ad_copy_long","blog_post","seo_meta","social_caption","video_script","email_copy","pr_release","podcast_script","tv_script","radio_script","copywriting","amazon_listing","google_ads","youtube_seo","twitter_thread","linkedin_article","whatsapp_broadcast","sms_copy","story_content","ugc_script","landing_page"] as const;
    const contentType = validTypes.includes(args.type as typeof validTypes[number]) ? args.type as typeof validTypes[number] : "ad_copy_short";

    const [inserted] = await db.insert(contents).values({
      userId, productId: args.productId ?? null, campaignId: args.campaignId ?? null,
      brandVoiceId: args.brandVoiceId ?? null, type: contentType, platform: args.platform ?? null,
      title, body, language: args.language ?? "en", status: "draft",
    });
    const contentId = (inserted as unknown as { insertId: number }).insertId;

    if (args.campaignId) {
      await db.insert(campaignAssets).values({ campaignId: args.campaignId, assetType: "content", assetId: contentId });
    }

    return { kind: "generateContent", status: "success", recordId: contentId, data: { id: contentId, type: args.type, title, body: body.substring(0, 300), platform: args.platform } };
  } catch (err) {
    return { kind: "generateContent", status: "error", data: {}, message: String(err) };
  }
}

// ─── GENERATE EMAIL SEQUENCE ──────────────────────────────────────────────────
export async function generateEmailSequence(userId: number, args: {
  name: string; topic?: string; emailCount?: number; campaignId?: number; listId?: number;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "generateEmailSequence", status: "error", data: {}, message: "DB unavailable" };

  try {
    const count = args.emailCount ?? 3;
    const { emails } = await invokeStructuredLLM<{
      emails: Array<{ subject: string; previewText: string; htmlBody: string; purpose: string }>;
    }>({
      systemPrompt: "You are an email marketing expert. Write high-converting email sequences with compelling subject lines and full HTML bodies.",
      userPrompt: `Create a ${count}-email sequence for: "${args.name}"\nTopic: ${args.topic ?? args.name}\nEach email should have a clear purpose in the sequence (welcome, value, pitch, follow-up, etc.)`,
      schemaName: "email_sequence",
      schema: {
        type: "object",
        properties: {
          emails: {
            type: "array",
            items: {
              type: "object",
              properties: {
                subject: { type: "string" },
                previewText: { type: "string" },
                htmlBody: { type: "string" },
                purpose: { type: "string" },
              },
              required: ["subject", "previewText", "htmlBody", "purpose"],
              additionalProperties: false,
            },
          },
        },
        required: ["emails"],
        additionalProperties: false,
      },
    });

    const emailIds: number[] = [];
    for (const email of emails) {
      const [inserted] = await db.insert(emailCampaigns).values({
        userId, campaignId: args.campaignId ?? null, listId: args.listId ?? null,
        name: `${args.name} — ${email.purpose}`,
        subject: email.subject, previewText: email.previewText, htmlBody: email.htmlBody, status: "draft",
      });
      const emailId = (inserted as unknown as { insertId: number }).insertId;
      emailIds.push(emailId);
      if (args.campaignId) {
        await db.insert(campaignAssets).values({ campaignId: args.campaignId, assetType: "email", assetId: emailId });
      }
    }

    return {
      kind: "generateEmailSequence", status: "success", recordId: emailIds[0],
      data: { emailIds, count: emails.length, name: args.name, subjects: emails.map((e) => e.subject) },
    };
  } catch (err) {
    return { kind: "generateEmailSequence", status: "error", data: {}, message: String(err) };
  }
}

// ─── GENERATE SOCIAL POSTS ────────────────────────────────────────────────────
export async function generateSocialPosts(userId: number, args: {
  topic: string; platforms?: string[]; campaignId?: number; productId?: number; count?: number;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "generateSocialPosts", status: "error", data: {}, message: "DB unavailable" };

  try {
    const platforms = args.platforms ?? ["instagram", "twitter", "linkedin"];
    const count = args.count ?? 3;

    const { posts } = await invokeStructuredLLM<{
      posts: Array<{ platform: string; caption: string; hashtags: string[]; callToAction: string }>;
    }>({
      systemPrompt: "You are a social media expert who writes platform-native content that drives engagement and conversions.",
      userPrompt: `Create ${count} social media posts for each platform: ${platforms.join(", ")}\nTopic: ${args.topic}\nMake each post feel native to its platform — TikTok-style for TikTok, professional for LinkedIn, etc.`,
      schemaName: "social_posts",
      schema: {
        type: "object",
        properties: {
          posts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string" },
                caption: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } },
                callToAction: { type: "string" },
              },
              required: ["platform", "caption", "hashtags", "callToAction"],
              additionalProperties: false,
            },
          },
        },
        required: ["posts"],
        additionalProperties: false,
      },
    });

    const contentIds: number[] = [];
    for (const post of posts) {
      const body = `${post.caption}\n\n${post.hashtags.join(" ")}\n\n${post.callToAction}`;
      const [inserted] = await db.insert(contents).values({
        userId, productId: args.productId ?? null, campaignId: args.campaignId ?? null,
        type: "social_caption", platform: post.platform,
        title: `${post.platform} — ${args.topic.substring(0, 50)}`, body, status: "draft",
      });
      const contentId = (inserted as unknown as { insertId: number }).insertId;
      contentIds.push(contentId);
      if (args.campaignId) {
        await db.insert(campaignAssets).values({ campaignId: args.campaignId, assetType: "content", assetId: contentId });
      }
    }

    return {
      kind: "generateSocialPosts", status: "success", recordId: contentIds[0],
      data: { contentIds, count: posts.length, platforms, previews: posts.map((p) => ({ platform: p.platform, preview: p.caption.substring(0, 100) })) },
    };
  } catch (err) {
    return { kind: "generateSocialPosts", status: "error", data: {}, message: String(err) };
  }
}

// ─── GENERATE LANDING PAGE ────────────────────────────────────────────────────
export async function generateLandingPage(userId: number, args: {
  name: string; topic?: string; productId?: number; campaignId?: number; ctaText?: string;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "generateLandingPage", status: "error", data: {}, message: "DB unavailable" };

  try {
    const page = await invokeStructuredLLM<{ headline: string; subheadline: string; bodyHtml: string; ctaText: string }>({
      systemPrompt: "You are a conversion rate optimization expert. Write landing pages that convert visitors into customers.",
      userPrompt: `Create a high-converting landing page for: "${args.name}"\nTopic: ${args.topic ?? args.name}\nWrite a compelling headline, subheadline, full HTML body with sections (hero, benefits, social proof, CTA), and CTA text.`,
      schemaName: "landing_page",
      schema: {
        type: "object",
        properties: {
          headline: { type: "string" },
          subheadline: { type: "string" },
          bodyHtml: { type: "string" },
          ctaText: { type: "string" },
        },
        required: ["headline", "subheadline", "bodyHtml", "ctaText"],
        additionalProperties: false,
      },
    });

    const slug = `${args.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${nanoid(6)}`;
    const [inserted] = await db.insert(landingPages).values({
      userId, productId: args.productId ?? null, campaignId: args.campaignId ?? null,
      name: args.name, slug, headline: page.headline, subheadline: page.subheadline,
      htmlContent: page.bodyHtml, ctaText: args.ctaText ?? page.ctaText, isPublished: true,
    });
    const pageId = (inserted as unknown as { insertId: number }).insertId;

    if (args.campaignId) {
      await db.insert(campaignAssets).values({ campaignId: args.campaignId, assetType: "landing_page", assetId: pageId });
    }

    return { kind: "generateLandingPage", status: "success", recordId: pageId, data: { id: pageId, name: args.name, slug, headline: page.headline, subheadline: page.subheadline, ctaText: page.ctaText } };
  } catch (err) {
    return { kind: "generateLandingPage", status: "error", data: {}, message: String(err) };
  }
}

// ─── GENERATE VIDEO SCRIPT ────────────────────────────────────────────────────
export async function generateVideoScript(userId: number, args: {
  platform: string; topic?: string; productId?: number; campaignId?: number;
  adPreset?: string; emotion?: string; duration?: number;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "generateVideoScript", status: "error", data: {}, message: "DB unavailable" };

  try {
    const scriptData = await invokeStructuredLLM<{ hook: string; script: string; callToAction: string; estimatedDuration: number }>({
      systemPrompt: "You are a video ad scriptwriter who creates viral, high-converting video scripts for social media.",
      userPrompt: `Write a video ad script for ${args.platform}.\nTopic: ${args.topic ?? "the product"}\nAd style: ${args.adPreset ?? "ugc testimonial"}\nEmotion: ${args.emotion ?? "excited"}\nDuration: ${args.duration ?? 30} seconds\nWrite a hook that stops the scroll, a compelling script, and a strong CTA.`,
      schemaName: "video_script",
      schema: {
        type: "object",
        properties: {
          hook: { type: "string" },
          script: { type: "string" },
          callToAction: { type: "string" },
          estimatedDuration: { type: "number" },
        },
        required: ["hook", "script", "callToAction", "estimatedDuration"],
        additionalProperties: false,
      },
    });

    const validPlatforms = ["tiktok", "youtube", "reels", "youtube_shorts", "facebook", "snapchat", "pinterest"] as const;
    const platform = validPlatforms.includes(args.platform as typeof validPlatforms[number]) ? args.platform as typeof validPlatforms[number] : "tiktok";

    const [inserted] = await db.insert(videoAds).values({
      userId, productId: args.productId ?? null, campaignId: args.campaignId ?? null,
      platform, adPreset: args.adPreset ?? "ugc_testimonial",
      script: scriptData.script, hook: scriptData.hook, duration: scriptData.estimatedDuration,
      emotion: (args.emotion as "excited" | "calm" | "urgent" | "friendly" | "authoritative" | "neutral" | "empathetic" | "surprised") ?? "excited",
      status: "draft",
    });
    const videoId = (inserted as unknown as { insertId: number }).insertId;

    return { kind: "generateVideoScript", status: "success", recordId: videoId, data: { id: videoId, platform, hook: scriptData.hook, script: scriptData.script.substring(0, 300), duration: scriptData.estimatedDuration } };
  } catch (err) {
    return { kind: "generateVideoScript", status: "error", data: {}, message: String(err) };
  }
}

// ─── GENERATE AD CREATIVE ─────────────────────────────────────────────────────
export async function generateAdCreative(userId: number, args: {
  type?: string; topic?: string; productId?: number; campaignId?: number;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "generateAdCreative", status: "error", data: {}, message: "DB unavailable" };

  try {
    const creativeType = args.type ?? "ad_image";
    const dimensions: Record<string, { width: number; height: number }> = {
      ad_image: { width: 1200, height: 628 },
      social_graphic: { width: 1080, height: 1080 },
      thumbnail: { width: 1280, height: 720 },
      banner: { width: 1920, height: 480 },
      story: { width: 1080, height: 1920 },
    };
    const dim = dimensions[creativeType] ?? dimensions.ad_image;
    const prompt = `Professional ${creativeType.replace(/_/g, " ")} for ${args.topic ?? "a product"}, ${dim.width}x${dim.height}, high quality marketing image, bold colors, eye-catching design, clean composition`;

    const validTypes = ["ad_image", "social_graphic", "thumbnail", "banner", "story", "product_photo", "meme", "ad_with_copy"] as const;
    const validType = validTypes.includes(creativeType as typeof validTypes[number]) ? creativeType as typeof validTypes[number] : "ad_image";

    const [inserted] = await db.insert(creatives).values({
      userId, productId: args.productId ?? null, campaignId: args.campaignId ?? null,
      type: validType, prompt, width: dim.width, height: dim.height, status: "generating",
    });
    const creativeId = (inserted as unknown as { insertId: number }).insertId;

    try {
      const { url: imageUrl } = await generateImage({ prompt });
      await db.update(creatives).set({ imageUrl, status: "completed" }).where(eq(creatives.id, creativeId));
      if (args.campaignId) {
        await db.insert(campaignAssets).values({ campaignId: args.campaignId, assetType: "creative", assetId: creativeId });
      }
      return { kind: "generateAdCreative", status: "success", recordId: creativeId, data: { id: creativeId, type: creativeType, imageUrl, width: dim.width, height: dim.height } };
    } catch {
      await db.update(creatives).set({ status: "failed" }).where(eq(creatives.id, creativeId));
      return { kind: "generateAdCreative", status: "error", data: { id: creativeId }, message: "Image generation failed" };
    }
  } catch (err) {
    return { kind: "generateAdCreative", status: "error", data: {}, message: String(err) };
  }
}

// ─── GENERATE BRAND VOICE ─────────────────────────────────────────────────────
export async function generateBrandVoice(userId: number, args: {
  name: string; sampleContent?: string; formalityLevel?: string;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "generateBrandVoice", status: "error", data: {}, message: "DB unavailable" };

  try {
    const voiceData = await invokeStructuredLLM<{ toneProfile: string; emotionalTriggers: string[]; vocabularyPatterns: string[] }>({
      systemPrompt: "You are a brand voice strategist. Analyze and codify brand voices for consistent content generation.",
      userPrompt: `Create a brand voice profile for: "${args.name}"\n${args.sampleContent ? `Sample content: ${args.sampleContent}` : ""}\nFormality: ${args.formalityLevel ?? "neutral"}`,
      schemaName: "brand_voice",
      schema: {
        type: "object",
        properties: {
          toneProfile: { type: "string" },
          emotionalTriggers: { type: "array", items: { type: "string" } },
          vocabularyPatterns: { type: "array", items: { type: "string" } },
        },
        required: ["toneProfile", "emotionalTriggers", "vocabularyPatterns"],
        additionalProperties: false,
      },
    });

    const validFormality = ["very_formal", "formal", "neutral", "casual", "very_casual"] as const;
    const formality = validFormality.includes(args.formalityLevel as typeof validFormality[number]) ? args.formalityLevel as typeof validFormality[number] : "neutral";

    const [inserted] = await db.insert(brandVoices).values({
      userId, name: args.name, toneProfile: voiceData.toneProfile, formalityLevel: formality,
      emotionalTriggers: voiceData.emotionalTriggers, vocabularyPatterns: voiceData.vocabularyPatterns,
      sampleContent: args.sampleContent ?? null,
    });
    const voiceId = (inserted as unknown as { insertId: number }).insertId;

    return { kind: "generateBrandVoice", status: "success", recordId: voiceId, data: { id: voiceId, name: args.name, toneProfile: voiceData.toneProfile } };
  } catch (err) {
    return { kind: "generateBrandVoice", status: "error", data: {}, message: String(err) };
  }
}

// ─── CREATE AB TEST ───────────────────────────────────────────────────────────
export async function createABTest(userId: number, args: {
  name: string; type: string; campaignId?: number; variantNames?: string[];
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "createABTest", status: "error", data: {}, message: "DB unavailable" };

  try {
    const [inserted] = await db.insert(abTests).values({
      userId, campaignId: args.campaignId ?? null, name: args.name, type: args.type, status: "draft",
    });
    const testId = (inserted as unknown as { insertId: number }).insertId;
    const variantNames = args.variantNames ?? ["Variant A", "Variant B"];
    for (const variantName of variantNames) {
      await db.insert(abTestVariants).values({ testId, name: variantName });
    }
    return { kind: "createABTest", status: "success", recordId: testId, data: { id: testId, name: args.name, type: args.type, variants: variantNames } };
  } catch (err) {
    return { kind: "createABTest", status: "error", data: {}, message: String(err) };
  }
}

// ─── BUILD FUNNEL ─────────────────────────────────────────────────────────────
export async function buildFunnel(userId: number, args: {
  name: string; steps?: Array<{ type: string; name: string }>; campaignId?: number; conversionGoal?: string;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "buildFunnel", status: "error", data: {}, message: "DB unavailable" };

  try {
    const [inserted] = await db.insert(funnels).values({
      userId, campaignId: args.campaignId ?? null, name: args.name,
      conversionGoal: args.conversionGoal ?? "lead capture", status: "draft",
    });
    const funnelId = (inserted as unknown as { insertId: number }).insertId;

    const defaultSteps = args.steps ?? [
      { type: "landing", name: "Landing Page" },
      { type: "form", name: "Lead Capture Form" },
      { type: "thank_you", name: "Thank You Page" },
    ];
    const validStepTypes = ["landing", "form", "payment", "thank_you", "upsell", "email"] as const;
    for (let i = 0; i < defaultSteps.length; i++) {
      const step = defaultSteps[i];
      const stepType = validStepTypes.includes(step.type as typeof validStepTypes[number]) ? step.type as typeof validStepTypes[number] : "landing";
      await db.insert(funnelSteps).values({ funnelId, type: stepType, name: step.name, order: i + 1 });
    }

    return { kind: "buildFunnel", status: "success", recordId: funnelId, data: { id: funnelId, name: args.name, stepCount: defaultSteps.length, conversionGoal: args.conversionGoal } };
  } catch (err) {
    return { kind: "buildFunnel", status: "error", data: {}, message: String(err) };
  }
}

// ─── BUILD AUTOMATION ─────────────────────────────────────────────────────────
export async function buildAutomation(userId: number, args: {
  name: string; trigger: { type: string; condition?: string }; actions: Array<{ type: string; config?: Record<string, unknown> }>;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "buildAutomation", status: "error", data: {}, message: "DB unavailable" };

  try {
    const [inserted] = await db.insert(automationWorkflows).values({
      userId, name: args.name, trigger: args.trigger, actions: args.actions, isActive: false,
    });
    const workflowId = (inserted as unknown as { insertId: number }).insertId;
    return { kind: "buildAutomation", status: "success", recordId: workflowId, data: { id: workflowId, name: args.name, trigger: args.trigger, actionCount: args.actions.length } };
  } catch (err) {
    return { kind: "buildAutomation", status: "error", data: {}, message: String(err) };
  }
}

// ─── GENERATE SEO CONTENT ─────────────────────────────────────────────────────
export async function generateSEOContent(userId: number, args: {
  topic: string; keywords?: string[]; productId?: number; campaignId?: number;
}): Promise<ToolResult> {
  return generateContent(userId, {
    type: "blog_post", topic: `${args.topic} ${(args.keywords ?? []).join(", ")}`,
    productId: args.productId, campaignId: args.campaignId,
    instruction: `Optimize for SEO keywords: ${(args.keywords ?? [args.topic]).join(", ")}. Include keyword in title, H1, first paragraph, and naturally throughout.`,
  });
}

// ─── CREATE LEAD ──────────────────────────────────────────────────────────────
export async function createLead(userId: number, args: {
  firstName?: string; lastName?: string; email?: string; phone?: string;
  company?: string; source?: string; campaignId?: number;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "createLead", status: "error", data: {}, message: "DB unavailable" };

  try {
    const [inserted] = await db.insert(leads).values({
      userId, campaignId: args.campaignId ?? null,
      firstName: args.firstName ?? null, lastName: args.lastName ?? null,
      email: args.email ?? null, phone: args.phone ?? null, company: args.company ?? null,
      source: args.source ?? "aria", status: "new",
    });
    const leadId = (inserted as unknown as { insertId: number }).insertId;
    return { kind: "createLead", status: "success", recordId: leadId, data: { id: leadId, name: `${args.firstName ?? ""} ${args.lastName ?? ""}`.trim(), email: args.email, company: args.company } };
  } catch (err) {
    return { kind: "createLead", status: "error", data: {}, message: String(err) };
  }
}

// ─── UPDATE DEAL ──────────────────────────────────────────────────────────────
export async function updateDeal(userId: number, args: {
  dealId?: number; name?: string; stage?: string; valueCents?: number; leadId?: number;
}): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "updateDeal", status: "error", data: {}, message: "DB unavailable" };

  try {
    const validStages = ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"] as const;
    const stage = validStages.includes(args.stage as typeof validStages[number]) ? args.stage as typeof validStages[number] : "prospecting";

    if (args.dealId) {
      await db.update(deals).set({ stage, valueCents: args.valueCents ?? undefined }).where(eq(deals.id, args.dealId));
      return { kind: "updateDeal", status: "success", recordId: args.dealId, data: { id: args.dealId, stage } };
    } else {
      const [inserted] = await db.insert(deals).values({
        userId, leadId: args.leadId ?? null, name: args.name ?? "New Deal", stage, valueCents: args.valueCents ?? 0,
      });
      const dealId = (inserted as unknown as { insertId: number }).insertId;
      return { kind: "updateDeal", status: "success", recordId: dealId, data: { id: dealId, name: args.name, stage } };
    }
  } catch (err) {
    return { kind: "updateDeal", status: "error", data: {}, message: String(err) };
  }
}
