// server/aria/dag/agents/crm.ts
// CRMAgent — sets up CRM pipeline, lead capture, and deal tracking
import type { AgentResult, CampaignBrief } from "../types";
import { createLead, updateDeal } from "../../tools/build";

export async function runCRMAgent(
  userId: number,
  userMessage: string,
  brief: CampaignBrief
): Promise<AgentResult> {
  const start = Date.now();
  try {
    // Create a placeholder lead and deal to seed the CRM pipeline
    const [leadResult, dealResult] = await Promise.allSettled([
      createLead(userId, {
        firstName: "Sample",
        lastName: "Lead",
        company: brief.productName,
        source: "aria_campaign",
      }),
      updateDeal(userId, {
        name: `${brief.productName} — Campaign Deal`,
        stage: "prospecting",
        valueCents: brief.budget ? Math.round(parseFloat(brief.budget.replace(/[^0-9.]/g, "")) * 100) : 0,
      }),
    ]);

    const successCount = [leadResult, dealResult].filter(
      r => r.status === "fulfilled" && r.value.status === "success"
    ).length;

    return {
      agentName: "crm",
      success: successCount > 0,
      durationMs: Date.now() - start,
      assets: { leads: successCount },
      summary: `CRM pipeline initialized: lead capture + deal tracking set up for ${brief.productName}`,
      data: {
        lead: leadResult.status === "fulfilled" ? leadResult.value.data : null,
        deal: dealResult.status === "fulfilled" ? dealResult.value.data : null,
      },
    };
  } catch (err) {
    return {
      agentName: "crm",
      success: false,
      durationMs: Date.now() - start,
      assets: {},
      summary: "CRM setup failed",
      data: {},
      error: String((err as Error).message),
    };
  }
}
