import ARIALayout from "@/components/ARIALayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Users, DollarSign, Sparkles, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

const STAGE_COLORS: Record<string, string> = {
  prospecting: "bg-blue-500/10 text-blue-400",
  qualification: "bg-yellow-500/10 text-yellow-400",
  proposal: "bg-orange-500/10 text-orange-400",
  negotiation: "bg-purple-500/10 text-purple-400",
  closed_won: "bg-green-500/10 text-green-400",
  closed_lost: "bg-red-500/10 text-red-400",
};

export default function CRM() {
  const [, navigate] = useLocation();
  const { data: leads, isLoading: leadsLoading } = trpc.crm.leads.useQuery();
  const { data: deals, isLoading: dealsLoading } = trpc.crm.deals.useQuery();

  const openDeals = deals?.filter(d => d.stage !== "closed_won" && d.stage !== "closed_lost") ?? [];
  const totalValue = openDeals.reduce((sum, d) => sum + ((d.valueCents ?? 0) / 100), 0);

  return (
    <ARIALayout title="CRM" actions={
      <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90" onClick={() => navigate("/?q=Help+me+manage+my+leads+and+deals")}>
        <Sparkles className="w-3.5 h-3.5" /> Ask ARIA
      </Button>
    }>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: leads?.length ?? 0, icon: Users },
            { label: "Open Deals", value: openDeals.length, icon: TrendingUp },
            { label: "Pipeline Value", value: `$${totalValue.toLocaleString()}`, icon: DollarSign },
            { label: "Won Deals", value: deals?.filter(d => d.stage === "closed_won").length ?? 0, icon: TrendingUp },
          ].map(s => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="leads">
          <TabsList>
            <TabsTrigger value="leads">Leads ({leads?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="deals">Deals ({deals?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="mt-4 space-y-2">
            {leadsLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : leads && leads.length > 0 ? leads.map(lead => (
              <Card key={lead.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {(lead.firstName ?? "?").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{lead.firstName} {lead.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.email} {lead.company ? `· ${lead.company}` : ""}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{lead.status}</Badge>
                </CardContent>
              </Card>
            )) : (
              <Card className="bg-card border-border border-dashed">
                <CardContent className="p-8 text-center">
                  <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No leads yet. Ask ARIA to help you generate leads.</p>
                  <Button size="sm" className="mt-3 gap-2" onClick={() => navigate("/?q=Help+me+generate+leads+for+my+business")}>
                    <Sparkles className="w-3.5 h-3.5" /> Generate Leads
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="deals" className="mt-4 space-y-2">
            {dealsLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : deals && deals.length > 0 ? deals.map(deal => (
              <Card key={deal.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{deal.name}</p>
                    <p className="text-xs text-muted-foreground">${((deal.valueCents ?? 0) / 100).toLocaleString()}</p>
                  </div>
                  <Badge className={`text-xs ${STAGE_COLORS[deal.stage] ?? ""}`}>{deal.stage?.replace("_", " ")}</Badge>
                </CardContent>
              </Card>
            )) : (
              <Card className="bg-card border-border border-dashed">
                <CardContent className="p-8 text-center">
                  <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No deals yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ARIALayout>
  );
}
