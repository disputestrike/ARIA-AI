// server/aria/dag/agents/email.ts
// EmailAgent — generates welcome email sequence
import type { AgentResult, CampaignBrief } from "../types";
import { generateEmailSequence } from "../../tools/build";

export async function runEmailAgent(
  userId: number,
  userMessage: string,
  brief: CampaignBrief
): Promise<AgentResult> {
  const start = Date.now();
  try {
    const result = await generateEmailSequence(userId, {
      name: `${brief.productName} — Welcome Sequence`,
      topic: `${brief.productName}: ${brief.productDescription}. Target audience: ${brief.targetAudience}. Tone: ${brief.tone}. Key messages: ${brief.keyMessages.join(", ")}`,
      emailCount: 5,
    });

    const emailCount = (result.data as { count?: number })?.count ?? 5;

    return {
      agentName: "email",
      success: result.status === "success",
      durationMs: Date.now() - start,
      assets: { emailSequences: 1, contentPieces: emailCount },
      summary: `Generated ${emailCount}-email welcome sequence for ${brief.productName}`,
      data: result.data ?? {},
    };
  } catch (err) {
    return {
      agentName: "email",
      success: false,
      durationMs: Date.now() - start,
      assets: {},
      summary: "Email sequence generation failed",
      data: {},
      error: String((err as Error).message),
    };
  }
}
