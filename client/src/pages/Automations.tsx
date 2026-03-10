import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Workflow, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Automations() {
  const [, navigate] = useLocation();
  const { data: automations, isLoading, refetch } = trpc.automations.list.useQuery();
  const toggleMutation = trpc.automations.toggle.useMutation({ onSuccess: () => { toast.success("Automation updated"); refetch(); } });

  return (
    <ARIALayout title="Automations" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/aria?q=Create+a+marketing+automation+workflow")}>
        <Sparkles className="w-3.5 h-3.5" /> Create Automation
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : automations && automations.length > 0 ? (
          <div className="grid gap-3">
            {automations.map(a => (
              <Card key={a.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{a.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Trigger: {String(a.trigger ?? "")}</p>
                    </div>
                    <Switch
                      checked={a.isActive}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: a.id, isActive: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <Workflow className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No automations set up</h3>
              <p className="text-sm text-muted-foreground mb-6">Ask ARIA to create automated marketing workflows</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/aria?q=Set+up+automated+email+sequences+for+new+leads")}>
                <Sparkles className="w-4 h-4" /> Create Automation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
