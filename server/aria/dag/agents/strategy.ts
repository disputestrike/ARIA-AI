// server/aria/dag/agents/strategy.ts
// StrategyAgent — always runs first, builds the CampaignBrief for all other agents
import type { AgentResult, CampaignBrief } from "../types";
import { analyzeProduct, analyzeWebsite, getBrandVoice } from "../../tools/understand";
import { invokeLLM } from "../../../_core/llm";

export async function runStrategyAgent(
  userId: number,
  userMessage: string
): Promise<AgentResult> {
  const start = Date.now();
  try {
    // Extract product name and URL from user message
    const urlMatch = userMessage.match(/https?:\/\/[^\s]+/);
    const websiteUrl = urlMatch?.[0];

    // Run product analysis and brand voice in parallel
    const [productResult, brandVoiceResult] = await Promise.allSettled([
      analyzeProduct(userId, { name: userMessage.substring(0, 100), url: websiteUrl }),
      getBrandVoice(userId, {}),
    ]);

    const productData = productResult.status === "fulfilled" ? productResult.value.data : {};
    const brandVoiceData = brandVoiceResult.status === "fulfilled" ? brandVoiceResult.value.data : {};

    // Use LLM to extract structured campaign brief from user message
    const briefResponse = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a marketing strategist. Extract a structured campaign brief from the user's request. Return JSON only.`,
        },
        {
          role: "user",
          content: `User request: "${userMessage}"\n\nProduct context: ${JSON.stringify(productData).substring(0, 500)}\n\nExtract: productName, productDescription, targetAudience, ageRange, tone, platforms (array), goals (array), brandVoice, keyMessages (array of 3). Return JSON only.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "campaign_brief",
          strict: true,
          schema: {
            type: "object",
            properties: {
              productName: { type: "string" },
              productDescription: { type: "string" },
              targetAudience: { type: "string" },
              ageRange: { type: "string" },
              tone: { type: "string" },
              platforms: { type: "array", items: { type: "string" } },
              goals: { type: "array", items: { type: "string" } },
              brandVoice: { type: "string" },
              keyMessages: { type: "array", items: { type: "string" } },
            },
            required: ["productName", "productDescription", "targetAudience", "ageRange", "tone", "platforms", "goals", "brandVoice", "keyMessages"],
            additionalProperties: false,
          },
        },
      },
    });

    let brief: CampaignBrief;
    try {
      const rawContent = briefResponse.choices[0].message.content;
      const contentStr = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent ?? {});
      const parsed = JSON.parse(contentStr || "{}");
      brief = {
        productName: parsed.productName ?? "Product",
        productDescription: parsed.productDescription ?? userMessage,
        targetAudience: parsed.targetAudience ?? "General audience",
        ageRange: parsed.ageRange ?? "18-45",
        tone: parsed.tone ?? "professional",
        platforms: parsed.platforms ?? ["Meta", "Google", "LinkedIn"],
        goals: parsed.goals ?? ["awareness", "conversions"],
        brandVoice: (brandVoiceData as { voice?: string })?.voice ?? parsed.brandVoice ?? "professional and engaging",
        websiteUrl,
        keyMessages: parsed.keyMessages ?? [userMessage],
      };
    } catch {
      brief = {
        productName: userMessage.split(" ").slice(0, 3).join(" "),
        productDescription: userMessage,
        targetAudience: "General audience",
        tone: "professional",
        platforms: ["Meta", "Google", "LinkedIn", "TikTok"],
        goals: ["awareness", "conversions", "engagement"],
        brandVoice: "professional and engaging",
        websiteUrl,
        keyMessages: [userMessage],
      };
    }

    return {
      agentName: "strategy",
      success: true,
      durationMs: Date.now() - start,
      assets: { campaigns: 1 },
      summary: `Campaign brief created for "${brief.productName}" targeting ${brief.targetAudience}`,
      data: { brief, productData, brandVoiceData },
    };
  } catch (err) {
    return {
      agentName: "strategy",
      success: false,
      durationMs: Date.now() - start,
      assets: {},
      summary: "Strategy analysis failed",
      data: {},
      error: String((err as Error).message),
    };
  }
}
