import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Shield, Sparkles, UserPlus } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Team() {
  const [, navigate] = useLocation();
  const { data: members, isLoading } = trpc.team.members.useQuery();

  return (
    <ARIALayout title="Team" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => toast.info("Team invitations coming soon")}>
        <UserPlus className="w-3.5 h-3.5" /> Invite Member
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : members && members.length > 0 ? (
          <div className="grid gap-3">
            {members.map(m => (
              <Card key={m.id} className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                      {m.name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <Badge variant={m.role === "admin" ? "default" : "secondary"} className="text-xs capitalize">{m.role}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Just you for now</h3>
              <p className="text-sm text-muted-foreground mb-6">Invite team members to collaborate on campaigns</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => toast.info("Team invitations coming soon")}>
                <UserPlus className="w-4 h-4" /> Invite Team Members
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
