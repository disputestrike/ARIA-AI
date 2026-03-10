/**
 * DSP (Demand-Side Platform) Integration — Epom API
 * Handles programmatic ad campaign creation, management, and reporting.
 */

const EPOM_API_BASE = process.env.EPOM_API_URL ?? "https://api.epom.com/v1";
const EPOM_API_KEY = process.env.EPOM_API_KEY ?? "";

interface EpomCampaign {
  id?: string;
  name: string;
  status: "active" | "paused" | "stopped";
  budget: number;
  dailyBudget?: number;
  startDate: string;
  endDate?: string;
  targeting: {
    geos?: string[];
    devices?: string[];
    os?: string[];
    browsers?: string[];
    categories?: string[];
  };
  bidType: "CPM" | "CPC" | "CPA";
  bidAmount: number;
  creativeIds?: string[];
}

interface EpomCreative {
  id?: string;
  name: string;
  type: "banner" | "video" | "native";
  width?: number;
  height?: number;
  url?: string;
  htmlContent?: string;
  clickUrl: string;
  impressionTracker?: string;
}

async function epomRequest<T>(endpoint: string, method = "GET", body?: unknown): Promise<T> {
  const url = `${EPOM_API_BASE}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Authorization": `Bearer ${EPOM_API_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Epom API error ${res.status}: ${error}`);
  }

  return res.json() as Promise<T>;
}

// ─── Campaign Management ──────────────────────────────────────────────────────

export async function createEpomCampaign(campaign: EpomCampaign): Promise<{ id: string; status: string }> {
  if (!EPOM_API_KEY) {
    console.warn("[DSP] Epom API key not configured — returning mock campaign ID");
    return { id: `mock_${Date.now()}`, status: "active" };
  }

  return epomRequest<{ id: string; status: string }>("/campaigns", "POST", campaign);
}

export async function updateEpomCampaign(campaignId: string, updates: Partial<EpomCampaign>): Promise<{ success: boolean }> {
  if (!EPOM_API_KEY) return { success: true };
  return epomRequest<{ success: boolean }>(`/campaigns/${campaignId}`, "PATCH", updates);
}

export async function pauseEpomCampaign(campaignId: string): Promise<{ success: boolean }> {
  if (!EPOM_API_KEY) return { success: true };
  return epomRequest<{ success: boolean }>(`/campaigns/${campaignId}/pause`, "POST");
}

export async function resumeEpomCampaign(campaignId: string): Promise<{ success: boolean }> {
  if (!EPOM_API_KEY) return { success: true };
  return epomRequest<{ success: boolean }>(`/campaigns/${campaignId}/resume`, "POST");
}

export async function getEpomCampaignStats(campaignId: string, startDate: string, endDate: string): Promise<{
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpm: number;
  cpc: number;
}> {
  if (!EPOM_API_KEY) {
    return { impressions: 0, clicks: 0, conversions: 0, spend: 0, ctr: 0, cpm: 0, cpc: 0 };
  }
  return epomRequest(`/campaigns/${campaignId}/stats?startDate=${startDate}&endDate=${endDate}`);
}

// ─── Creative Management ──────────────────────────────────────────────────────

export async function uploadEpomCreative(creative: EpomCreative): Promise<{ id: string; previewUrl: string }> {
  if (!EPOM_API_KEY) {
    return { id: `mock_creative_${Date.now()}`, previewUrl: "" };
  }
  return epomRequest<{ id: string; previewUrl: string }>("/creatives", "POST", creative);
}

// ─── Audience Targeting ───────────────────────────────────────────────────────

export async function getEpomAudiences(): Promise<Array<{ id: string; name: string; size: number }>> {
  if (!EPOM_API_KEY) return [];
  return epomRequest<Array<{ id: string; name: string; size: number }>>("/audiences");
}

export async function createEpomAudience(name: string, rules: unknown[]): Promise<{ id: string }> {
  if (!EPOM_API_KEY) return { id: `mock_audience_${Date.now()}` };
  return epomRequest<{ id: string }>("/audiences", "POST", { name, rules });
}

// ─── Reporting ────────────────────────────────────────────────────────────────

export async function getEpomAccountStats(startDate: string, endDate: string): Promise<{
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCtr: number;
  avgCpm: number;
  topCampaigns: Array<{ id: string; name: string; spend: number; conversions: number }>;
}> {
  if (!EPOM_API_KEY) {
    return { totalSpend: 0, totalImpressions: 0, totalClicks: 0, totalConversions: 0, avgCtr: 0, avgCpm: 0, topCampaigns: [] };
  }
  return epomRequest(`/stats/account?startDate=${startDate}&endDate=${endDate}`);
}
