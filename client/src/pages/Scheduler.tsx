import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar, Sparkles, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  published: "bg-green-500/10 text-green-400",
  failed: "bg-red-500/10 text-red-400",
  canceled: "bg-secondary text-muted-foreground",
};

export default function Scheduler() {
  const [, navigate] = useLocation();
  const { data: queue, isLoading, refetch } = trpc.scheduler.queue.useQuery();
  const cancelMutation = trpc.scheduler.cancel.useMutation({ onSuccess: () => { toast.success("Post canceled"); refetch(); } });

  return (
    <ARIALayout title="Content Scheduler" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/aria?q=Schedule+my+social+media+posts+for+this+week")}>
        <Sparkles className="w-3.5 h-3.5" /> Schedule Posts
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : queue && queue.length > 0 ? (
          <div className="grid gap-3">
            {queue.map(post => (
              <Card key={post.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-xs ${STATUS_COLORS[post.status] ?? ""}`}>{post.status}</Badge>
                        <span className="text-xs text-muted-foreground">{post.platform}</span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">Content #{post.contentId ?? "—"} on {post.platform}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Scheduled: {new Date(post.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                    {post.status === "pending" && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => cancelMutation.mutate({ id: post.id })}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No scheduled posts</h3>
              <p className="text-sm text-muted-foreground mb-6">Ask ARIA to schedule your social media content</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/aria?q=Create+a+social+media+posting+schedule+for+my+brand")}>
                <Sparkles className="w-4 h-4" /> Schedule Content
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
