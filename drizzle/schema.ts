import {
  bigint,
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  float,
} from "drizzle-orm/mysql-core";

// ─── USERS ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "starter", "professional", "business", "agency"]).default("free").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tier: mysqlEnum("tier", ["free", "starter", "professional", "business", "agency"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "trialing", "past_due", "canceled", "unpaid"]).default("active").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  trialStart: timestamp("trialStart"),
  trialEnd: timestamp("trialEnd"),
  canceledAt: timestamp("canceledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── USER MONTHLY USAGE ───────────────────────────────────────────────────────
export const userMonthlyUsage = mysqlTable("userMonthlyUsage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM
  aiGenerationsUsed: int("aiGenerationsUsed").default(0).notNull(),
  aiImagesUsed: int("aiImagesUsed").default(0).notNull(),
  videoScriptsUsed: int("videoScriptsUsed").default(0).notNull(),
  videoMinutesUsed: int("videoMinutesUsed").default(0).notNull(),
  websiteAnalysesUsed: int("websiteAnalysesUsed").default(0).notNull(),
  abTestsUsed: int("abTestsUsed").default(0).notNull(),
  scheduledPostsUsed: int("scheduledPostsUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── CREDIT WALLETS ───────────────────────────────────────────────────────────
export const creditWallets = mysqlTable("creditWallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balanceCents: int("balanceCents").default(0).notNull(),
  totalPurchasedCents: int("totalPurchasedCents").default(0).notNull(),
  totalSpentCents: int("totalSpentCents").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── CREDIT TRANSACTIONS ──────────────────────────────────────────────────────
export const creditTransactions = mysqlTable("creditTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["purchase", "spend", "refund", "bonus"]).notNull(),
  amountCents: int("amountCents").notNull(),
  description: text("description"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── TIER LIMITS CONFIG ───────────────────────────────────────────────────────
export const tierLimitsConfig = mysqlTable("tierLimitsConfig", {
  id: int("id").autoincrement().primaryKey(),
  tier: mysqlEnum("tier", ["free", "starter", "professional", "business", "agency"]).notNull().unique(),
  aiGenerationsPerMonth: int("aiGenerationsPerMonth").default(5).notNull(),
  aiImagesPerMonth: int("aiImagesPerMonth").default(2).notNull(),
  videoScriptsPerMonth: int("videoScriptsPerMonth").default(0).notNull(),
  websiteAnalysesPerMonth: int("websiteAnalysesPerMonth").default(1).notNull(),
  maxProducts: int("maxProducts").default(1).notNull(),
  maxTeamMembers: int("maxTeamMembers").default(1).notNull(),
  maxScheduledPosts: int("maxScheduledPosts").default(0).notNull(),
  dspEnabled: boolean("dspEnabled").default(false).notNull(),
  dspMarkupRateBps: int("dspMarkupRateBps").default(2000).notNull(),
  dspMinAdSpendCents: int("dspMinAdSpendCents").default(5000).notNull(),
  webhooksEnabled: boolean("webhooksEnabled").default(false).notNull(),
  whitelabelEnabled: boolean("whitelabelEnabled").default(false).notNull(),
  apiAccessEnabled: boolean("apiAccessEnabled").default(false).notNull(),
  voiceAiEnabled: boolean("voiceAiEnabled").default(false).notNull(),
  predictiveEnabled: boolean("predictiveEnabled").default(false).notNull(),
  seoAuditEnabled: boolean("seoAuditEnabled").default(false).notNull(),
  musicStudioEnabled: boolean("musicStudioEnabled").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: text("name").notNull(),
  url: text("url"),
  description: text("description"),
  analysisStatus: mysqlEnum("analysisStatus", ["pending", "analyzing", "completed", "failed"]).default("pending").notNull(),
  features: json("features"),
  benefits: json("benefits"),
  targetAudience: text("targetAudience"),
  positioning: text("positioning"),
  keywords: json("keywords"),
  tone: text("tone"),
  competitiveAdvantages: json("competitiveAdvantages"),
  painPoints: json("painPoints"),
  valueProps: json("valueProps"),
  differentiators: json("differentiators"),
  rawScrapedData: json("rawScrapedData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── BRAND VOICES ─────────────────────────────────────────────────────────────
export const brandVoices = mysqlTable("brandVoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  toneProfile: text("toneProfile"),
  formalityLevel: mysqlEnum("formalityLevel", ["very_formal", "formal", "neutral", "casual", "very_casual"]).default("neutral"),
  emotionalTriggers: json("emotionalTriggers"),
  vocabularyPatterns: json("vocabularyPatterns"),
  sampleContent: text("sampleContent"),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── BRAND KITS ───────────────────────────────────────────────────────────────
export const brandKits = mysqlTable("brandKits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  primaryColor: varchar("primaryColor", { length: 7 }),
  secondaryColor: varchar("secondaryColor", { length: 7 }),
  accentColor: varchar("accentColor", { length: 7 }),
  backgroundColor: varchar("backgroundColor", { length: 7 }),
  textColor: varchar("textColor", { length: 7 }),
  primaryFont: varchar("primaryFont", { length: 255 }),
  secondaryFont: varchar("secondaryFont", { length: 255 }),
  logoUrl: text("logoUrl"),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── CONTENTS ─────────────────────────────────────────────────────────────────
export const contents = mysqlTable("contents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId"),
  campaignId: int("campaignId"),
  brandVoiceId: int("brandVoiceId"),
  type: mysqlEnum("type", [
    "ad_copy_short", "ad_copy_long", "blog_post", "seo_meta", "social_caption",
    "video_script", "email_copy", "pr_release", "podcast_script", "tv_script",
    "radio_script", "copywriting", "amazon_listing", "google_ads", "youtube_seo",
    "twitter_thread", "linkedin_article", "whatsapp_broadcast", "sms_copy",
    "story_content", "ugc_script", "landing_page"
  ]).notNull(),
  platform: varchar("platform", { length: 100 }),
  title: text("title"),
  body: text("body").notNull(),
  score: int("score"),
  scoreDetails: json("scoreDetails"),
  status: mysqlEnum("status", ["draft", "approved", "scheduled", "published", "archived"]).default("draft").notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── CONTENT TEMPLATES ────────────────────────────────────────────────────────
export const contentTemplates = mysqlTable("contentTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  structure: text("structure").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── CREATIVES ────────────────────────────────────────────────────────────────
export const creatives = mysqlTable("creatives", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId"),
  campaignId: int("campaignId"),
  type: mysqlEnum("type", ["ad_image", "social_graphic", "thumbnail", "banner", "story", "product_photo", "meme", "ad_with_copy"]).notNull(),
  prompt: text("prompt").notNull(),
  imageUrl: text("imageUrl"),
  width: int("width"),
  height: int("height"),
  status: mysqlEnum("status", ["pending", "generating", "completed", "failed"]).default("pending").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── VIDEO ADS ────────────────────────────────────────────────────────────────
export const videoAds = mysqlTable("videoAds", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId"),
  campaignId: int("campaignId"),
  platform: mysqlEnum("platform", ["tiktok", "youtube", "reels", "youtube_shorts", "facebook", "snapchat", "pinterest"]).notNull(),
  adPreset: varchar("adPreset", { length: 100 }),
  script: text("script").notNull(),
  hook: text("hook"),
  duration: int("duration"),
  actorId: varchar("actorId", { length: 100 }),
  emotion: mysqlEnum("emotion", ["excited", "calm", "urgent", "friendly", "authoritative", "neutral", "empathetic", "surprised"]).default("neutral"),
  language: varchar("language", { length: 10 }).default("en"),
  status: mysqlEnum("status", ["draft", "rendering", "completed", "failed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── VIDEO RENDERS ────────────────────────────────────────────────────────────
export const videoRenders = mysqlTable("videoRenders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  videoAdId: int("videoAdId"),
  provider: mysqlEnum("provider", ["heygen", "runway", "luma", "kling"]).notNull(),
  externalJobId: varchar("externalJobId", { length: 255 }),
  videoUrl: text("videoUrl"),
  thumbnailUrl: text("thumbnailUrl"),
  durationSeconds: int("durationSeconds"),
  status: mysqlEnum("status", ["queued", "processing", "completed", "failed"]).default("queued").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── PERSONAL VIDEOS ──────────────────────────────────────────────────────────
export const personalVideos = mysqlTable("personalVideos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  videoUrl: text("videoUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId"),
  name: varchar("name", { length: 255 }).notNull(),
  objective: mysqlEnum("objective", ["awareness", "traffic", "engagement", "leads", "sales", "app_installs"]).default("awareness").notNull(),
  platforms: json("platforms"),
  strategy: json("strategy"),
  postingSchedule: json("postingSchedule"),
  audienceTargeting: json("audienceTargeting"),
  budgetAllocation: json("budgetAllocation"),
  kpis: json("kpis"),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed", "archived"]).default("draft").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── CAMPAIGN ASSETS ──────────────────────────────────────────────────────────
export const campaignAssets = mysqlTable("campaignAssets", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  assetType: mysqlEnum("assetType", ["content", "email", "landing_page", "video", "creative", "ad"]).notNull(),
  assetId: int("assetId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── AB TESTS ─────────────────────────────────────────────────────────────────
export const abTests = mysqlTable("abTests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId"),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["draft", "running", "paused", "completed", "archived"]).default("draft").notNull(),
  winnerId: int("winnerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── AB TEST VARIANTS ─────────────────────────────────────────────────────────
export const abTestVariants = mysqlTable("abTestVariants", {
  id: int("id").autoincrement().primaryKey(),
  testId: int("testId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  contentId: int("contentId"),
  impressions: int("impressions").default(0).notNull(),
  conversions: int("conversions").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── SCHEDULED POSTS ──────────────────────────────────────────────────────────
export const scheduledPosts = mysqlTable("scheduledPosts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentId: int("contentId"),
  campaignId: int("campaignId"),
  platform: varchar("platform", { length: 100 }).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  publishedAt: timestamp("publishedAt"),
  status: mysqlEnum("status", ["pending", "published", "failed", "canceled"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── SOCIAL PUBLISH QUEUE ─────────────────────────────────────────────────────
export const socialPublishQueue = mysqlTable("socialPublishQueue", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scheduledPostId: int("scheduledPostId"),
  platform: varchar("platform", { length: 100 }).notNull(),
  content: text("content").notNull(),
  mediaUrls: json("mediaUrls"),
  status: mysqlEnum("status", ["queued", "processing", "published", "failed", "retrying", "canceled"]).default("queued").notNull(),
  attempts: int("attempts").default(0).notNull(),
  lastAttemptAt: timestamp("lastAttemptAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── PUBLISHING CREDENTIALS ───────────────────────────────────────────────────
export const publishingCredentials = mysqlTable("publishingCredentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  accountId: varchar("accountId", { length: 255 }),
  accountName: varchar("accountName", { length: 255 }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── LEADS ────────────────────────────────────────────────────────────────────
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId"),
  assignedTo: int("assignedTo"),
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  source: varchar("source", { length: 100 }),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "unqualified", "converted", "lost"]).default("new").notNull(),
  score: int("score").default(0),
  tags: json("tags"),
  notes: text("notes"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── DEALS ────────────────────────────────────────────────────────────────────
export const deals = mysqlTable("deals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  leadId: int("leadId"),
  name: varchar("name", { length: 255 }).notNull(),
  stage: mysqlEnum("stage", ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"]).default("prospecting").notNull(),
  valueCents: int("valueCents").default(0),
  probability: int("probability").default(0),
  expectedCloseDate: timestamp("expectedCloseDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── ACTIVITIES ───────────────────────────────────────────────────────────────
export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  leadId: int("leadId"),
  dealId: int("dealId"),
  type: mysqlEnum("type", ["call", "email", "meeting", "note", "task"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueAt: timestamp("dueAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── CUSTOMER PROFILES ────────────────────────────────────────────────────────
export const customerProfiles = mysqlTable("customerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  leadId: int("leadId"),
  enrichedData: json("enrichedData"),
  journeyStage: varchar("journeyStage", { length: 100 }),
  segment: varchar("segment", { length: 100 }),
  lifetimeValueCents: int("lifetimeValueCents").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── EMAIL CAMPAIGNS ──────────────────────────────────────────────────────────
export const emailCampaigns = mysqlTable("emailCampaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId"),
  listId: int("listId"),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }),
  previewText: varchar("previewText", { length: 500 }),
  htmlBody: text("htmlBody"),
  textBody: text("textBody"),
  fromName: varchar("fromName", { length: 255 }),
  fromEmail: varchar("fromEmail", { length: 320 }),
  status: mysqlEnum("status", ["draft", "scheduled", "sending", "sent", "failed"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  recipientCount: int("recipientCount").default(0),
  openCount: int("openCount").default(0),
  clickCount: int("clickCount").default(0),
  resendId: varchar("resendId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── EMAIL LISTS ──────────────────────────────────────────────────────────────
export const emailLists = mysqlTable("emailLists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  contactCount: int("contactCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── EMAIL CONTACTS ───────────────────────────────────────────────────────────
export const emailContacts = mysqlTable("emailContacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  listId: int("listId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  firstName: varchar("firstName", { length: 255 }),
  lastName: varchar("lastName", { length: 255 }),
  subscribed: boolean("subscribed").default(true).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── LANDING PAGES ────────────────────────────────────────────────────────────
export const landingPages = mysqlTable("landingPages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId"),
  campaignId: int("campaignId"),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  headline: text("headline"),
  subheadline: text("subheadline"),
  htmlContent: text("htmlContent"),
  ctaText: varchar("ctaText", { length: 255 }),
  ctaUrl: text("ctaUrl"),
  template: varchar("template", { length: 100 }),
  isPublished: boolean("isPublished").default(false).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  conversionCount: int("conversionCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── FORM SUBMISSIONS ─────────────────────────────────────────────────────────
export const formSubmissions = mysqlTable("formSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  landingPageId: int("landingPageId"),
  formId: int("formId"),
  data: json("data").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── FUNNELS ──────────────────────────────────────────────────────────────────
export const funnels = mysqlTable("funnels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  conversionGoal: varchar("conversionGoal", { length: 255 }),
  status: mysqlEnum("status", ["draft", "active", "paused", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── FUNNEL STEPS ─────────────────────────────────────────────────────────────
export const funnelSteps = mysqlTable("funnelSteps", {
  id: int("id").autoincrement().primaryKey(),
  funnelId: int("funnelId").notNull(),
  type: mysqlEnum("type", ["landing", "form", "payment", "thank_you", "upsell", "email"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }),
  content: json("content"),
  order: int("order").notNull(),
  landingPageId: int("landingPageId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── FUNNEL STEP EVENTS ───────────────────────────────────────────────────────
export const funnelStepEvents = mysqlTable("funnelStepEvents", {
  id: int("id").autoincrement().primaryKey(),
  stepId: int("stepId").notNull(),
  type: mysqlEnum("type", ["view", "conversion"]).notNull(),
  sessionId: varchar("sessionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── FUNNEL AB TESTS ──────────────────────────────────────────────────────────
export const funnelAbTests = mysqlTable("funnelAbTests", {
  id: int("id").autoincrement().primaryKey(),
  funnelId: int("funnelId").notNull(),
  stepId: int("stepId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["running", "paused", "completed"]).default("running").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── FUNNEL AB TEST VARIATIONS ────────────────────────────────────────────────
export const funnelAbTestVariations = mysqlTable("funnelAbTestVariations", {
  id: int("id").autoincrement().primaryKey(),
  testId: int("testId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  content: json("content"),
  views: int("views").default(0).notNull(),
  conversions: int("conversions").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── FORMS ────────────────────────────────────────────────────────────────────
export const forms = mysqlTable("forms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── FORM FIELDS ──────────────────────────────────────────────────────────────
export const formFields = mysqlTable("formFields", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId").notNull(),
  type: mysqlEnum("type", ["text", "email", "phone", "textarea", "select", "checkbox", "radio", "file"]).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  placeholder: varchar("placeholder", { length: 255 }),
  required: boolean("required").default(false).notNull(),
  options: json("options"),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── FORM RESPONSES ───────────────────────────────────────────────────────────
export const formResponses = mysqlTable("formResponses", {
  id: int("id").autoincrement().primaryKey(),
  formId: int("formId").notNull(),
  data: json("data").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── SEO AUDITS ───────────────────────────────────────────────────────────────
export const seoAudits = mysqlTable("seoAudits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  url: text("url").notNull(),
  keywords: json("keywords"),
  rankTracking: json("rankTracking"),
  siteStructure: json("siteStructure"),
  recommendations: json("recommendations"),
  score: int("score"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── COMPETITOR PROFILES ──────────────────────────────────────────────────────
export const competitorProfiles = mysqlTable("competitorProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  positioning: text("positioning"),
  strengths: json("strengths"),
  weaknesses: json("weaknesses"),
  opportunities: json("opportunities"),
  threats: json("threats"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── COMPETITOR SNAPSHOTS ─────────────────────────────────────────────────────
export const competitorSnapshots = mysqlTable("competitorSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  competitorId: int("competitorId").notNull(),
  data: json("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── COMPETITOR ALERTS ────────────────────────────────────────────────────────
export const competitorAlerts = mysqlTable("competitorAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  competitorId: int("competitorId").notNull(),
  alertType: varchar("alertType", { length: 100 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── TEAM MEMBERS ─────────────────────────────────────────────────────────────
export const teamMembers = mysqlTable("teamMembers", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  userId: int("userId"),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }),
  role: mysqlEnum("role", ["owner", "admin", "member", "viewer"]).default("member").notNull(),
  status: mysqlEnum("status", ["invited", "active", "inactive"]).default("invited").notNull(),
  inviteToken: varchar("inviteToken", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── APPROVAL WORKFLOWS ───────────────────────────────────────────────────────
export const approvalWorkflows = mysqlTable("approvalWorkflows", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentId: int("contentId"),
  emailCampaignId: int("emailCampaignId"),
  requestedBy: int("requestedBy").notNull(),
  assignedTo: int("assignedTo").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "revision_requested"]).default("pending").notNull(),
  notes: text("notes"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── ANALYTICS EVENTS ─────────────────────────────────────────────────────────
export const analyticsEvents = mysqlTable("analyticsEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId"),
  contentId: int("contentId"),
  platform: varchar("platform", { length: 100 }),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  conversions: int("conversions").default(0),
  spend: int("spend").default(0),
  revenue: int("revenue").default(0),
  metadata: json("metadata"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

// ─── PERFORMANCE METRICS ──────────────────────────────────────────────────────
export const performanceMetrics = mysqlTable("performanceMetrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId"),
  metricType: varchar("metricType", { length: 100 }).notNull(),
  value: float("value").notNull(),
  trend: mysqlEnum("trend", ["up", "down", "flat"]).default("flat"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

// ─── PERFORMANCE ALERTS ───────────────────────────────────────────────────────
export const performanceAlerts = mysqlTable("performanceAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId"),
  alertType: varchar("alertType", { length: 100 }).notNull(),
  threshold: float("threshold"),
  currentValue: float("currentValue"),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── PREDICTIVE SCORES ────────────────────────────────────────────────────────
export const predictiveScores = mysqlTable("predictiveScores", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentId: int("contentId"),
  campaignId: int("campaignId"),
  predictedCtr: float("predictedCtr"),
  predictedEngagement: float("predictedEngagement"),
  predictedConversionProbability: float("predictedConversionProbability"),
  qualityScore: int("qualityScore"),
  improvements: json("improvements"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── DSP AD WALLETS ───────────────────────────────────────────────────────────
export const dspAdWallets = mysqlTable("dspAdWallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  balanceCents: int("balanceCents").default(0).notNull(),
  totalDepositedCents: int("totalDepositedCents").default(0).notNull(),
  totalSpentCents: int("totalSpentCents").default(0).notNull(),
  totalMarkupEarnedCents: int("totalMarkupEarnedCents").default(0).notNull(),
  epomAccountId: varchar("epomAccountId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── DSP CAMPAIGNS ────────────────────────────────────────────────────────────
export const dspCampaigns = mysqlTable("dspCampaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletId: int("walletId").notNull(),
  campaignId: int("campaignId"),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).default("draft").notNull(),
  dailyBudgetCents: int("dailyBudgetCents").notNull(),
  totalBudgetCents: int("totalBudgetCents").notNull(),
  spentCents: int("spentCents").default(0).notNull(),
  targetingGeo: json("targetingGeo"),
  targetingDemographics: json("targetingDemographics"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  epomCampaignId: varchar("epomCampaignId", { length: 255 }),
  impressions: int("impressions").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── AD PLATFORM CONNECTIONS ──────────────────────────────────────────────────
export const adPlatformConnections = mysqlTable("adPlatformConnections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", ["meta", "google", "tiktok", "linkedin", "pinterest", "snapchat", "amazon"]).notNull(),
  accountId: varchar("accountId", { length: 255 }),
  accountName: varchar("accountName", { length: 255 }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── AD PLATFORM CAMPAIGNS ────────────────────────────────────────────────────
export const adPlatformCampaigns = mysqlTable("adPlatformCampaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  connectionId: int("connectionId").notNull(),
  campaignId: int("campaignId"),
  externalCampaignId: varchar("externalCampaignId", { length: 255 }),
  platform: varchar("platform", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 100 }),
  budgetCents: int("budgetCents"),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  spend: int("spend").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── REPURPOSING PROJECTS ─────────────────────────────────────────────────────
export const repurposingProjects = mysqlTable("repurposingProjects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sourceContentId: int("sourceContentId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  targetFormats: json("targetFormats"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── REPURPOSED CONTENTS ──────────────────────────────────────────────────────
export const repurposedContents = mysqlTable("repurposedContents", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  sourceContentId: int("sourceContentId").notNull(),
  targetContentId: int("targetContentId"),
  targetFormat: varchar("targetFormat", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── AUTOMATION WORKFLOWS ─────────────────────────────────────────────────────
export const automationWorkflows = mysqlTable("automationWorkflows", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  trigger: json("trigger").notNull(),
  conditions: json("conditions"),
  actions: json("actions").notNull(),
  isActive: boolean("isActive").default(false).notNull(),
  executionCount: int("executionCount").default(0).notNull(),
  lastExecutedAt: timestamp("lastExecutedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── WEBHOOK ENDPOINTS ────────────────────────────────────────────────────────
export const webhookEndpoints = mysqlTable("webhookEndpoints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  url: text("url").notNull(),
  events: json("events").notNull(),
  secret: varchar("secret", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── CHAT CONVERSATIONS ───────────────────────────────────────────────────────
export const chatConversations = mysqlTable("chatConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  messages: json("messages").notNull(),
  activeProductId: int("activeProductId"),
  brandVoiceId: int("brandVoiceId"),
  recentCampaignId: int("recentCampaignId"),
  recentContentIds: json("recentContentIds"),
  platformPreferences: json("platformPreferences"),
  lastBuildSummary: text("lastBuildSummary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── REPORTS ──────────────────────────────────────────────────────────────────
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  campaignId: int("campaignId"),
  name: varchar("name", { length: 255 }).notNull(),
  shareToken: varchar("shareToken", { length: 255 }).unique(),
  reportData: json("reportData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  reviewerName: varchar("reviewerName", { length: 255 }),
  rating: int("rating"),
  content: text("content"),
  reviewUrl: text("reviewUrl"),
  aiReply: text("aiReply"),
  manualReply: text("manualReply"),
  repliedAt: timestamp("repliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── REVIEW SOURCES ───────────────────────────────────────────────────────────
export const reviewSources = mysqlTable("reviewSources", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  profileUrl: text("profileUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── REFERRALS ────────────────────────────────────────────────────────────────
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(),
  referredUserId: int("referredUserId"),
  code: varchar("code", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "completed", "rewarded"]).default("pending").notNull(),
  rewardCents: int("rewardCents").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── CHAT MESSAGES ────────────────────────────────────────────────────────────
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  toolResults: json("toolResults"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── USER MEMORY ──────────────────────────────────────────────────────────────
export const userMemory = mysqlTable("userMemory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  businessContext: json("businessContext"),
  preferences: json("preferences"),
  recentTopics: json("recentTopics"),
  persistentFacts: json("persistentFacts"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── USER SETTINGS ────────────────────────────────────────────────────────────
export const userSettings = mysqlTable("userSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  timezone: varchar("timezone", { length: 100 }).default("UTC"),
  defaultLanguage: varchar("defaultLanguage", { length: 10 }).default("en"),
  emailNotifications: boolean("emailNotifications").default(true),
  pushNotifications: boolean("pushNotifications").default(true),
  weeklyReportEnabled: boolean("weeklyReportEnabled").default(true),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── INTEGRATIONS ─────────────────────────────────────────────────────────────
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  accountId: varchar("accountId", { length: 255 }),
  accountName: varchar("accountName", { length: 255 }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  isActive: boolean("isActive").default(true).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── CREDIT LEDGER (alias for creditTransactions) ─────────────────────────────
export const creditLedger = mysqlTable("creditLedger", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  type: mysqlEnum("type", ["spend", "purchase", "refund", "bonus"]).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── EMAIL SEQUENCES ──────────────────────────────────────────────────────────
export const emailSequences = mysqlTable("emailSequences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  trigger: varchar("trigger", { length: 100 }),
  steps: json("steps"),
  isActive: boolean("isActive").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type EmailSequence = typeof emailSequences.$inferSelect;

// ─── EMAIL SENDS ──────────────────────────────────────────────────────────────
export const emailSends = mysqlTable("emailSends", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  toEmail: varchar("toEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "bounced"]).default("pending").notNull(),
  resendMessageId: varchar("resendMessageId", { length: 255 }),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type EmailSend = typeof emailSends.$inferSelect;

// ─── BILLING TRANSACTIONS ─────────────────────────────────────────────────────
export const billingTransactions = mysqlTable("billingTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amountCents: int("amountCents").notNull(),
  currency: varchar("currency", { length: 3 }).default("usd").notNull(),
  description: text("description"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "refunded"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BillingTransaction = typeof billingTransactions.$inferSelect;

// ─── ARIA: PROJECTS (Campaigns) ────────────────────────────────────────────
export const projects = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  userId: int("userId").notNull(),
  name: text("name").notNull(),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  strategy_json: json("strategy_json"), // Full StrategyAgent output
  campaign_score: int("campaign_score").default(0),
  version_number: int("version_number").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ─── ARIA: PROJECT ASSETS ─────────────────────────────────────────────────
export const projectAssets = mysqlTable("projectAssets", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  projectId: varchar("projectId", { length: 36 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // "blog", "email", "video", "ad", etc
  version_number: int("version_number").default(1).notNull(),
  parent_id: varchar("parent_id", { length: 36 }), // For versioning chain
  content_json: json("content_json"),
  status: mysqlEnum("status", ["generating", "ready", "published", "failed", "scheduled"]).default("generating").notNull(),
  published_url: text("published_url"),
  scheduled_at: timestamp("scheduled_at"),
  platform: varchar("platform", { length: 100 }),
  regen_count: int("regen_count").default(0).notNull(),
  storage_url: text("storage_url"), // S3/CDN URL for binary assets
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ProjectAsset = typeof projectAssets.$inferSelect;
export type InsertProjectAsset = typeof projectAssets.$inferInsert;

// ─── ARIA: CAMPAIGN VERSIONS (Full Folder Snapshots) ──────────────────────
export const campaignVersions = mysqlTable("campaignVersions", {
  id: varchar("id", { length: 36 }).primaryKey(), // UUID
  projectId: varchar("projectId", { length: 36 }).notNull(),
  version_number: int("version_number").notNull(),
  label: varchar("label", { length: 255 }), // User label e.g. "Before rebrand"
  snapshot_data: json("snapshot_data").notNull(), // Full strategy + all assets
  created_by: varchar("created_by", { length: 255 }).default("system"), // "system" or user_id
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CampaignVersion = typeof campaignVersions.$inferSelect;
export type InsertCampaignVersion = typeof campaignVersions.$inferInsert;
