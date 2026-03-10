import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, Settings as SettingsIcon, Bell, Globe, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const { data: integrationsList } = trpc.settings.integrations.useQuery();
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => toast.success("Settings saved"),
    onError: (e) => toast.error("Failed to save: " + e.message),
  });

  const [timezone, setTimezone] = useState("UTC");
  const [emailNotifs, setEmailNotifs] = useState(true);

  useEffect(() => {
    if (settings) {
      setTimezone(settings.timezone ?? "UTC");
      setEmailNotifs(settings.emailNotifications ?? true);
    }
  }, [settings]);

  const save = () => updateMutation.mutate({ timezone, emailNotifications: emailNotifs });

  return (
    <ARIALayout title="Settings">
      <div className="p-6 max-w-2xl space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="UTC" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" /> Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {integrationsList && integrationsList.length > 0 ? (
                  integrationsList.map(i => (
                    <div key={i.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">{i.platform}</p>
                        <p className="text-xs text-muted-foreground">{i.isActive ? "Active" : "Inactive"}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${i.isActive ? "bg-green-500" : "bg-muted-foreground"}`} />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No integrations configured yet.</p>
                )}
              </CardContent>
            </Card>

            <Button onClick={save} disabled={updateMutation.isPending} className="bg-gradient-to-r from-primary to-chart-2 hover:opacity-90">
              {updateMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : "Save Settings"}
            </Button>
          </>
        )}
      </div>
    </ARIALayout>
  );
}
