// DataForSEO Integration for real SEO metrics
// Free APIs: Google PageSpeed, Meta Ad Library, cheerio scraper
// Paid: DataForSEO (domain authority, traffic, keywords, backlinks, technical audit)

import axios from "axios";

const DATASEO_API_URL = "https://api.dataforseo.com/v3";
const DATASEO_LOGIN = process.env.DATASEO_LOGIN;
const DATASEO_PASSWORD = process.env.DATASEO_PASSWORD;

// Cache key structure
const CACHE_KEYS = {
  domain_overview: (domain: string) => `dataseo:domain:${domain}`,
  keywords: (domain: string) => `dataseo:keywords:${domain}`,
  keyword_gap: (domain: string, competitor: string) => `dataseo:gap:${domain}:${competitor}`,
  backlinks: (domain: string) => `dataseo:backlinks:${domain}`,
  technical_audit: (domain: string) => `dataseo:audit:${domain}`,
  rank_tracking: (domain: string) => `dataseo:rank:${domain}`,
} as const;

// Cache TTL in seconds (from Section 12.3)
const CACHE_TTL = {
  domain_overview: 7 * 24 * 60 * 60, // 7 days
  keyword_volumes: 30 * 24 * 60 * 60, // 30 days
  competitor_keywords: 7 * 24 * 60 * 60, // 7 days
  rank_tracking: 24 * 60 * 60, // 24 hours
  technical_audit: 7 * 24 * 60 * 60, // 7 days
  competitor_ads: 6 * 60 * 60, // 6 hours
  page_speed: 24 * 60 * 60, // 24 hours
} as const;

interface DataSeoTask {
  language_code?: string;
  target?: string;
  domain?: string;
  limit?: number;
  [key: string]: any;
}

async function makeDataSeoRequest(endpoint: string, tasks: DataSeoTask[]) {
  if (!DATASEO_LOGIN || !DATASEO_PASSWORD) {
    throw new Error("DataForSEO credentials not configured");
  }

  try {
    const response = await axios.post(`${DATASEO_API_URL}${endpoint}`, tasks, {
      auth: {
        username: DATASEO_LOGIN,
        password: DATASEO_PASSWORD,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(`DataForSEO API error: ${endpoint}`, error);
    throw error;
  }
}

export async function getDomainOverview(domain: string) {
  // Cost: $0.0012 per call (Section 12.2)
  const task: DataSeoTask = {
    domain,
  };

  const result = await makeDataSeoRequest("/domain_analytics/whois/overview", [task]);

  return {
    domain,
    domainAuthority: result?.tasks?.[0]?.result?.[0]?.domain_rank || 0,
    trafficEstimate: result?.tasks?.[0]?.result?.[0]?.estimated_traffic || 0,
    backlinks: result?.tasks?.[0]?.result?.[0]?.backlinks || 0,
    referringDomains: result?.tasks?.[0]?.result?.[0]?.referring_domains || 0,
  };
}

export async function getKeywordResearch(keyword: string, language: string = "en") {
  // Cost: $0.002 per call (Section 12.2)
  const task: DataSeoTask = {
    language_code: language,
    target: keyword,
    limit: 100,
  };

  const result = await makeDataSeoRequest("/dataforseo_labs/google/keyword_ideas/live", [task]);

  return {
    keyword,
    keywords: (result?.tasks?.[0]?.result?.[0]?.keywords || []).map((kw: any) => ({
      keyword: kw.keyword,
      volume: kw.search_volume,
      difficulty: kw.keyword_difficulty,
      cpc: kw.cpc,
    })),
  };
}

export async function getCompetitorKeywordGap(domain: string, competitor: string) {
  // Cost: $0.002 per call (Section 12.2)
  const task: DataSeoTask = {
    domain,
    competitor,
    limit: 100,
  };

  const result = await makeDataSeoRequest("/dataforseo_labs/google/keyword_gap/live", [task]);

  return {
    domain,
    competitor,
    gaps: (result?.tasks?.[0]?.result?.[0]?.gaps || []).map((gap: any) => ({
      keyword: gap.keyword,
      competitorRank: gap.competitor_rank,
      yourRank: gap.your_rank,
      volume: gap.search_volume,
      difficulty: gap.keyword_difficulty,
      opportunity: gap.opportunity_score,
    })),
  };
}

export async function getBacklinkProfile(domain: string) {
  // Cost: $0.001 per call (Section 12.2)
  const task: DataSeoTask = {
    domain,
  };

  const result = await makeDataSeoRequest("/backlinks/summary/live", [task]);

  return {
    domain,
    totalBacklinks: result?.tasks?.[0]?.result?.[0]?.total_backlinks || 0,
    referringDomains: result?.tasks?.[0]?.result?.[0]?.referring_domains || 0,
    topPages: result?.tasks?.[0]?.result?.[0]?.top_pages || [],
  };
}

export async function getTechnicalAudit(domain: string) {
  // Cost: $0.005 per call (Section 12.2)
  const task: DataSeoTask = {
    domain,
  };

  const result = await makeDataSeoRequest("/on_page/task_post", [task]);
  const taskId = result?.tasks?.[0]?.id;

  if (!taskId) throw new Error("Failed to start technical audit");

  // Check audit status (would need polling in real implementation)
  const auditResult = await makeDataSeoRequest("/on_page/summary", [{ task_id: taskId }]);

  return {
    domain,
    score: auditResult?.tasks?.[0]?.result?.[0]?.overall_score || 0,
    issues: {
      critical: auditResult?.tasks?.[0]?.result?.[0]?.critical_issues || 0,
      warning: auditResult?.tasks?.[0]?.result?.[0]?.warning_issues || 0,
      info: auditResult?.tasks?.[0]?.result?.[0]?.info_issues || 0,
    },
  };
}

export async function getRankTracking(domain: string, keywords: string[]) {
  // Cost: $0.0012 per call (Section 12.2)
  const tasks = keywords.map((keyword) => ({
    domain,
    target: keyword,
    language_code: "en",
  }));

  const result = await makeDataSeoRequest("/serp/google/organic/live/regular", tasks);

  return {
    domain,
    rankings: result?.tasks?.map((task: any, idx: number) => ({
      keyword: keywords[idx],
      rank: task?.result?.[0]?.rank || null,
      url: task?.result?.[0]?.url || null,
      position: task?.result?.[0]?.position || null,
    })) || [],
  };
}

// Retry logic for API calls (rate limiting)
export async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      if (error.response?.status === 429) {
        // Rate limited - wait and retry
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}
