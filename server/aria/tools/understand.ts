// server/aria/tools/understand.ts
// UNDERSTAND tools: analyzeProduct, analyzeWebsite, analyzeCompetitor, scrapeHooks, getProductContext, getBrandVoice
// Uses Anthropic Claude (primary) via invokeStructuredLLM, OpenAI as fallback

import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { products, brandVoices, competitorProfiles, competitorSnapshots } from "../../../drizzle/schema";
import { invokeStructuredLLM } from "../llm-provider";
import type { ToolResult } from "../memory";

// ─── ANALYZE PRODUCT ──────────────────────────────────────────────────────────
export async function analyzeProduct(userId: number, args: { productId?: number; url?: string; name?: string }): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "analyzeProduct", status: "error", data: {}, message: "DB unavailable" };

  try {
    let productId = args.productId;

    if (!productId) {
      const [inserted] = await db.insert(products).values({
        userId,
        name: args.name ?? "New Product",
        url: args.url ?? null,
        analysisStatus: "analyzing",
      });
      productId = (inserted as unknown as { insertId: number }).insertId;
    } else {
      await db.update(products).set({ analysisStatus: "analyzing" }).where(eq(products.id, productId));
    }

    const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product) return { kind: "analyzeProduct", status: "error", data: {}, message: "Product not found" };

    const analysis = await invokeStructuredLLM<{
      features: string[];
      benefits: string[];
      targetAudience: string;
      positioning: string;
      keywords: string[];
      tone: string;
      competitiveAdvantages: string[];
      painPoints: string[];
      valueProps: string[];
      differentiators: string[];
    }>({
      systemPrompt: "You are a product analysis expert. Analyze products deeply and return structured JSON.",
      userPrompt: `Analyze this product:\nName: ${product.name}\nURL: ${product.url ?? "not provided"}\nDescription: ${product.description ?? "not provided"}`,
      schemaName: "product_analysis",
      schema: {
        type: "object",
        properties: {
          features: { type: "array", items: { type: "string" } },
          benefits: { type: "array", items: { type: "string" } },
          targetAudience: { type: "string" },
          positioning: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
          tone: { type: "string" },
          competitiveAdvantages: { type: "array", items: { type: "string" } },
          painPoints: { type: "array", items: { type: "string" } },
          valueProps: { type: "array", items: { type: "string" } },
          differentiators: { type: "array", items: { type: "string" } },
        },
        required: ["features", "benefits", "targetAudience", "positioning", "keywords", "tone", "competitiveAdvantages", "painPoints", "valueProps", "differentiators"],
        additionalProperties: false,
      },
    });

    await db.update(products).set({ ...analysis, analysisStatus: "completed" }).where(eq(products.id, productId));

    return {
      kind: "analyzeProduct",
      status: "success",
      recordId: productId,
      data: { id: productId, name: product.name, ...analysis },
    };
  } catch (err) {
    console.error("[ARIA] analyzeProduct error:", err);
    return { kind: "analyzeProduct", status: "error", data: {}, message: String(err) };
  }
}

// ─── GET PRODUCT CONTEXT ──────────────────────────────────────────────────────
export async function getProductContext(userId: number, args: { productId: number }): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "getProductContext", status: "error", data: {}, message: "DB unavailable" };

  try {
    const [product] = await db.select().from(products).where(eq(products.id, args.productId)).limit(1);
    if (!product) return { kind: "getProductContext", status: "error", data: {}, message: "Product not found" };
    return { kind: "getProductContext", status: "success", recordId: product.id, data: product as unknown as Record<string, unknown> };
  } catch (err) {
    return { kind: "getProductContext", status: "error", data: {}, message: String(err) };
  }
}

// ─── ANALYZE WEBSITE ──────────────────────────────────────────────────────────
export async function analyzeWebsite(userId: number, args: { url: string; depth?: string }): Promise<ToolResult> {
  try {
    const analysis = await invokeStructuredLLM<{
      trafficEstimate: string;
      demographics: string;
      seoAnalysis: string;
      socialPresence: string;
      contentStrategy: string;
      competitors: string[];
      swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
      budgetRecommendations: string;
      techStack: string[];
      analyticsPresence: string[];
    }>({
      systemPrompt: "You are a website intelligence analyst. Provide deep, actionable analysis.",
      userPrompt: `Analyze this website URL and provide comprehensive intelligence: ${args.url}`,
      schemaName: "website_analysis",
      schema: {
        type: "object",
        properties: {
          trafficEstimate: { type: "string" },
          demographics: { type: "string" },
          seoAnalysis: { type: "string" },
          socialPresence: { type: "string" },
          contentStrategy: { type: "string" },
          competitors: { type: "array", items: { type: "string" } },
          swot: {
            type: "object",
            properties: {
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              opportunities: { type: "array", items: { type: "string" } },
              threats: { type: "array", items: { type: "string" } },
            },
            required: ["strengths", "weaknesses", "opportunities", "threats"],
            additionalProperties: false,
          },
          budgetRecommendations: { type: "string" },
          techStack: { type: "array", items: { type: "string" } },
          analyticsPresence: { type: "array", items: { type: "string" } },
        },
        required: ["trafficEstimate", "demographics", "seoAnalysis", "socialPresence", "contentStrategy", "competitors", "swot", "budgetRecommendations", "techStack", "analyticsPresence"],
        additionalProperties: false,
      },
    });

    return { kind: "analyzeWebsite", status: "success", data: { url: args.url, ...analysis } };
  } catch (err) {
    return { kind: "analyzeWebsite", status: "error", data: {}, message: String(err) };
  }
}

