import { pgTable, text, integer, timestamp, json, boolean, decimal, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";

// Custom enum types (using text with constraints)
export type SubscriptionTier = "free" | "starter" | "pro" | "business" | "agency" | "enterprise";
export type AssetStatus = "draft" | "approved" | "scheduled" | "published";

// Projects table (campaigns)
export const projects = pgTable("projects", {
  id: text("id").primaryKey().notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  score: integer("score").default(0),
  strategy: json("strategy"), // Stored strategy from agent
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Project assets table
export const projectAssets = pgTable("project_assets", {
  id: text("id").primaryKey().notNull(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // blog_post, email_sequence, etc.
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 20 }).default("draft").notNull(), // draft, approved, scheduled, published
  version: integer("version").default(1).notNull(),
  tokens: integer("tokens").default(0),
  platform: text("platform"), // Where it's published
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ProjectAsset = typeof projectAssets.$inferSelect;
export type InsertProjectAsset = typeof projectAssets.$inferInsert;

// Brand Kits table
export const brandKits = pgTable("brand_kits", {
  id: text("id").primaryKey().notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  brandName: text("brand_name").notNull(),
  tagline: text("tagline"),
  aboutBrand: text("about_brand"),
  logo: text("logo"), // URL or base64
  tone: text("tone"),
  voice: text("voice"),
  colors: json("colors"), // { primary, secondary, accent }
  fonts: json("fonts"), // { display, body }
  keywords: text("keywords").array(), // Brand keywords
  targetAudience: text("target_audience").array(),
  competitors: text("competitors").array(),
  excludeCompetitors: text("exclude_competitors").array(),
  socialHandles: json("social_handles"), // { twitter, linkedin, instagram, etc }
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type BrandKit = typeof brandKits.$inferSelect;
export type InsertBrandKit = typeof brandKits.$inferInsert;

// Chat conversations table
export const chatConversations = pgTable("chat_conversations", {
  id: text("id").primaryKey().notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey().notNull(),
  conversationId: text("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  role: pgEnum("message_role", ["user", "assistant"])("role").notNull(),
  content: text("content").notNull(),
  entryPoint: text("entry_point"), // new, existing, task
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Campaign history for analytics
export const campaignAnalytics = pgTable("campaign_analytics", {
  id: text("id").primaryKey().notNull(),
  projectId: text("project_id").notNull().references(() => projects.id),
  metric: text("metric").notNull(), // impressions, clicks, conversions, etc
  value: decimal("value", { precision: 10, scale: 2 }),
  source: text("source"), // google, facebook, email, etc
  date: timestamp("date", { withTimezone: true }).defaultNow().notNull(),
});

export type CampaignAnalytic = typeof campaignAnalytics.$inferSelect;
export type InsertCampaignAnalytic = typeof campaignAnalytics.$inferInsert;

// Asset versions (rollback support)
export const assetVersions = pgTable("asset_versions", {
  id: text("id").primaryKey().notNull(),
  assetId: text("asset_id").notNull().references(() => projectAssets.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  content: text("content").notNull(),
  changedBy: integer("changed_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AssetVersion = typeof assetVersions.$inferSelect;
export type InsertAssetVersion = typeof assetVersions.$inferInsert;

// Relations
export const projectsRelations = relations(projects, ({ many, one }) => ({
  assets: many(projectAssets),
  owner: one(users, { fields: [projects.userId], references: [users.id] }),
}));

export const projectAssetsRelations = relations(projectAssets, ({ one, many }) => ({
  project: one(projects, { fields: [projectAssets.projectId], references: [projects.id] }),
  versions: many(assetVersions),
}));

export const brandKitsRelations = relations(brandKits, ({ one }) => ({
  owner: one(users, { fields: [brandKits.userId], references: [users.id] }),
}));

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  owner: one(users, { fields: [chatConversations.userId], references: [users.id] }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, { fields: [chatMessages.conversationId], references: [chatConversations.id] }),
}));
