const ARIA_MODEL = "claude-sonnet-4-5";

async function invokeLLM(params: {
  model: string;
  messages: Array<{ role: "user" | "system"; content: string }>;
  temperature?: number;
  max_tokens?: number;
}) {
  // Stub - would call Claude API
  return {
    content: [{ type: "text", text: "Generated content" }],
  };
}

export type AssetType = 
  | "blog_post"
  | "email_sequence"
  | "social_calendar"
  | "landing_page"
  | "ad_copy_short"
  | "ad_copy_long"
  | "video_script"
  | "seo_audit"
  | "google_ads"
  | "tiktok_script";

export interface GenerateAssetInput {
  assetType: AssetType;
  strategy: {
    positioning: string;
    targetAudience: string[];
    tone: string;
  };
  brandKit?: {
    brandName: string;
    tone: string;
    keywords: string[];
  };
  context?: string;
}

export interface AssetGenerationOutput {
  type: AssetType;
  title: string;
  content: string;
  metadata: {
    tokens: number;
    sections: number;
    platform?: string;
  };
}

const ASSET_PROMPTS: Record<AssetType, (input: GenerateAssetInput) => string> = {
  blog_post: (input) => `Write an SEO-optimized blog post (800-1200 words) for:
Brand: ${input.brandKit?.brandName || "Unknown"}
Positioning: ${input.strategy.positioning}
Tone: ${input.strategy.tone}
Target: ${input.strategy.targetAudience.join(", ")}

Include: Title (H1), Introduction, 3 main sections (H2), Conclusion
Keywords to incorporate: ${input.brandKit?.keywords.join(", ") || "general keywords"}`,

  email_sequence: (input) => `Create a 5-email welcome sequence for:
Brand: ${input.brandKit?.brandName || "Unknown"}
Tone: ${input.strategy.tone}
Audience: ${input.strategy.targetAudience.join(", ")}

Each email should have:
- Subject line
- Preview text
- Body (150-200 words)
- CTA

Format as Email 1, Email 2, etc.`,

  social_calendar: (input) => `Create a 4-week social media calendar for:
Brand: ${input.brandKit?.brandName || "Unknown"}
Platforms: Instagram, LinkedIn, Twitter, TikTok
Tone: ${input.strategy.tone}
Topics: ${input.brandKit?.keywords.join(", ") || "product features, customer stories, industry insights"}

Format: Week 1, Week 2, Week 3, Week 4
Each week has 4 posts (one per platform)
Include: Post copy, hashtags, best-time-to-post recommendation`,

  landing_page: (input) => `Write landing page copy for:
Positioning: ${input.strategy.positioning}
Target: ${input.strategy.targetAudience.join(", ")}
Tone: ${input.strategy.tone}

Sections:
- Hero headline + subheadline
- Problem statement
- Solution overview
- Key benefits (3)
- Social proof section
- CTA

Keep it conversion-focused and scannable.`,

  ad_copy_short: (input) => `Write 5 short ad copy variations (90 characters max each) for:
Positioning: ${input.strategy.positioning}
Target: ${input.strategy.targetAudience.join(", ")}
Tone: ${input.strategy.tone}

Each should have strong CTA and be platform-agnostic.`,

  ad_copy_long: (input) => `Write 3 long-form ad copy variations (200-400 words each) for:
Brand: ${input.brandKit?.brandName || "Unknown"}
Positioning: ${input.strategy.positioning}
Tone: ${input.strategy.tone}

Format:
- Attention-grabbing headline
- Problem statement
- Solution narrative
- Key benefits
- Social proof
- Strong CTA`,

  video_script: (input) => `Write a product demo video script (60-90 seconds) for:
Brand: ${input.brandKit?.brandName || "Unknown"}
Positioning: ${input.strategy.positioning}
Tone: ${input.strategy.tone}

Include:
- Hook (0-5 sec)
- Problem intro (5-15 sec)
- Solution demo (15-50 sec)
- Key benefits (50-70 sec)
- CTA (70-90 sec)

Include [VISUAL CUE] markers for video production.`,

  seo_audit: (input) => `Provide an SEO audit report for:
Target keywords: ${input.brandKit?.keywords.join(", ") || "general keywords"}

Sections:
- Current state (on-page, off-page, technical)
- Issues found (critical, warnings, info)
- Recommendations (priority ranked)
- 90-day roadmap
- Expected impact metrics

Format as structured audit report.`,

  google_ads: (input) => `Create a Google Ads campaign structure for:
Brand: ${input.brandKit?.brandName || "Unknown"}
Positioning: ${input.strategy.positioning}

Include:
- Ad Group 1: 2 headlines, 2 descriptions, keywords
- Ad Group 2: 2 headlines, 2 descriptions, keywords
- Ad Group 3: 2 headlines, 2 descriptions, keywords

Keep under 30 characters for headlines, 90 for descriptions.`,

  tiktok_script: (input) => `Write 3 TikTok video scripts (15-30 seconds each) for:
Brand: ${input.brandKit?.brandName || "Unknown"}
Tone: ${input.strategy.tone}
Audience: ${input.strategy.targetAudience.join(", ")}

Each script should:
- Have immediate hook (0-3 sec)
- Be trendy/relatable
- Include text overlay suggestions
- End with CTA or call-to-action text
- Be optimized for TikTok's vertical format`,
};

export async function generateAsset(
  input: GenerateAssetInput
): Promise<AssetGenerationOutput> {
  const assetPrompt = ASSET_PROMPTS[input.assetType];
  if (!assetPrompt) {
    throw new Error(`Unknown asset type: ${input.assetType}`);
  }

  const systemPrompt = `You are ARIA's Asset Generation Agent. Generate high-quality marketing content that:
- Matches the brand tone and voice exactly
- Targets the specified audience
- Follows the positioning statement
- Is ready to publish (no disclaimers about AI)
- Uses natural language, not marketing jargon

Return ONLY the content. No preamble, no meta-commentary.`;

  try {
    const response = await invokeLLM({
      model: ARIA_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: assetPrompt(input) },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Count tokens approximately (rough estimate: 1 token ≈ 4 characters)
    const tokenEstimate = Math.ceil(content.text.length / 4);
    const sectionCount = (content.text.match(/^#+\s/gm) || []).length;

    return {
      type: input.assetType,
      title: `${input.assetType.replace(/_/g, " ").toUpperCase()} - Generated ${new Date().toLocaleDateString()}`,
      content: content.text,
      metadata: {
        tokens: tokenEstimate,
        sections: sectionCount || 1,
        platform: getPlatformForAsset(input.assetType),
      },
    };
  } catch (error) {
    console.error("Asset generation error:", error);
    throw error;
  }
}

function getPlatformForAsset(assetType: AssetType): string | undefined {
  const platformMap: Record<AssetType, string | undefined> = {
    blog_post: "Website",
    email_sequence: "Email",
    social_calendar: "Multi-platform",
    landing_page: "Website",
    ad_copy_short: "Ads",
    ad_copy_long: "Ads",
    video_script: "Video",
    seo_audit: "Internal",
    google_ads: "Google Ads",
    tiktok_script: "TikTok",
  };
  return platformMap[assetType];
}
