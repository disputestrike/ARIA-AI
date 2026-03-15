import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";

interface PricingTier {
  id: string;
  name: string;
  price: number | "custom";
  period: "month" | "custom";
  description: string;
  campaignsPerMonth: number | "unlimited";
  features: string[];
  highlight: boolean;
  cta: string;
  ctaAction: "free_trial" | "upgrade" | "contact_sales";
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "month",
    description: "Perfect for trying ARIA",
    campaignsPerMonth: 1,
    features: [
      "1 campaign per month",
      "Basic content generation (blog, social)",
      "Email sequences",
      "Community support",
      "No brand kit",
      '"Made with ARIA" badge on outputs',
    ],
    highlight: false,
    cta: "Start Free",
    ctaAction: "free_trial",
  },
  {
    id: "starter",
    name: "Starter",
    price: 49,
    period: "month",
    description: "For individual creators",
    campaignsPerMonth: 5,
    features: [
      "5 campaigns per month",
      "All content types",
      "SEO audit engine",
      "Video scripts",
      "Email marketing (Resend)",
      "Brand Kit",
      "Social scheduling",
      "Priority support",
    ],
    highlight: false,
    cta: "Start Free Trial",
    ctaAction: "free_trial",
  },
  {
    id: "pro",
    name: "Pro",
    price: 98,
    period: "month",
    description: "For growing teams",
    campaignsPerMonth: 10,
    features: [
      "10 campaigns per month",
      "Everything in Starter",
      "Video studio (HeyGen)",
      "AEO audits",
      "DSP advertising ($50 min)",
      "Competitor ad library",
      "2 team members",
      "API access",
    ],
    highlight: true,
    cta: "Start Free Trial",
    ctaAction: "free_trial",
  },
  {
    id: "business",
    name: "Business",
    price: 196,
    period: "month",
    description: "For agencies & brands",
    campaignsPerMonth: 20,
    features: [
      "20 campaigns per month",
      "Everything in Pro",
      "Client collaboration",
      "White-label options",
      "5 team members",
      "Custom integrations",
      "Dedicated support",
    ],
    highlight: false,
    cta: "Start Free Trial",
    ctaAction: "free_trial",
  },
  {
    id: "agency",
    name: "Agency",
    price: 392,
    period: "month",
    description: "For high-volume agencies",
    campaignsPerMonth: 40,
    features: [
      "40 campaigns per month",
      "Everything in Business",
      "Unlimited team members",
      "Client portal",
      "Advanced analytics",
      "SLA support (4hr response)",
    ],
    highlight: false,
    cta: "Start Free Trial",
    ctaAction: "free_trial",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "custom",
    period: "custom",
    description: "For large organizations",
    campaignsPerMonth: "unlimited",
    features: [
      "Unlimited campaigns",
      "Everything in Agency",
      "Unlimited team members",
      "Custom AI models",
      "Dedicated account manager",
      "Priority feature requests",
      "99.9% SLA",
    ],
    highlight: false,
    cta: "Contact Sales",
    ctaAction: "contact_sales",
  },
];

export function PricingTiersComponent() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const handleCTA = (tier: PricingTier) => {
    if (tier.ctaAction === "free_trial") {
      // Trigger free trial signup
      console.log(`Free trial for ${tier.name}`);
    } else if (tier.ctaAction === "upgrade") {
      // Trigger upgrade
      console.log(`Upgrade to ${tier.name}`);
    } else if (tier.ctaAction === "contact_sales") {
      // Trigger contact form
      console.log(`Contact sales for ${tier.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-slate-600 mb-8">
            Start free. Scale as you grow. Pay only for what you use.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                billingCycle === "monthly"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                billingCycle === "annual"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Annual (Save 20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {PRICING_TIERS.map(tier => (
            <Card
              key={tier.id}
              className={`p-8 border-0 shadow-lg transition transform hover:scale-105 flex flex-col ${
                tier.highlight
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-2 ring-blue-400"
                  : "bg-white"
              }`}
            >
              {/* Badge for highlighted tier */}
              {tier.highlight && (
                <Badge className="w-fit mb-4 bg-white text-blue-600 font-bold">
                  MOST POPULAR
                </Badge>
              )}

              {/* Tier Name */}
              <h3 className={`text-2xl font-bold mb-2 ${tier.highlight ? "text-white" : "text-slate-900"}`}>
                {tier.name}
              </h3>

              {/* Description */}
              <p className={`text-sm mb-6 ${tier.highlight ? "text-blue-100" : "text-slate-600"}`}>
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                {tier.price === "custom" ? (
                  <p className={`text-lg font-semibold ${tier.highlight ? "text-white" : "text-slate-900"}`}>
                    Custom pricing
                  </p>
                ) : (
                  <>
                    <p className={`text-4xl font-bold ${tier.highlight ? "text-white" : "text-slate-900"}`}>
                      ${tier.price}
                    </p>
                    <p className={`text-sm ${tier.highlight ? "text-blue-100" : "text-slate-600"}`}>
                      per month
                    </p>
                  </>
                )}
              </div>

              {/* Campaigns */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <p className={`font-semibold mb-1 ${tier.highlight ? "text-white" : "text-slate-900"}`}>
                  {typeof tier.campaignsPerMonth === "number"
                    ? `${tier.campaignsPerMonth} campaigns/month`
                    : "Unlimited campaigns"}
                </p>
                <p className={`text-xs ${tier.highlight ? "text-blue-100" : "text-slate-600"}`}>
                  {typeof tier.campaignsPerMonth === "number"
                    ? `$${(49 / tier.campaignsPerMonth).toFixed(2)}/campaign`
                    : "Build as much as you want"}
                </p>
              </div>

              {/* Features */}
              <div className="flex-1 mb-6">
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${tier.highlight ? "text-blue-50" : "text-slate-700"}`}>
                      <Check className={`w-5 h-5 flex-shrink-0 ${tier.highlight ? "text-white" : "text-green-600"}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleCTA(tier)}
                className={`w-full h-11 font-semibold flex items-center justify-center gap-2 ${
                  tier.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes, cancel your subscription anytime with no penalties.",
              },
              {
                q: "What if I need more campaigns?",
                a: "Purchase additional campaigns at overage rates (Starter $8, Pro $5, Business $3, Agency $1.50).",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, 30-day money-back guarantee if ARIA doesn't deliver.",
              },
              {
                q: "Can multiple people use one account?",
                a: "Yes! Team members vary by plan (Pro: 2, Business: 5, Agency: unlimited).",
              },
            ].map((faq, i) => (
              <Card key={i} className="p-6 border-0 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-700 text-sm">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
