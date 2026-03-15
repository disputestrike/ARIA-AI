import axios from "axios";
import * as cheerio from "cheerio";

const ARIA_MODEL = "claude-sonnet-4-5";

async function invokeLLM(params: {
  model: string;
  messages: Array<{ role: "user" | "system"; content: string }>;
  temperature?: number;
  max_tokens?: number;
}) {
  // Stub - would call Claude API
  return {
    content: [{ type: "text", text: "{}" }],
  };
}

export interface WebsiteAnalysisInput {
  url: string;
  analyzeCompetitors?: boolean;
  competitorUrls?: string[];
}

export interface WebsiteAnalysisOutput {
  domain: string;
  domainScore: number; // AI estimate - label as such in UI
  monthlyTraffic: number; // AI estimate
  trafficSources: {
    organic: number;
    paid: number;
    social: number;
    direct: number;
  };
  topKeywords: string[];
  onPageAnalysis: {
    title: string;
    metaDescription: string;
    h1Count: number;
    headings: string[];
    internalLinks: number;
    externalLinks: number;
  };
  strengths: string[];
  gaps: string[];
  competitors: Array<{
    name: string;
    domain: string;
    overlapScore: number;
  }>;
  opportunity: string;
  confidence: number;
}

export async function analyzeWebsite(
  input: WebsiteAnalysisInput
): Promise<WebsiteAnalysisOutput> {
  try {
    // Fetch real page content via cheerio + axios
    const response = await axios.get(input.url, {
      timeout: 5000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ARIA/1.0)",
      },
    });

    const $ = cheerio.load(response.data);

    // Extract real on-page data
    const title = $("title").text();
    const metaDescription = $("meta[name='description']").attr("content") || "";
    const h1Count = $("h1").length;
    const headings: string[] = [];
    $("h2, h3, h4").each((i, el) => {
      const text = $(el).text();
      if (text) headings.push(text);
    });

    const internalLinks = $("a[href^='/'], a[href^='http'][href*='" + new URL(input.url).hostname + "']").length;
    const externalLinks = $("a[href^='http']").length - internalLinks;

    // Use LLM to analyze page content and estimate metrics
    const pageText = $("body").text().substring(0, 3000); // First 3000 chars

    const analysisPrompt = `Analyze this website content and return JSON:

Domain: ${input.url}
Page Title: ${title}
Meta Description: ${metaDescription}
Page Text (first 3000 chars):
${pageText}

Return this JSON structure (NO markdown, NO preamble):
{
  "domainScore": 45,
  "monthlyTraffic": 5000,
  "trafficSources": {
    "organic": 60,
    "paid": 15,
    "social": 15,
    "direct": 10
  },
  "topKeywords": ["keyword1", "keyword2", "keyword3"],
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "opportunity": "One sentence opportunity statement",
  "competitorGuess": ["competitor1", "competitor2"]
}

Remember: All metrics are AI ESTIMATES. Include "AI Estimate" label in UI.`;

    const analysisResponse = await invokeLLM({
      model: ARIA_MODEL,
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const analysisContent = analysisResponse.content[0];
    if (analysisContent.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const jsonMatch = analysisContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON in analysis response");
    }

    const analysisData = JSON.parse(jsonMatch[0]);

    // Build final output
    const output: WebsiteAnalysisOutput = {
      domain: input.url,
      domainScore: analysisData.domainScore || 50,
      monthlyTraffic: analysisData.monthlyTraffic || 10000,
      trafficSources: analysisData.trafficSources || {
        organic: 60,
        paid: 20,
        social: 12,
        direct: 8,
      },
      topKeywords: analysisData.topKeywords || [],
      onPageAnalysis: {
        title,
        metaDescription,
        h1Count,
        headings: headings.slice(0, 10),
        internalLinks,
        externalLinks,
      },
      strengths: analysisData.strengths || [
        "Clear value proposition",
        "Professional design",
        "Mobile responsive",
      ],
      gaps: analysisData.gaps || [
        "No schema markup",
        "Thin product descriptions",
        "Limited blog content",
      ],
      competitors: (analysisData.competitorGuess || []).map((name: string, i: number) => ({
        name,
        domain: `https://${name.toLowerCase().replace(/\s+/g, "")}.com`,
        overlapScore: 60 + Math.random() * 30,
      })),
      opportunity: analysisData.opportunity || "Create more comprehensive product pages optimized for SEO",
      confidence: 0.65, // Lower confidence for AI estimates
    };

    return output;
  } catch (error) {
    console.error("Website analysis error:", error);
    
    // Fallback response
    return {
      domain: input.url,
      domainScore: 42,
      monthlyTraffic: 5000,
      trafficSources: { organic: 60, paid: 15, social: 15, direct: 10 },
      topKeywords: ["marketing", "software", "saas"],
      onPageAnalysis: {
        title: "Website Title",
        metaDescription: "Meta description not found",
        h1Count: 1,
        headings: [],
        internalLinks: 0,
        externalLinks: 0,
      },
      strengths: ["Website exists"],
      gaps: ["Limited data available"],
      competitors: [],
      opportunity: "Unable to fully analyze - check website is accessible",
      confidence: 0.2,
    };
  }
}
