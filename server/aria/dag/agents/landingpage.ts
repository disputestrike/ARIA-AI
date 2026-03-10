// server/aria/dag/agents/landingpage.ts
// LandingPageAgent — generates landing page and sales funnel
import type { AgentResult, CampaignBrief } from "../types";
import { generateLandingPage, buildFunnel } from "../../tools/build";

export async function runLandingPageAgent(
  userId: number,
  userMessage: string,
  brief: CampaignBrief
): Promise<AgentResult> {
  const start = Date.now();
  try {
    const [pageResult, funnelResult] = await Promise.allSettled([
      generateLandingPage(userId, {
        name: `${brief.productName} — Landing Page`,
        topic: brief.productName,
        ctaText: "Get Started Free",
      }),
      buildFunnel(userId, {
        name: `${brief.productName} Sales Funnel`,
        conversionGoal: "lead capture",
        steps: [
          { type: "landing", name: "Landing Page" },
          { type: "form", name: "Lead Capture" },
          { type: "email", name: "Welcome Email" },
          { type: "upsell", name: "Upsell Offer" },
          { type: "thank_you", name: "Thank You Page" },
        ],
      }),
    ]);

    const successCount = [pageResult, funnelResult].filter(
      r => r.status === "fulfilled" && r.value.status === "success"
    ).length;

    return {
      agentName: "landingpage",
      success: successCount > 0,
      durationMs: Date.now() - start,
      assets: { landingPages: successCount },
      summary: `Generated landing page and 5-step sales funnel for ${brief.productName}`,
      data: {
        page: pageResult.status === "fulfilled" ? pageResult.value.data : null,
        funnel: funnelResult.status === "fulfilled" ? funnelResult.value.data : null,
      },
    };
  } catch (err) {
    return {
      agentName: "landingpage",
      success: false,
      durationMs: Date.now() - start,
      assets: {},
      summary: "Landing page generation failed",
      data: {},
      error: String((err as Error).message),
    };
  }
}
