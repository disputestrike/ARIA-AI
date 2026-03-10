import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Palette, Sparkles, Image } from "lucide-react";
import { useLocation } from "wouter";

export default function Creatives() {
  const [, navigate] = useLocation();
  const { data: creatives, isLoading } = trpc.creatives.list.useQuery();

  return (
    <ARIALayout title="Ad Creatives" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Generate+ad+creatives+for+my+campaign")}>
        <Sparkles className="w-3.5 h-3.5" /> Generate Creative
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : creatives && creatives.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {creatives.map(c => (
              <Card key={c.id} className="bg-card border-border hover:border-primary/30 transition-colors overflow-hidden">
                <div className="aspect-square bg-secondary/30 flex items-center justify-center">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.type} className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                <CardContent className="p-2">
                  <p className="text-xs font-medium text-foreground truncate">{c.type}</p>
                  <p className="text-xs text-muted-foreground">{c.width && c.height ? `${c.width}x${c.height}` : ""}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <Palette className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No creatives yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Ask ARIA to generate ad creatives for your campaigns</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Generate+Facebook+and+Instagram+ad+creatives+for+my+product")}>
                <Sparkles className="w-4 h-4" /> Generate Creatives
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
