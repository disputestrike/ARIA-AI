import { ARIA_MODEL } from "../_core/config";

export async function invokeLLM(params: {
  model: string;
  messages: Array<{ role: "user" | "system"; content: string }>;
  temperature?: number;
  max_tokens?: number;
}) {
  // Stub implementation - would call actual Claude API
  return {
    content: [{ type: "text", text: "{}" }],
  };
}

const ARIA_MODEL = "claude-sonnet-4-5";

export interface StrategyAgentInput {
  userInput: string;
  entryPoint: "new" | "existing" | "task";
  brandKit?: {
    brandName: string;
    tone: string;
    targetAudience: string[];
    competitors: string[];
  };
}

export interface StrategyOutput {
  domain?: string;
  strategy: {
    brandName: string;
    positioning: string;
    audience: string[];
    channels: string[];
    recommendedAssets: string[];
    competitors: string[];
    tone: string;
  };
  confidence: number;
}

export async function strategyAgent(input: StrategyAgentInput): Promise<StrategyOutput> {
  const systemPrompt = `You are ARIA's Strategy Agent. Your job is to:

1. Analyze the user's input and detect their intent
2. If they mention a domain/website, extract it
3. Infer industry, target audience, positioning
4. Recommend specific assets they should build
5. Return ONLY valid JSON (no markdown, no preamble)

Return this exact JSON structure:
{
  "domain": "detected domain or null",
  "strategy": {
    "brandName": "inferred brand name",
    "positioning": "one sentence positioning statement",
    "audience": ["audience segment 1", "audience segment 2"],
    "channels": ["channel 1", "channel 2"],
    "recommendedAssets": ["asset type 1", "asset type 2"],
    "competitors": ["competitor 1", "competitor 2"],
    "tone": "brand tone inferred from input"
  },
  "confidence": 0.85
}`;

  const userPrompt = `Analyze this request and return strategy JSON:

User Input: "${input.userInput}"
Entry Point: ${input.entryPoint}
${input.brandKit ? `Brand Kit: ${JSON.stringify(input.brandKit)}` : "No existing brand kit"}

Return ONLY JSON, no other text.`;

  try {
    const response = await invokeLLM({
      model: ARIA_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract JSON from response
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as StrategyOutput;
  } catch (error) {
    console.error("StrategyAgent error:", error);
    // Fallback strategy
    return {
      domain: undefined,
      strategy: {
        brandName: "New Brand",
        positioning: "Premium solution for modern professionals",
        audience: ["Professionals", "Entrepreneurs", "Small business owners"],
        channels: ["Email", "LinkedIn", "Blog", "Social Media"],
        recommendedAssets: ["landing_page", "email_sequence", "social_calendar"],
        competitors: [],
        tone: "Professional and approachable",
      },
      confidence: 0.5,
    };
  }
}
