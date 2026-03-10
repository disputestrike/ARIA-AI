// server/aria/dag/agents/social.ts
// SocialAgent — generates social posts across platforms
import type { AgentResult, CampaignBrief } from "../types";
import { generateSocialPosts } from "../../tools/build";

export async function runSocialAgent(
  userId: number,
  userMessage: string,
  brief: CampaignBrief
): Promise<AgentResult> {
  const start = Date.now();
  try {
    const result = await generateSocialPosts(userId, {
      topic: `${brief.productName}: ${brief.productDescription}. Target audience: ${brief.targetAudience}. Tone: ${brief.tone}. Key messages: ${brief.keyMessages.join(", ")}.`,
      platforms: brief.platforms.slice(0, 4),
      count: 3,
    });

    const totalPosts = (result.data as { count?: number })?.count ?? 3;

    return {
      agentName: "social",
      success: result.status === "success",
      durationMs: Date.now() - start,
      assets: { socialPosts: totalPosts },
      summary: `Generated ${totalPosts} social posts for ${brief.platforms.slice(0, 4).join(", ")}`,
      data: result.data ?? {},
    };
  } catch (err) {
    return {
      agentName: "social",
      success: false,
      durationMs: Date.now() - start,
      assets: {},
      summary: "Social post generation failed",
      data: {},
      error: String((err as Error).message),
    };
  }
}
