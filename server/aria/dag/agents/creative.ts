// server/aria/dag/agents/creative.ts
// CreativeAgent — generates ad image creatives for the campaign
import type { AgentResult, CampaignBrief } from "../types";
import { generateAdCreative } from "../../tools/build";

export async function runCreativeAgent(
  userId: number,
  userMessage: string,
  brief: CampaignBrief
): Promise<AgentResult> {
  const start = Date.now();
  try {
    // Generate 3 creative types in parallel
    const creativeTypes = ["ad_image", "social_graphic", "story"];

    const results = await Promise.allSettled(
      creativeTypes.map(type =>
        generateAdCreative(userId, {
          type,
          topic: `${brief.productName} — ${brief.keyMessages[0] ?? brief.productDescription}. Target: ${brief.targetAudience}. Tone: ${brief.tone}.`,
        })
      )
    );

    const successCount = results.filter(
      r => r.status === "fulfilled" && r.value.status === "success"
    ).length;

    return {
      agentName: "creative",
      success: successCount > 0,
      durationMs: Date.now() - start,
      assets: { adCreatives: successCount },
      summary: `Generated ${successCount} ad creatives (feed image, social graphic, story format)`,
      data: {
        creatives: results
          .filter(r => r.status === "fulfilled")
          .map(r => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof generateAdCreative>>>).value.data),
      },
    };
  } catch (err) {
    return {
      agentName: "creative",
      success: false,
      durationMs: Date.now() - start,
      assets: {},
      summary: "Ad creative generation failed",
      data: {},
      error: String((err as Error).message),
    };
  }
}
