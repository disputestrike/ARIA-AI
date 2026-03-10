import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, GitBranch, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Funnels() {
  const [, navigate] = useLocation();
  const { data: funnels, isLoading } = trpc.funnels.list.useQuery();

  return (
    <ARIALayout title="Conversion Funnels" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Build+a+conversion+funnel+for+my+product")}>
        <Sparkles className="w-3.5 h-3.5" /> Build Funnel
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : funnels && funnels.length > 0 ? (
          <div className="grid gap-3">
            {funnels.map(f => (
              <Card key={f.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-foreground">{f.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{f.conversionGoal ?? ""}</p>
                    </div>
                    <Badge variant={f.status === "active" ? "default" : "secondary"}>{f.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <GitBranch className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No funnels built</h3>
              <p className="text-sm text-muted-foreground mb-6">Ask ARIA to design a high-converting sales funnel</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Design+a+complete+sales+funnel+for+my+product")}>
                <Sparkles className="w-4 h-4" /> Build Funnel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
