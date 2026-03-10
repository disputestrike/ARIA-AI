// ─── ARIA Subscription Plans ───────────────────────────────────────────────────
// Tier values MUST match the schema enum: "free" | "starter" | "professional" | "business" | "agency"

export const ARIA_PLANS = {
  starter: {
    name: "Starter",
    description: "Perfect for solo marketers and small businesses",
    priceMonthly: 4900,
    priceYearly: 39000,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "price_starter_monthly",
    stripePriceIdYearly: process.env.STRIPE_PRICE_STARTER_YEARLY ?? "price_starter_yearly",
    dbTier: "starter" as "starter",
    limits: { aiMessages: 500, campaigns: 5, contents: 50, landingPages: 3, teamMembers: 1, dspBudget: 0 },
  },
  professional: {
    name: "Professional",
    description: "For growing teams that need more power",
    priceMonthly: 9900,
    priceYearly: 79200,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "price_pro_monthly",
    stripePriceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "price_pro_yearly",
    dbTier: "professional" as "professional",
    limits: { aiMessages: 2000, campaigns: 25, contents: 500, landingPages: 20, teamMembers: 5, dspBudget: 100000 },
  },
  business: {
    name: "Business",
    description: "For scaling businesses and agencies",
    priceMonthly: 19900,
    priceYearly: 159200,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_BIZ_MONTHLY ?? "price_biz_monthly",
    stripePriceIdYearly: process.env.STRIPE_PRICE_BIZ_YEARLY ?? "price_biz_yearly",
    dbTier: "business" as "business",
    limits: { aiMessages: 10000, campaigns: 100, contents: 2000, landingPages: 100, teamMembers: 15, dspBudget: 500000 },
  },
  agency: {
    name: "Agency",
    description: "Unlimited power for agencies and enterprises",
    priceMonthly: 29900,
    priceYearly: 239200,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_AGENCY_MONTHLY ?? "price_agency_monthly",
    stripePriceIdYearly: process.env.STRIPE_PRICE_AGENCY_YEARLY ?? "price_agency_yearly",
    dbTier: "agency" as "agency",
    limits: { aiMessages: -1, campaigns: -1, contents: -1, landingPages: -1, teamMembers: 25, dspBudget: -1 },
  },
};

export type PlanTier = keyof typeof ARIA_PLANS;
export type DbTier = "free" | "starter" | "professional" | "business" | "agency";

export function getPlanByPriceId(priceId: string): PlanTier | null {
  for (const [tier, plan] of Object.entries(ARIA_PLANS)) {
    if (plan.stripePriceIdMonthly === priceId || plan.stripePriceIdYearly === priceId) {
      return tier as PlanTier;
    }
  }
  return null;
}

export function getDbTierForPriceId(priceId: string): DbTier {
  const planKey = getPlanByPriceId(priceId);
  if (!planKey) return "starter";
  return ARIA_PLANS[planKey].dbTier;
}
