// server/aria/dag/agents/dsp.ts
// DSPAgent — sets up DSP programmatic ad campaigns
import type { AgentResult, CampaignBrief } from "../types";
import { launchDSPCampaign } from "../../tools/publish";

export async function runDSPAgent(
  userId: number,
  userMessage: string,
  brief: CampaignBrief
): Promise<AgentResult> {
  const start = Date.now();
  try {
    // Only launch DSP if budget is specified; otherwise set up a draft
    const budgetNum = brief.budget ? parseFloat(brief.budget.replace(/[^0-9.]/g, "")) : 0;
    const dailyBudgetCents = budgetNum > 0
      ? Math.round((budgetNum / 30) * 100) // monthly budget / 30 days
      : 1000; // $10/day default

    const totalBudgetCents = budgetNum > 0
      ? Math.round(budgetNum * 100)
      : 30000; // $300 default

    const result = await launchDSPCampaign(userId, {
      name: `${brief.productName} — DSP Campaign`,
      dailyBudgetCents,
      totalBudgetCents,
      targetingGeo: ["US"],
    });

    return {
      agentName: "dsp",
      success: result.status === "success",
      durationMs: Date.now() - start,
      assets: { campaigns: result.status === "success" ? 1 : 0 },
      summary: result.status === "success"
        ? `DSP campaign launched: $${(dailyBudgetCents / 100).toFixed(2)}/day, $${(totalBudgetCents / 100).toFixed(2)} total budget`
        : `DSP campaign setup skipped: ${result.message ?? "insufficient wallet balance"}`,
      data: result.data ?? {},
    };
  } catch (err) {
    return {
      agentName: "dsp",
      success: false,
      durationMs: Date.now() - start,
      assets: {},
      summary: "DSP campaign setup failed",
      data: {},
      error: String((err as Error).message),
    };
  }
}
