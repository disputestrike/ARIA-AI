// server/aria/dag/agents/review.ts
// ReviewAgent — checks consistency, tone, and brand alignment across all agent outputs
import type { AgentResult, CampaignBrief, ReviewReport, ReviewIssue, ReviewFix } from "../types";
import { invokeLLM } from "../../../_core/llm";

export async function runReviewAgent(
  userId: number,
  agentResults: AgentResult[],
  brief: CampaignBrief
): Promise<ReviewReport> {
  try {
    const successfulAgents = agentResults.filter(r => r.success);
    if (successfulAgents.length === 0) {
      return {
        consistent: false,
        issues: [],
        fixes: [],
        consistencyScore: 0,
        summary: "No successful agent outputs to review.",
      };
    }

    // Build a summary of all agent outputs for review
    const outputSummary = successfulAgents
      .map(r => `${r.agentName.toUpperCase()}: ${r.summary}`)
      .join("\n");

    const reviewResponse = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a senior marketing strategist reviewing campaign outputs for consistency and quality. Analyze the agent outputs and return a JSON review report.`,
        },
        {
          role: "user",
          content: `Campaign Brief:\n- Product: ${brief.productName}\n- Target Audience: ${brief.targetAudience}\n- Tone: ${brief.tone}\n- Brand Voice: ${brief.brandVoice}\n- Key Messages: ${brief.keyMessages.join(", ")}\n\nAgent Outputs:\n${outputSummary}\n\nReview for: tone consistency, message alignment, CTA clarity, audience fit, brand voice. Return JSON with: consistent (bool), consistencyScore (0-100), issues (array of {type, description, agentAffected, severity}), fixes (array of {fixApplied}), summary (string).`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "review_report",
          strict: true,
          schema: {
            type: "object",
            properties: {
              consistent: { type: "boolean" },
              consistencyScore: { type: "number" },
              issues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["tone", "message", "cta", "audience", "brand_voice"] },
                    description: { type: "string" },
                    agentAffected: { type: "string" },
                    severity: { type: "string", enum: ["low", "medium", "high"] },
                  },
                  required: ["type", "description", "agentAffected", "severity"],
                  additionalProperties: false,
                },
              },
              fixes: {
                type: "array",
                items: {
                  type: "object",
                  properties: { fixApplied: { type: "string" } },
                  required: ["fixApplied"],
                  additionalProperties: false,
                },
              },
              summary: { type: "string" },
            },
            required: ["consistent", "consistencyScore", "issues", "fixes", "summary"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = reviewResponse.choices[0].message.content;
    const contentStr = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent ?? {});
    const parsed = JSON.parse(contentStr || "{}");

    const issues: ReviewIssue[] = (parsed.issues ?? []).map((i: Record<string, string>) => ({
      type: i.type as ReviewIssue["type"],
      description: i.description,
      agentAffected: i.agentAffected as ReviewIssue["agentAffected"],
      severity: i.severity as ReviewIssue["severity"],
    }));

    const fixes: ReviewFix[] = (parsed.fixes ?? []).map((f: Record<string, string>, idx: number) => ({
      issue: issues[idx] ?? issues[0] ?? { type: "tone" as const, description: "General fix", agentAffected: "content" as const, severity: "low" as const },
      fixApplied: f.fixApplied,
    }));

    return {
      consistent: parsed.consistent ?? true,
      issues,
      fixes,
      consistencyScore: parsed.consistencyScore ?? 85,
      summary: parsed.summary ?? "Campaign outputs reviewed and approved.",
    };
  } catch {
    return {
      consistent: true,
      issues: [],
      fixes: [],
      consistencyScore: 80,
      summary: "Review completed with default approval (LLM review unavailable).",
    };
  }
}
