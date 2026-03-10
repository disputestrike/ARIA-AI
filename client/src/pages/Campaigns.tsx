import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Target, Plus, TrendingUp, Pause, Play, BarChart3, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  paused: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  draft: "bg-secondary text-muted-foreground border-border",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  archived: "bg-secondary text-muted-foreground border-border",
};

export default function Campaigns() {
  const [, navigate] = useLocation();
  const { data: campaigns, isLoading, refetch } = trpc.campaigns.list.useQuery();

  return (
    <ARIALayout
      title="Campaigns"
      actions={
        <Button
          size="sm"
          className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
          onClick={() => navigate("/aria?q=Build+me+a+new+marketing+campaign")}
        >
          <Sparkles className="w-3.5 h-3.5" /> Ask ARIA
        </Button>
      }
    >
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Campaigns", value: campaigns?.length ?? 0, icon: Target },
            { label: "Active", value: campaigns?.filter(c => c.status === "active").length ?? 0, icon: Play },
            { label: "Paused", value: campaigns?.filter(c => c.status === "paused").length ?? 0, icon: Pause },
            { label: "Completed", value: campaigns?.filter(c => c.status === "completed").length ?? 0, icon: BarChart3 },
          ].map(stat => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Campaign List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid gap-4">
            {campaigns.map(campaign => (
              <Card key={campaign.id} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{campaign.name}</h3>
                        <Badge className={`text-xs border ${STATUS_COLORS[campaign.status] ?? STATUS_COLORS.draft}`}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{campaign.objective}</p>
                      <div className="flex items-center gap-4 mt-2">
                        {campaign.startDate && (
                          <p className="text-xs text-muted-foreground">
                            Start: {new Date(campaign.startDate).toLocaleDateString()}
                          </p>
                        )}
                        {campaign.endDate && (
                          <p className="text-xs text-muted-foreground">
                            End: {new Date(campaign.endDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => navigate(`/aria?q=Analyze+campaign+${campaign.id}`)}
                      >
                        <TrendingUp className="w-3.5 h-3.5" /> Analyze
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No campaigns yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Ask ARIA to build your first marketing campaign
              </p>
              <Button
                className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
                onClick={() => navigate("/aria?q=Build+me+a+marketing+campaign")}
              >
                <Sparkles className="w-4 h-4" /> Ask ARIA to Create
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
