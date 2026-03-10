import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Layers, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Brand() {
  const [, navigate] = useLocation();
  const { data: kit, isLoading } = trpc.brand.kit.useQuery();
  const { data: voices } = trpc.brand.voices.useQuery();
  const updateKit = trpc.brand.updateKit.useMutation({ onSuccess: () => toast.success("Brand kit saved") });

  const [form, setForm] = useState({ name: "", primaryColor: "#7c3aed", secondaryColor: "#06b6d4", fontPrimary: "Inter" });

  useEffect(() => {
    if (kit) setForm({ name: kit.name ?? "", primaryColor: kit.primaryColor ?? "#7c3aed", secondaryColor: kit.secondaryColor ?? "#06b6d4", fontPrimary: (kit as Record<string, unknown>).fontHeading as string ?? "Inter" });
  }, [kit]);

  return (
    <ARIALayout title="Brand Kit" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/aria?q=Help+me+build+my+brand+identity")}>
        <Sparkles className="w-3.5 h-3.5" /> Ask ARIA
      </Button>
    }>
      <div className="p-6 max-w-2xl space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> Brand Identity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Brand Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <input type="color" value={form.primaryColor} onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))} className="w-10 h-9 rounded cursor-pointer border border-border" />
                      <Input value={form.primaryColor} onChange={e => setForm(p => ({ ...p, primaryColor: e.target.value }))} className="font-mono" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <input type="color" value={form.secondaryColor} onChange={e => setForm(p => ({ ...p, secondaryColor: e.target.value }))} className="w-10 h-9 rounded cursor-pointer border border-border" />
                      <Input value={form.secondaryColor} onChange={e => setForm(p => ({ ...p, secondaryColor: e.target.value }))} className="font-mono" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2"><Label>Primary Font</Label><Input value={form.fontPrimary} onChange={e => setForm(p => ({ ...p, fontPrimary: e.target.value }))} /></div>
                <Button onClick={() => updateKit.mutate(form)} disabled={updateKit.isPending} className="bg-gradient-to-r from-primary to-chart-2 hover:opacity-90">
                  {updateKit.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Brand Kit
                </Button>
              </CardContent>
            </Card>

            {voices && voices.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="text-sm">Brand Voices</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {voices.map(v => (
                    <div key={v.id} className="p-3 rounded-lg bg-secondary/30">
                      <p className="text-sm font-medium text-foreground">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.toneProfile ?? v.formalityLevel ?? ""}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </ARIALayout>
  );
}
