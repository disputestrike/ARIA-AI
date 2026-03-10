import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Sparkles, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

export default function SEO() {
  const [, navigate] = useLocation();
  const { data: audits, isLoading } = trpc.seo.audits.useQuery();

  return (
    <ARIALayout title="SEO Audits" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/aria?q=Run+an+SEO+audit+for+my+website")}>
        <Sparkles className="w-3.5 h-3.5" /> Run Audit
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : audits && audits.length > 0 ? (
          <div className="grid gap-3">
            {audits.map(a => (
              <Card key={a.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.url}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{a.score ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => navigate(`/aria?q=Improve+SEO+for+${a.url}`)}>
                      <Sparkles className="w-3 h-3" /> Fix
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No SEO audits</h3>
              <p className="text-sm text-muted-foreground mb-6">Run an AI-powered SEO audit to improve your rankings</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/aria?q=Run+a+full+SEO+audit+for+my+website")}>
                <Sparkles className="w-4 h-4" /> Run SEO Audit
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
