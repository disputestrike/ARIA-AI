import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, BookOpen, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Templates() {
  const [, navigate] = useLocation();
  const { data: templates, isLoading } = trpc.templates.list.useQuery();

  return (
    <ARIALayout title="Templates" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Create+a+reusable+marketing+template")}>
        <Sparkles className="w-3.5 h-3.5" /> Create Template
      </Button>
    }>
      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : templates && templates.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map(t => (
              <Card key={t.id} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{t.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">{t.type}</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="mt-3 w-full gap-1 h-7" onClick={() => navigate(`/?q=Use+template+${t.id}+to+create+content`)}>
                    <Sparkles className="w-3 h-3" /> Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No templates saved</h3>
              <p className="text-sm text-muted-foreground mb-6">Ask ARIA to create reusable templates for your marketing</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Create+email+and+social+media+templates+for+my+brand")}>
                <Sparkles className="w-4 h-4" /> Create Templates
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
