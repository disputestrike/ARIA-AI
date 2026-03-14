// Campaign limits per tier - locked in specification (Section 14)
export const CAMPAIGN_LIMITS = {
  free: 1,
  starter: 5,
  pro: 10,
  business: 20,
  agency: 40,
  enterprise: Infinity,
} as const;

export const OVERAGE_RATES = {
  free: 0, // Cannot purchase overage
  starter: 8, // $8 per extra campaign
  pro: 5, // $5 per extra campaign
  business: 3, // $3 per extra campaign
  agency: 1.5, // $1.50 per extra campaign
  enterprise: 0, // Unlimited
} as const;

export const TIER_PRICES = {
  free: 0,
  starter: 49,
  pro: 98,
  business: 196,
  agency: 392,
  enterprise: 0, // Custom
} as const;

export const REGENERATION_LIMITS = {
  free: 5,
  starter: 5,
  pro: 5,
  business: 10,
  agency: Infinity,
  enterprise: Infinity,
} as const;

export type Tier = keyof typeof CAMPAIGN_LIMITS;

export function getCampaignLimit(tier: Tier): number {
  return CAMPAIGN_LIMITS[tier];
}

export function getOverageRate(tier: Tier): number {
  return OVERAGE_RATES[tier];
}

export function getTierPrice(tier: Tier): number {
  return TIER_PRICES[tier];
}

export function getRegenerationLimit(tier: Tier): number {
  return REGENERATION_LIMITS[tier];
}

export function canCreateCampaign(tier: Tier, campaignsUsedThisMonth: number): boolean {
  const limit = getCampaignLimit(tier);
  if (limit === Infinity) return true;
  return campaignsUsedThisMonth < limit;
}

export function calculateOverageCost(tier: Tier, extraCampaigns: number): number {
  const rate = getOverageRate(tier);
  if (rate === 0) return 0; // Cannot purchase overage on free tier
  return extraCampaigns * rate;
}
