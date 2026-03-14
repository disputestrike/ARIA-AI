// Epom DSP Integration for programmatic advertising
// Manages banner campaigns, targeting, budgets, and performance tracking

import axios from "axios";

const EPOM_API_URL = process.env.EPOM_API_URL || "https://api.epom.com/v1";
const EPOM_API_KEY = process.env.EPOM_API_KEY;

interface BannerCreative {
  width: number;
  height: number;
  url: string;
  mimeType: string;
  displayName: string;
}

interface DSPCampaignParams {
  name: string;
  creatives: BannerCreative[];
  targeting: {
    countries?: string[];
    regions?: string[];
    cities?: string[];
    devices?: string[];
    demographics?: {
      age?: string;
      gender?: string;
    };
  };
  budget: {
    daily: number;
    total: number;
  };
  bidding: {
    model: "CPM" | "CPC" | "CPV";
    bid: number;
  };
  flightDates: {
    start: Date;
    end: Date;
  };
  domains?: string[];
}

async function callEpomAPI(endpoint: string, method: string = "GET", data?: any) {
  if (!EPOM_API_KEY) {
    throw new Error("Epom API key not configured");
  }

  try {
    const response = await axios({
      method,
      url: `${EPOM_API_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${EPOM_API_KEY}`,
        "Content-Type": "application/json",
      },
      data,
    });

    return response.data;
  } catch (error) {
    console.error(`Epom API error: ${endpoint}`, error);
    throw error;
  }
}

export async function createDSPCampaign(params: DSPCampaignParams) {
  // Create campaign in Epom
  const payload = {
    name: params.name,
    status: "draft", // Will be activated on user confirmation
    creatives: params.creatives,
    targeting: {
      geoTargeting: {
        countries: params.targeting.countries || [],
        regions: params.targeting.regions || [],
        cities: params.targeting.cities || [],
      },
      deviceTargeting: {
        devices: params.targeting.devices || ["desktop", "mobile", "tablet"],
      },
      demographics: params.targeting.demographics,
    },
    budget: {
      dailyBudget: params.budget.daily * 100, // Convert to cents
      totalBudget: params.budget.total * 100,
    },
    bidding: {
      model: params.bidding.model,
      bidAmount: params.bidding.bid * 1000, // Convert to micro-units
    },
    flightDates: {
      startDate: params.flightDates.start.toISOString(),
      endDate: params.flightDates.end.toISOString(),
    },
    brandSafety: {
      domainExclusions: params.domains || [],
    },
  };

  const result = await callEpomAPI("/campaigns", "POST", payload);
  return {
    campaignId: result.id,
    status: result.status,
    name: result.name,
  };
}

export async function launchDSPCampaign(campaignId: string) {
  // User confirmation required before this is called
  const result = await callEpomAPI(`/campaigns/${campaignId}`, "PATCH", {
    status: "active",
  });

  return {
    campaignId: result.id,
    status: result.status,
    launchedAt: new Date(),
  };
}

export async function getDSPCampaignPerformance(campaignId: string) {
  // Get real-time performance metrics
  const result = await callEpomAPI(`/campaigns/${campaignId}/performance`);

  return {
    campaignId,
    metrics: {
      impressions: result.impressions || 0,
      clicks: result.clicks || 0,
      ctr: result.ctr || 0,
      conversions: result.conversions || 0,
      spend: result.spend / 100 || 0, // Convert from cents
      roas: result.roas || 0,
      avgCpc: result.avgCpc / 1000 || 0, // Convert from micro-units
      avgCpm: result.avgCpm / 1000 || 0,
    },
    dateRange: {
      from: result.dateFrom,
      to: result.dateTo,
    },
  };
}

export async function pauseDSPCampaign(campaignId: string) {
  const result = await callEpomAPI(`/campaigns/${campaignId}`, "PATCH", {
    status: "paused",
  });

  return {
    campaignId: result.id,
    status: result.status,
  };
}

export async function resumeDSPCampaign(campaignId: string) {
  const result = await callEpomAPI(`/campaigns/${campaignId}`, "PATCH", {
    status: "active",
  });

  return {
    campaignId: result.id,
    status: result.status,
  };
}

export async function updateDSPBudget(campaignId: string, dailyBudget: number, totalBudget: number) {
  const result = await callEpomAPI(`/campaigns/${campaignId}`, "PATCH", {
    budget: {
      dailyBudget: dailyBudget * 100,
      totalBudget: totalBudget * 100,
    },
  });

  return {
    campaignId: result.id,
    budget: {
      daily: result.budget.dailyBudget / 100,
      total: result.budget.totalBudget / 100,
    },
  };
}

// DSP Fee reconciliation (Section 11.2)
export async function reconcileDSPSpend(campaignId: string, managementFeeBps: number = 500) {
  // 500 bps = 5% management fee
  const performance = await getDSPCampaignPerformance(campaignId);
  const totalSpend = performance.metrics.spend;
  const managementFee = (totalSpend * managementFeeBps) / 10000;

  return {
    campaignId,
    totalSpend,
    managementFee,
    managementFeePercentage: managementFeeBps / 100,
  };
}

// Generate banner creatives at all standard sizes
export async function generateBannerCreatives(
  text: string,
  colors: { primary: string; secondary: string }
): Promise<BannerCreative[]> {
  // Standard banner sizes (Section 11.1)
  const sizes = [
    { width: 300, height: 250 }, // Medium Rectangle
    { width: 728, height: 90 }, // Leaderboard
    { width: 160, height: 600 }, // Wide Skyscraper
    { width: 320, height: 50 }, // Mobile Banner
    { width: 1200, height: 628 }, // Social Media
  ];

  // TODO: Call image generation API (Stable Diffusion via Fal.ai)
  // For now, return mock URLs
  return sizes.map((size) => ({
    width: size.width,
    height: size.height,
    url: `https://placeholder.com/${size.width}x${size.height}?text=${encodeURIComponent(text)}`,
    mimeType: "image/png",
    displayName: `Banner ${size.width}x${size.height}`,
  }));
}
