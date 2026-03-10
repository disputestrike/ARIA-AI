// server/aria/dag/agents/video.ts
// VideoAgent — generates video scripts (short-form + long-form) for TikTok and YouTube
import type { AgentResult, CampaignBrief } from "../types";
import { generateVideoScript } from "../../tools/build";

export async function runVideoAgent(
  userId: number,
  userMessage: string,
  brief: CampaignBrief
): Promise<AgentResult> {
  const start = Date.now();
  try {
    // Generate short-form (TikTok 30s) and long-form (YouTube 60s) scripts in parallel
    const [shortResult, longResult] = await Promise.allSettled([
      generateVideoScript(userId, {
        platform: "tiktok",
        topic: brief.productName,
        adPreset: "ugc",
        emotion: "excited",
        duration: 30,
      }),
      generateVideoScript(userId, {
        platform: "youtube",
        topic: brief.productName,
        adPreset: "brand",
        emotion: "friendly",
        duration: 60,
      }),
    ]);

    const successCount = [shortResult, longResult].filter(
      r => r.status === "fulfilled" && r.value.status === "success"
    ).length;

    return {
      agentName: "video",
      success: successCount > 0,
      durationMs: Date.now() - start,
      assets: { videoScripts: successCount },
      summary: `Generated ${successCount} video scripts (30s TikTok + 60s YouTube) for ${brief.productName}`,
      data: {
        scripts: [shortResult, longResult]
          .filter(r => r.status === "fulfilled")
          .map(r => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof generateVideoScript>>>).value.data),
      },
    };
  } catch (err) {
    return {
      agentName: "video",
      success: false,
      durationMs: Date.now() - start,
      assets: {},
      summary: "Video script generation failed",
      data: {},
      error: String((err as Error).message),
    };
  }
}
