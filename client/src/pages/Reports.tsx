import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, TrendingUp, Sparkles, ExternalLink, Download } from "lucide-react";
import { useLocation } from "wouter";

export default function Reports() {
  const [, navigate] = useLocation();
  const { data: reports, isLoading } = trpc.reports.list.useQuery();

  return (
    <ARIALayout title="Reports" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Generate+a+comprehensive+marketing+performance+report")}>
        <Sparkles className="w-3.5 h-3.5" /> Generate Report
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : reports && reports.length > 0 ? (
          <div className="grid gap-3">
            {reports.map(r => (
              <Card key={r.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{r.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {r.shareToken && (
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => window.open(`/report/${r.shareToken}`, "_blank")}>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No reports yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Ask ARIA to generate detailed marketing performance reports</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Generate+a+full+marketing+performance+report+for+this+month")}>
                <Sparkles className="w-4 h-4" /> Generate Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
