import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, TestTube, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function ABTests() {
  const [, navigate] = useLocation();
  const { data: tests, isLoading } = trpc.abTests.list.useQuery();

  return (
    <ARIALayout title="A/B Tests" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Set+up+an+A/B+test+for+my+landing+page")}>
        <Sparkles className="w-3.5 h-3.5" /> Create Test
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : tests && tests.length > 0 ? (
          <div className="grid gap-3">
            {tests.map(t => (
              <Card key={t.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{t.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Type: {t.type}</p>
                    </div>
                    <Badge variant={t.status === "running" ? "default" : "secondary"}>{t.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <TestTube className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No A/B tests running</h3>
              <p className="text-sm text-muted-foreground mb-6">Ask ARIA to design and run A/B tests for your campaigns</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Design+an+A/B+test+for+my+email+subject+lines")}>
                <Sparkles className="w-4 h-4" /> Create A/B Test
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
