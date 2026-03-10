import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mail, Sparkles, Send, Eye } from "lucide-react";
import { useLocation } from "wouter";

export default function Email() {
  const [, navigate] = useLocation();
  const { data: emails, isLoading } = trpc.email.sequences.useQuery();

  return (
    <ARIALayout title="Email Campaigns" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Build+an+email+campaign")}>
        <Sparkles className="w-3.5 h-3.5" /> Create Campaign
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : emails && emails.length > 0 ? (
          <div className="grid gap-3">
            {emails.map((e: { id: number; name: string; isActive: boolean; trigger: string | null; createdAt: Date }) => (
              <Card key={e.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{e.name}</h3>
                        <Badge variant={e.isActive ? "default" : "secondary"} className="text-xs">{e.isActive ? "Active" : "Inactive"}</Badge>
                      </div>
                      {e.trigger && <p className="text-sm text-muted-foreground">Trigger: {e.trigger}</p>}
                      <p className="text-xs text-muted-foreground mt-1">Created: {new Date(e.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" className="gap-1 h-7" onClick={() => navigate(`/?q=Send+email+campaign+${e.id}`)}>
                        <Send className="w-3 h-3" /> Send
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
              <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No email campaigns</h3>
              <p className="text-sm text-muted-foreground mb-6">Ask ARIA to build your first email campaign</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Build+an+email+campaign+for+my+product+launch")}>
                <Sparkles className="w-4 h-4" /> Create Email Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