// ─── ANALYZE COMPETITOR ───────────────────────────────────────────────────────
export async function analyzeCompetitor(userId: number, args: { url: string; name?: string }): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "analyzeCompetitor", status: "error", data: {}, message: "DB unavailable" };

  try {
    const analysis = await invokeStructuredLLM<{
      positioning: string;
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
      pricingStrategy: string;
      contentApproach: string;
      targetAudience: string;
      uniqueValueProposition: string;
    }>({
      systemPrompt: "You are a competitive intelligence analyst. Provide deep, actionable competitive analysis.",
      userPrompt: `Perform deep competitive analysis of: ${args.url} (${args.name ?? "competitor"})`,
      schemaName: "competitor_analysis",
      schema: {
        type: "object",
        properties: {
          positioning: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          opportunities: { type: "array", items: { type: "string" } },
          threats: { type: "array", items: { type: "string" } },
          pricingStrategy: { type: "string" },
          contentApproach: { type: "string" },
          targetAudience: { type: "string" },
          uniqueValueProposition: { type: "string" },
        },
        required: ["positioning", "strengths", "weaknesses", "opportunities", "threats", "pricingStrategy", "contentApproach", "targetAudience", "uniqueValueProposition"],
        additionalProperties: false,
      },
    });

    const [inserted] = await db.insert(competitorProfiles).values({
      userId,
      name: args.name ?? args.url,
      url: args.url,
      positioning: analysis.positioning,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      opportunities: analysis.opportunities,
      threats: analysis.threats,
    });
    const competitorId = (inserted as unknown as { insertId: number }).insertId;

    await db.insert(competitorSnapshots).values({ competitorId, data: analysis });

    return { kind: "analyzeCompetitor", status: "success", recordId: competitorId, data: { id: competitorId, url: args.url, ...analysis } };
  } catch (err) {
    return { kind: "analyzeCompetitor", status: "error", data: {}, message: String(err) };
  }
}

// ─── SCRAPE HOOKS ─────────────────────────────────────────────────────────────
export async function scrapeHooks(userId: number, args: { url?: string; topic?: string; count?: number }): Promise<ToolResult> {
  try {
    const count = args.count ?? 5;
    const { hooks } = await invokeStructuredLLM<{ hooks: Array<{ text: string; psychologicalTrigger: string; platform: string }> }>({
      systemPrompt: "You are a viral content strategist and hook writer. Generate compelling, platform-specific hooks.",
      userPrompt: `Generate ${count} viral hook variations for: ${args.topic ?? args.url ?? "this brand"}. Each hook should be punchy, platform-native, and trigger a specific psychological response.`,
      schemaName: "hooks",
      schema: {
        type: "object",
        properties: {
          hooks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                psychologicalTrigger: { type: "string" },
                platform: { type: "string" },
              },
              required: ["text", "psychologicalTrigger", "platform"],
              additionalProperties: false,
            },
          },
        },
        required: ["hooks"],
        additionalProperties: false,
      },
    });

    return { kind: "scrapeHooks", status: "success", data: { hooks } };
  } catch (err) {
    return { kind: "scrapeHooks", status: "error", data: {}, message: String(err) };
  }
}

// ─── GET BRAND VOICE ──────────────────────────────────────────────────────────
export async function getBrandVoice(userId: number, args: { brandVoiceId?: number }): Promise<ToolResult> {
  const db = await getDb();
  if (!db) return { kind: "getBrandVoice", status: "error", data: {}, message: "DB unavailable" };

  try {
    const rows = args.brandVoiceId
      ? await db.select().from(brandVoices).where(eq(brandVoices.id, args.brandVoiceId)).limit(1)
      : await db.select().from(brandVoices).where(eq(brandVoices.userId, userId)).limit(1);

    if (rows.length === 0) return { kind: "getBrandVoice", status: "error", data: {}, message: "No brand voice found" };

    const bv = rows[0];
    return { kind: "getBrandVoice", status: "success", recordId: bv.id, data: bv as unknown as Record<string, unknown> };
  } catch (err) {
    return { kind: "getBrandVoice", status: "error", data: {}, message: String(err) };
  }
}
