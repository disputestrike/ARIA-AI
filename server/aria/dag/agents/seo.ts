// server/aria/dag/agents/seo.ts
// SEOAgent — runs SEO audit and generates SEO-optimized content
import type { AgentResult, CampaignBrief } from "../types";
import { generateSEOAudit } from "../../tools/publish";
import { generateSEOContent } from "../../tools/build";

export async function runSEOAgent(
  userId: number,
  userMessage: string,
  brief: CampaignBrief
): Promise<AgentResult> {
  const start = Date.now();
  try {
    const keywords = [
      brief.productName.toLowerCase(),
      ...brief.keyMessages.slice(0, 3).map(m => m.toLowerCase().split(" ").slice(0, 3).join(" ")),
    ];

    const [auditResult, seoContentResult] = await Promise.allSettled([
      brief.websiteUrl
        ? generateSEOAudit(userId, { url: brief.websiteUrl, keywords })
        : Promise.resolve({ kind: "generateSEOAudit" as const, status: "success" as const, data: { message: "No URL provided — skipped audit" }, message: "Skipped" }),
      generateSEOContent(userId, {
        topic: brief.productName,
        keywords,
      }),
    ]);

    const successCount = [auditResult, seoContentResult].filter(
      r => r.status === "fulfilled" && r.value.status === "success"
    ).length;

    return {
      agentName: "seo",
      success: successCount > 0,
      durationMs: Date.now() - start,
      assets: { seoAudits: brief.websiteUrl ? 1 : 0, contentPieces: 1 },
      summary: `SEO${brief.websiteUrl ? " audit + " : " "}content generated for keywords: ${keywords.slice(0, 3).join(", ")}`,
      data: {
        audit: auditResult.status === "fulfilled" ? auditResult.value.data : null,
        seoContent: seoContentResult.status === "fulfilled" ? seoContentResult.value.data : null,
        keywords,
      },
    };
  } catch (err) {
    return {
      agentName: "seo",
      success: false,
      durationMs: Date.now() - start,
      assets: {},
      summary: "SEO analysis failed",
      data: {},
      error: String((err as Error).message),
    };
  }
}
