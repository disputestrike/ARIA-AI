import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, FileText, Search, Sparkles, Copy, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Content() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const { data: contents, isLoading } = trpc.content.list.useQuery({ search: search || undefined });

  const TYPE_COLORS: Record<string, string> = {
    blog: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    social: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    email: "bg-green-500/10 text-green-400 border-green-500/20",
    ad: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    landing: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  };

  return (
    <ARIALayout
      title="Content"
      actions={
        <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/aria?q=Write+me+a+blog+post")}>
          <Sparkles className="w-3.5 h-3.5" /> Create Content
        </Button>
      }
    >
      <div className="p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : contents && contents.length > 0 ? (
          <div className="grid gap-3">
            {contents.map(c => (
              <Card key={c.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{c.title}</h3>
                        <Badge className={`text-xs border ${TYPE_COLORS[c.type] ?? "bg-secondary text-muted-foreground border-border"}`}>{c.type}</Badge>
                        <Badge variant="outline" className="text-xs">{c.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{c.body?.substring(0, 120)}...</p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { navigator.clipboard.writeText(c.body ?? ""); toast.success("Copied!"); }}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate(`/aria?q=Improve+content+${c.id}`)}>
                        <RefreshCw className="w-3.5 h-3.5" />
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
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No content yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Ask ARIA to write content for you</p>
              <Button className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/aria?q=Write+a+blog+post+about+my+product")}>
                <Sparkles className="w-4 h-4" /> Generate Content
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ARIALayout>
  );
}
