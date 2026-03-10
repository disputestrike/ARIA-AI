import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3, TrendingUp, Eye, MousePointer, DollarSign, Target, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Analytics() {
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = trpc.analytics.overview.useQuery({});

  const metrics = [
    { label: "Impressions", value: stats?.impressions?.toLocaleString() ?? "0", icon: Eye, color: "text-blue-400" },
    { label: "Clicks", value: stats?.clicks?.toLocaleString() ?? "0", icon: MousePointer, color: "text-green-400" },
    { label: "Conversions", value: stats?.conversions?.toLocaleString() ?? "0", icon: Target, color: "text-purple-400" },
    { label: "Total Spend", value: `$${(stats?.spend ?? 0).toFixed(2)}`, icon: DollarSign, color: "text-orange-400" },
    { label: "Revenue", value: `$${(stats?.revenue ?? 0).toFixed(2)}`, icon: TrendingUp, color: "text-primary" },
    { label: "CTR", value: stats?.ctr ?? "0%", icon: BarChart3, color: "text-pink-400" },
    { label: "ROAS", value: stats?.roas ?? "0", icon: TrendingUp, color: "text-yellow-400" },
  ];

  return (
    <ARIALayout title="Analytics" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Generate+a+detailed+analytics+report")}>
        <Sparkles className="w-3.5 h-3.5" /> AI Report
      </Button>
    }>
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map(m => (
                <Card key={m.label} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <m.icon className={`w-4 h-4 ${m.color}`} />
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{m.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground">AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Ask ARIA to analyze your performance data and get actionable recommendations.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "What's my best performing campaign?",
                    "How can I improve my CTR?",
                    "Where should I allocate more budget?",
                    "Show me weekly trends",
                  ].map(q => (
                    <Button key={q} size="sm" variant="outline" className="text-xs h-7" onClick={() => navigate(`/?q=${encodeURIComponent(q)}`)}>
                      {q}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ARIALayout>
  );
}
