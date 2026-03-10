import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Star, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Reviews() {
  const [, navigate] = useLocation();
  const { data: reviews, isLoading } = trpc.reviews.list.useQuery();

  return (
    <ARIALayout title="Reviews & Reputation" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Help+me+respond+to+my+reviews")}>
        <Sparkles className="w-3.5 h-3.5" /> AI Respond
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : reviews && reviews.length > 0 ? (
          <div className="grid gap-3">
            {reviews.map(r => (
              <Card key={r.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < (r.rating ?? 0) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{r.reviewerName ?? "Anonymous"}</span>
                        <Badge variant="outline" className="text-xs">{r.platform}</Badge>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">{r.content}</p>
                      {r.aiReply && <p className="text-xs text-muted-foreground mt-2 italic">AI Reply: {r.aiReply.substring(0, 100)}...</p>}
                    </div>
                    <Button size="sm" variant="outline" className="h-7 gap-1 flex-shrink-0" onClick={() => navigate(`/?q=Generate+a+professional+reply+to+this+review+${r.id}`)}>
                      <Sparkles className="w-3 h-3" /> Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No reviews tracked</h3>
              <p className="text-sm text-muted-foreground mb-6">Ask ARIA to monitor and respond to your reviews</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Set+up+review+monitoring+for+my+business")}>
                <Sparkles className="w-4 h-4" /> Monitor Reviews
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
