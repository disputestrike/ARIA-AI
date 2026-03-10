// server/aria/tools/understand.ts
// UNDERSTAND tools: analyzeProduct, analyzeWebsite, analyzeCompetitor, scrapeHooks, getProductContext, getBrandVoice
// Uses Anthropic Claude (primary) via invokeStructuredLLM, OpenAI as fallback

import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { products, brandVoices, competitorProfiles, competitorSnapshots } from "../../../drizzle/schema";
import { invokeStructuredLLM } from "../llm-provider";
import type { ToolResult } from "../memory";

// ─── Website Fetcher ──────────────────────────────────────────────────────────
async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const axios = (await import("axios")).default;
    const { load } = await import("cheerio");

    // Ensure URL has protocol
    const fullUrl = url.startsWith("http") ? url : `https://${url}`;

    const response = await axios.get(fullUrl, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ARIA-Bot/1.0; +https://ariaai.app)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      maxRedirects: 5,
    });

    const $ = load(response.data as string);

    // Remove scripts, styles, nav, footer for cleaner content
    $("script, style, nav, footer, header, .cookie-banner, #cookie-notice").remove();

    // Extract key content
    const title = $("title").text().trim();
    const metaDesc = $("meta[name='description']").attr("content") ?? "";
    const metaKeywords = $("meta[name='keywords']").attr("content") ?? "";
    const h1s = $("h1").map((_, el) => $(el).text().trim()).get().slice(0, 5).join(" | ");
    const h2s = $("h2").map((_, el) => $(el).text().trim()).get().slice(0, 10).join(" | ");
    const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 3000);
    const links = $("a[href]").map((_, el) => $(el).attr("href")).get().filter(h => h && !h.startsWith("#")).slice(0, 20).join(", ");
    const ogTitle = $("meta[property='og:title']").attr("content") ?? "";
    const ogDesc = $("meta[property='og:description']").attr("content") ?? "";

    return `URL: ${fullUrl}
Title: ${title}
Meta Description: ${metaDesc}
Meta Keywords: ${metaKeywords}
OG Title: ${ogTitle}
OG Description: ${ogDesc}
H1 Tags: ${h1s}
H2 Tags: ${h2s}
Page Content (excerpt): ${bodyText}
Internal/External Links: ${links}`;
  } catch (err) {
    // If fetch fails, return minimal info so LLM can still analyze based on URL
    return `URL: ${url}\nNote: Could not fetch page content (${(err as Error).message}). Analyze based on URL and domain knowledge.`;
  }
}

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

// // ─── ANALYZE WEBSITE ────────────────────────────────────────────
export async function analyzeWebsite(userId: number, args: { url: string; depth?: string }): Promise<ToolResult> {
  try {
    // Fetch real page content first
    const pageContent = await fetchWebsiteContent(args.url);

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
      systemPrompt: "You are a website intelligence analyst. Provide deep, actionable analysis based on real page content.",
      userPrompt: `Analyze this website and provide comprehensive intelligence:\n\n${pageContent}`,
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
      systemPrompt: "You are a competitive intelligence analyst. Provide deep, actionable competitive analysis based on real page content.",
      userPrompt: `Perform deep competitive analysis of: ${args.name ?? args.url}\n\n${await fetchWebsiteContent(args.url)}`,
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
