import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Zap, TrendingUp, DollarSign, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Billing() {
  const [, navigate] = useLocation();
  const { data: billing, isLoading } = trpc.billing.subscription.useQuery();
  const { data: credits } = trpc.billing.credits.useQuery();

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
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">No active subscription. Upgrade to unlock all ARIA features.</p>
                    <div className="grid md:grid-cols-3 gap-3">
                      {[
                        { name: "Starter", price: "$49/mo", features: ["5,000 AI credits", "10 campaigns", "Basic analytics"] },
                        { name: "Growth", price: "$149/mo", features: ["25,000 AI credits", "Unlimited campaigns", "Advanced analytics", "DSP access"], highlight: true },
                        { name: "Scale", price: "$499/mo", features: ["100,000 AI credits", "Everything in Growth", "White-label", "Dedicated support"] },
                      ].map(plan => (
                        <div key={plan.name} className={`p-4 rounded-xl border ${plan.highlight ? "border-primary bg-primary/5" : "border-border bg-secondary/30"}`}>
                          <p className="font-bold text-foreground">{plan.name}</p>
                          <p className="text-2xl font-bold text-primary mt-1">{plan.price}</p>
                          <ul className="mt-3 space-y-1">
                            {plan.features.map(f => (
                              <li key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="text-primary">✓</span> {f}
                              </li>
                            ))}
                          </ul>
                          <Button size="sm" className={`w-full mt-3 ${plan.highlight ? "bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" : ""}`} variant={plan.highlight ? "default" : "outline"}>
                            Choose {plan.name}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

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
                  <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=How+can+I+get+more+AI+credits")}>
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
