import { TRPCError } from "@trpc/server";

interface Context {
  user?: {
    id: number;
    subscriptionTier: "free" | "starter" | "pro" | "business" | "agency" | "enterprise";
  };
}

// Campaign limits by tier
const TIER_LIMITS = {
  free: 1,
  starter: 5,
  pro: 10,
  business: 20,
  agency: 40,
  enterprise: 1000,
};

// Rate limits (requests per hour)
const RATE_LIMITS = {
  free: 10,
  starter: 50,
  pro: 200,
  business: 500,
  agency: 1000,
  enterprise: 5000,
};

// In-memory rate limit store (would use Redis in production)
const rateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>();

export async function checkCampaignLimit(ctx: Context): Promise<void> {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  // In production: query database
  // const userCampaigns = await db.project.count({
  //   where: { userId: ctx.user.id },
  // });

  const limit = TIER_LIMITS[ctx.user.subscriptionTier];
  const userCampaigns = 0; // Placeholder

  if (userCampaigns >= limit) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Campaign limit reached (${limit}). Upgrade to create more.`,
    });
  }
}

export async function checkRateLimit(
  ctx: Context,
  endpoint: string
): Promise<void> {
  if (!ctx.user) {
    return; // Skip rate limit for unauthenticated
  }

  const key = `${ctx.user.id}:${endpoint}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // Reset window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + 3600000, // 1 hour
    });
    return;
  }

  const limit = RATE_LIMITS[ctx.user.subscriptionTier];

  if (entry.count >= limit) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded (${limit} requests/hour). Try again in ${Math.ceil((entry.resetAt - now) / 60000)} minutes.`,
    });
  }

  entry.count++;
}

export async function decrementCampaignLimit(
  ctx: Context,
  db: any
): Promise<void> {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  // In production: increment campaign count
  // await db.user.update({
  //   where: { id: ctx.user.id },
  //   data: {
  //     campaignsUsedThisMonth: {
  //       increment: 1,
  //     },
  //   },
  // });
}

export function getUpgradeMessage(currentTier: string): string {
  const tierOrder = ["free", "starter", "pro", "business", "agency", "enterprise"];
  const nextTier = tierOrder[tierOrder.indexOf(currentTier) + 1];

  if (!nextTier) {
    return "You're on our highest tier!";
  }

  const currentLimit = TIER_LIMITS[currentTier as keyof typeof TIER_LIMITS];
  const nextLimit = TIER_LIMITS[nextTier as keyof typeof TIER_LIMITS];

  return `Upgrade to ${nextTier} ($99/mo) to unlock ${nextLimit} campaigns/month`;
}

export function getCampaignUsagePercent(
  campaignsUsed: number,
  tier: string
): number {
  const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS];
  return Math.round((campaignsUsed / limit) * 100);
}

export const TIER_FEATURES = {
  free: {
    name: "Free",
    price: 0,
    campaignsPerMonth: 1,
    features: [
      "Basic content generation",
      "Email sequences",
      "Social captions",
      "Community support",
    ],
    limitations: [
      "1 campaign/month",
      "No video studio",
      "No advanced SEO",
      '"Made with ARIA" badge required',
    ],
  },
  starter: {
    name: "Starter",
    price: 49,
    campaignsPerMonth: 5,
    features: [
      "All Free features",
      "Video scripts",
      "SEO audits",
      "Email marketing (Resend)",
      "Social scheduling",
      "Brand Kit",
    ],
    limitations: ["No video rendering", "No DSP ads"],
  },
  pro: {
    name: "Pro",
    price: 98,
    campaignsPerMonth: 10,
    features: [
      "All Starter features",
      "Video studio (HeyGen)",
      "AEO audits",
      "DSP ads ($50 min)",
      "Competitor analysis",
      "API access",
      "2 team members",
    ],
    limitations: ["No white-label", "No client portal"],
  },
  business: {
    name: "Business",
    price: 196,
    campaignsPerMonth: 20,
    features: [
      "All Pro features",
      "Client collaboration",
      "White-label options",
      "5 team members",
      "Custom integrations",
    ],
    limitations: ["Limited support"],
  },
  agency: {
    name: "Agency",
    price: 392,
    campaignsPerMonth: 40,
    features: [
      "All Business features",
      "Unlimited team members",
      "Client portal",
      "Advanced analytics",
      "SLA support (4hr response)",
    ],
    limitations: [],
  },
  enterprise: {
    name: "Enterprise",
    price: 0, // Custom
    campaignsPerMonth: 1000,
    features: [
      "Everything in Agency",
      "Custom AI models",
      "Dedicated account manager",
      "Priority feature requests",
      "99.9% SLA",
    ],
    limitations: [],
  },
};
