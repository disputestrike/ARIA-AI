import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Zap, Sparkles, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

const PLANS = [
  { tier: "starter", name: "Starter", price: "$49", period: "/mo", features: ["500 AI messages/mo", "5 campaigns", "50 content pieces", "3 landing pages", "1 team member"] },
  { tier: "professional", name: "Professional", price: "$99", period: "/mo", highlight: true, features: ["2,000 AI messages/mo", "25 campaigns", "500 content pieces", "20 landing pages", "5 team members", "DSP access"] },
  { tier: "business", name: "Business", price: "$199", period: "/mo", features: ["10,000 AI messages/mo", "100 campaigns", "2,000 content pieces", "100 landing pages", "15 team members", "DSP $5k budget"] },
  { tier: "agency", name: "Agency", price: "$299", period: "/mo", features: ["Unlimited AI messages", "Unlimited campaigns", "Unlimited content", "Unlimited landing pages", "25 team members", "Unlimited DSP"] },
];

export default function Billing() {
  const [, navigate] = useLocation();
  const { data: billing, isLoading } = trpc.billing.subscription.useQuery();
  const { data: credits } = trpc.billing.credits.useQuery();
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const checkoutMutation = trpc.billing.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecting to Stripe checkout...");
        window.open(data.url, "_blank");
      } else {
        toast.error("Could not create checkout session. Configure Stripe Price IDs in Settings → Payment.");
      }
      setCheckingOut(null);
    },
    onError: (err) => {
      toast.error(err.message || "Checkout failed. Check Settings → Payment for Stripe configuration.");
      setCheckingOut(null);
    },
  });

  const handleChoosePlan = (tier: string) => {
    setCheckingOut(tier);
    checkoutMutation.mutate({ tier, origin: window.location.origin });
  };

  return (
    <ARIALayout title="Billing & Credits">
      <div className="p-6 max-w-3xl space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Subscription */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {billing ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground capitalize">{billing.tier} Plan</p>
                        <p className="text-sm text-muted-foreground">
                          {billing.status === "active" ? "Active" : billing.status}
                          {billing.currentPeriodEnd && ` · Renews ${new Date(billing.currentPeriodEnd).toLocaleDateString()}`}
                        </p>
                      </div>
                      <Badge variant={billing.status === "active" ? "default" : "secondary"}>
                        {billing.status}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active subscription. Choose a plan below to unlock all ARIA features.</p>
                )}
              </CardContent>
            </Card>

            {/* Plans Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map(plan => (
                <div
                  key={plan.tier}
                  className={`p-5 rounded-xl border flex flex-col gap-3 ${'highlight' in plan && plan.highlight ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-card"}`}
                >
                  {'highlight' in plan && plan.highlight && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit">Most Popular</span>
                  )}
                  <div>
                    <p className="font-bold text-foreground">{plan.name}</p>
                    <p className="text-2xl font-bold text-primary mt-0.5">
                      {plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                    </p>
                  </div>
                  <ul className="space-y-1.5 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    className={`w-full mt-1 ${'highlight' in plan && plan.highlight ? "bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" : ""}`}
                    variant={'highlight' in plan && plan.highlight ? "default" : "outline"}
                    disabled={checkingOut === plan.tier || billing?.tier === plan.tier}
                    onClick={() => handleChoosePlan(plan.tier)}
                  >
                    {checkingOut === plan.tier ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Processing...</>
                    ) : billing?.tier === plan.tier ? (
                      "Current Plan"
                    ) : (
                      `Choose ${plan.name}`
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {/* Credits */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> AI Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{credits?.balance?.toLocaleString() ?? "0"}</p>
                    <p className="text-sm text-muted-foreground">Credits remaining</p>
                  </div>
                  <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/aria?q=How+can+I+get+more+AI+credits")}>
                    <Sparkles className="w-3.5 h-3.5" /> Get More Credits
                  </Button>
                </div>
                {credits?.history && credits.history.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent Transactions</p>
                    {credits.history.slice(0, 5).map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                        <div>
                          <p className="text-sm text-foreground">{t.description ?? t.type}</p>
                          <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className={`text-sm font-semibold ${t.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                          {t.amount > 0 ? "+" : ""}{t.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ARIALayout>
  );
}
