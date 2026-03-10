import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap, DollarSign, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function DSP() {
  const [, navigate] = useLocation();
  const { data: wallet } = trpc.dsp.wallet.useQuery();
  const { data: campaigns, isLoading } = trpc.dsp.campaigns.useQuery();

  return (
    <ARIALayout title="DSP Advertising" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Launch+a+programmatic+DSP+ad+campaign")}>
        <Sparkles className="w-3.5 h-3.5" /> Launch Campaign
      </Button>
    }>
      <div className="p-6 space-y-6">
        {/* Wallet */}
        <Card className="bg-gradient-to-br from-primary/10 to-chart-2/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">DSP Wallet Balance</p>
                <p className="text-3xl font-bold text-foreground">${((wallet?.balanceCents ?? 0) / 100).toFixed(2)}</p>
              </div>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Add+funds+to+my+DSP+wallet")}>
                <DollarSign className="w-4 h-4" /> Add Funds
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid gap-3">
            {campaigns.map(c => (
              <Card key={c.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{c.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ${((c.dailyBudgetCents ?? 0) / 100).toFixed(2)}/day · ${((c.totalBudgetCents ?? 0) / 100).toFixed(2)} total
                      </p>
                    </div>
                    <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No DSP campaigns</h3>
              <p className="text-sm text-muted-foreground mb-6">Launch programmatic advertising campaigns with ARIA</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Launch+a+DSP+programmatic+ad+campaign+for+my+product")}>
                <Sparkles className="w-4 h-4" /> Launch DSP Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
