// server/aria/dag/agents/content.ts
// ContentAgent — generates multiple content types for the campaign
import type { AgentResult, CampaignBrief } from "../types";
import { generateContent } from "../../tools/build";

export async function runContentAgent(
  userId: number,
  userMessage: string,
  brief: CampaignBrief
): Promise<AgentResult> {
  const start = Date.now();
  try {
    const instruction = `Target audience: ${brief.targetAudience}. Tone: ${brief.tone}. Key messages: ${brief.keyMessages.join(", ")}.`;

    const contentTypes: Array<{ type: string; platform: string }> = [
      { type: "ad_copy_short", platform: brief.platforms[0] ?? "Meta" },
      { type: "social_caption", platform: brief.platforms[1] ?? "Instagram" },
      { type: "blog_post", platform: "general" },
      { type: "email_copy", platform: "email" },
    ];

    const results = await Promise.allSettled(
      contentTypes.map(({ type, platform }) =>
        generateContent(userId, {
          type,
          topic: brief.productName,
          platform,
          instruction,
        })
      )
    );

    const successCount = results.filter(
      r => r.status === "fulfilled" && r.value.status === "success"
    ).length;

    return {
      agentName: "content",
      success: successCount > 0,
      durationMs: Date.now() - start,
      assets: { contentPieces: successCount },
      summary: `Generated ${successCount} content pieces (ad copy, social captions, blog post, email copy)`,
      data: {
        contents: results
          .filter(r => r.status === "fulfilled")
          .map(r => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof generateContent>>>).value.data),
      },
    };
  } catch (err) {
    return {
      agentName: "content",
      success: false,
      durationMs: Date.now() - start,
      assets: {},
      summary: "Content generation failed",
      data: {},
      error: String((err as Error).message),
    };
  }
}
