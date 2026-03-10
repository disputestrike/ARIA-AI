import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Database, Sparkles, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

export default function Competitors() {
  const [, navigate] = useLocation();
  const { data: competitors, isLoading } = trpc.competitors.list.useQuery();

  return (
    <ARIALayout title="Competitor Intelligence" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/aria?q=Analyze+my+top+competitors")}>
        <Sparkles className="w-3.5 h-3.5" /> Analyze
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : competitors && competitors.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {competitors.map(c => (
              <Card key={c.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-foreground">{c.name}</h3>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </a>
                    )}
                  </div>
                  {c.positioning && <p className="text-sm text-muted-foreground">{c.positioning}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 gap-1 h-7" onClick={() => navigate(`/aria?q=Deep+dive+competitor+analysis+for+${c.name}`)}>
                      <Sparkles className="w-3 h-3" /> Deep Dive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <Database className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No competitor profiles</h3>
              <p className="text-sm text-muted-foreground mb-6">Ask ARIA to research and track your competitors</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/aria?q=Research+my+top+3+competitors+and+create+profiles")}>
                <Sparkles className="w-4 h-4" /> Research Competitors
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
