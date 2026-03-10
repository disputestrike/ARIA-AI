import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Video as VideoIcon, Sparkles, Play } from "lucide-react";
import { useLocation } from "wouter";

export default function Video() {
  const [, navigate] = useLocation();
  const { data: videos, isLoading } = trpc.video.list.useQuery();

  return (
    <ARIALayout title="Video Ads" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Create+a+video+ad+script+for+my+product")}>
        <Sparkles className="w-3.5 h-3.5" /> Create Video Ad
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : videos && videos.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {videos.map(v => (
              <Card key={v.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-12 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                      <Play className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{v.hook?.substring(0, 40) ?? v.platform}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.platform} · {v.duration ? `${v.duration}s` : "—"}</p>
                      <Badge variant={v.status === "completed" ? "default" : "secondary"} className="mt-1 text-xs">{v.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <VideoIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No video ads</h3>
              <p className="text-sm text-muted-foreground mb-6">Ask ARIA to write and produce video ad scripts</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Write+a+30-second+video+ad+script+for+my+product")}>
                <Sparkles className="w-4 h-4" /> Create Video Ad
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
