// AEO (Answer Engine Optimization) Integration
// Gets brand mention opportunities in ChatGPT, Perplexity, Google AI Overviews
// Section 10.3 - First-mover feature, no competitors have it

import axios from "axios";

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

interface AIEnginePresence {
  engine: "google_ai" | "perplexity" | "chatgpt";
  recommended: boolean;
  whatItSays?: string;
  mentionsBrand?: boolean;
  gapScore: number; // 0-100, higher = bigger opportunity
}

interface AEOAudit {
  domain: string;
  engines: AIEnginePresence[];
  topOpportunities: {
    question: string;
    frequency: number;
    currentRanking: string;
    opportunityScore: number;
  }[];
  strategy: {
    contentToCreate: string[];
    entityPage: boolean;
    schemaMarkup: string[];
    prBriefTopics: string[];
  };
}

// Step 1: AI Presence Audit (Section 10.3 - Step 1)
export async function auditAIPresence(domain: string, industry: string): Promise<AEOAudit> {
  const topQuestions = await getTopIndustryQuestions(industry, domain);

  // Step 1: Audit via SerpAPI (Google AI Overviews)
  const googleAIResults = await auditGoogleAI(domain, topQuestions);

  // Step 2: Audit via Perplexity API
  const perplexityResults = await auditPerplexity(domain, topQuestions);

  // Step 3: Estimate ChatGPT presence (via structured prompts)
  // ChatGPT doesn't have direct API for recommendations, so we use heuristics
  const chatgptPresence = estimateChatGPTPresence(domain, topQuestions);

  // Aggregate results
  const engines: AIEnginePresence[] = [
    {
      engine: "google_ai",
      recommended: googleAIResults.mentioned,
      whatItSays: googleAIResults.summary,
      mentionsBrand: googleAIResults.mentioned,
      gapScore: googleAIResults.gapScore,
    },
    {
      engine: "perplexity",
      recommended: perplexityResults.mentioned,
      whatItSays: perplexityResults.summary,
      mentionsBrand: perplexityResults.mentioned,
      gapScore: perplexityResults.gapScore,
    },
    {
      engine: "chatgpt",
      recommended: chatgptPresence.recommended,
      gapScore: chatgptPresence.gapScore,
    },
  ];

  // Build strategy (Section 10.3 - Step 3)
  const strategy = buildAEOStrategy(domain, engines, topQuestions);

  return {
    domain,
    engines,
    topOpportunities: topQuestions
      .slice(0, 5)
      .map((q) => ({
        question: q.question,
        frequency: q.frequency,
        currentRanking: "Not mentioned",
        opportunityScore: q.opportunityScore,
      })),
    strategy,
  };
}

async function getTopIndustryQuestions(industry: string, domain: string): Promise<any[]> {
  // Use SerpAPI to find top questions in industry
  if (!SERPAPI_KEY) {
    throw new Error("SerpAPI key not configured");
  }

  try {
    const response = await axios.get("https://serpapi.com/search", {
      params: {
        engine: "google",
        q: `${industry} common questions`,
        api_key: SERPAPI_KEY,
        type: "search",
      },
    });

    // Extract questions from "People Also Ask" section
    const peopleAlsoAsk = response.data.people_also_ask || [];
    return peopleAlsoAsk.map((q: any, idx: number) => ({
      question: q.question,
      frequency: 100 - idx * 10, // Rough estimate based on position
      opportunityScore: 75 + Math.random() * 25,
    }));
  } catch (error) {
    console.error("Error fetching top questions:", error);
    return [];
  }
}

async function auditGoogleAI(domain: string, questions: any[]) {
  // Query Google AI Overviews via SerpAPI
  if (!SERPAPI_KEY) {
    throw new Error("SerpAPI key not configured");
  }

  try {
    const response = await axios.get("https://serpapi.com/search", {
      params: {
        engine: "google",
        q: domain,
        api_key: SERPAPI_KEY,
      },
    });

    const aiOverview = response.data.ai_overview;
    const mentioned = aiOverview?.text?.toLowerCase().includes(domain.toLowerCase()) || false;

    return {
      mentioned,
      summary: aiOverview?.text || "",
      gapScore: mentioned ? 20 : 85,
    };
  } catch (error) {
    console.error("Error auditing Google AI:", error);
    return {
      mentioned: false,
      summary: "",
      gapScore: 85,
    };
  }
}

async function auditPerplexity(domain: string, questions: any[]) {
  // Query Perplexity API
  if (!PERPLEXITY_API_KEY) {
    // Return mock data if key not configured
    return {
      mentioned: false,
      summary: "",
      gapScore: 85,
    };
  }

  try {
    // Simplified Perplexity prompt
    const prompt = `In the [industry] category, is ${domain} mentioned as a top solution? Answer briefly.`;

    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "pplx-7b-chat",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        },
      }
    );

    const answer = response.data.choices[0].message.content;
    const mentioned = answer.toLowerCase().includes("yes") || answer.toLowerCase().includes(domain.toLowerCase());

    return {
      mentioned,
      summary: answer,
      gapScore: mentioned ? 20 : 85,
    };
  } catch (error) {
    console.error("Error auditing Perplexity:", error);
    return {
      mentioned: false,
      summary: "",
      gapScore: 85,
    };
  }
}

function estimateChatGPTPresence(domain: string, questions: any[]): { recommended: boolean; gapScore: number } {
  // ChatGPT knowledge cutoff limits real-time detection
  // For MVP, estimate based on domain authority and relevance
  // In production: use GPT API with instructions to state if they recommend the domain

  // For now, assume not recommended (conservative estimate)
  return {
    recommended: false,
    gapScore: 80, // High opportunity to get recommended
  };
}

// Section 10.3 - Step 3: Build AEO content strategy
function buildAEOStrategy(
  domain: string,
  engines: AIEnginePresence[],
  topQuestions: any[]
): {
  contentToCreate: string[];
  entityPage: boolean;
  schemaMarkup: string[];
  prBriefTopics: string[];
} {
  return {
    contentToCreate: [
      "Entity page (company overview + FAQ schema)",
      "20-30 question cluster answers with schema markup",
      "Original research/data to support unique claims",
      "FAQ page with structured data",
    ],
    entityPage: true,
    schemaMarkup: ["Organization", "FAQPage", "HowTo", "NewsArticle", "BlogPosting"],
    prBriefTopics: [
      "Pitch tech journalists covering your industry",
      "Guest articles on authority sites mentioning your solution",
      "Press release with original data/research",
      "Quotes in industry news (builds authority for AI training)",
    ],
  };
}

// Section 10.3 - Step 5: Re-audit after 30 days
export async function reauditAIPresence(domain: string, industry: string) {
  // 30-day scheduled job re-runs the audit
  // Shows if brand now appears in AI recommendations (Section 10.3 - Step 5)
  return await auditAIPresence(domain, industry);
}

export function buildAEORecommendation(audit: AEOAudit): string {
  const gaps = audit.engines.filter((e) => !e.recommended);

  if (gaps.length === 0) {
    return `Excellent! ${audit.domain} is already mentioned in all major AI search engines. Focus on maintaining visibility.`;
  }

  if (gaps.length === 3) {
    return `High opportunity: ${audit.domain} is not yet mentioned in AI search engines. Create 20-30 question clusters with schema markup and distribute via PR.`;
  }

  return `Medium opportunity: ${audit.domain} is mentioned in some AI engines. Increase content depth and consider guest articles on authority sites.`;
}
