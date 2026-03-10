import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Target, FileText, Mail, Globe, Video, Palette, TestTube,
  GitBranch, Zap, BarChart3, Search, Database, Users,
  ExternalLink, Copy, Edit3, Trash2, Play, Eye, Download,
  CheckCircle, XCircle, Clock, TrendingUp, DollarSign,
  RefreshCw, Share2, Star, Calendar, ArrowRight
} from "lucide-react";

interface ARIADrawerProps {
  open: boolean;
  type: string | null;
  data: Record<string, unknown> | null;
  onClose: () => void;
  onSendMessage: (msg: string) => void;
}

// ─── Campaign Drawer ──────────────────────────────────────────────────────────
function CampaignDrawer({ data, onSendMessage }: { data: Record<string, unknown>; onSendMessage: (m: string) => void }) {
  const { data: campaigns } = trpc.campaigns.list.useQuery();
  const campaign = campaigns?.find(c => c.id === data.recordId) ?? campaigns?.[0];

  return (
    <div className="space-y-4">
      {campaign ? (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{campaign.name}</h3>
              <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                {campaign.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{campaign.objective}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="font-semibold text-foreground">{campaign.status}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground">Platform</p>
              <p className="font-semibold text-foreground">{campaign.objective ?? "—"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 gap-1" onClick={() => onSendMessage(`Optimize campaign ${campaign.id}`)}>
              <TrendingUp className="w-3.5 h-3.5" /> Optimize
            </Button>
            <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => onSendMessage(`Generate report for campaign ${campaign.id}`)}>
              <BarChart3 className="w-3.5 h-3.5" /> Report
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No campaign data</p>
          <Button size="sm" className="mt-3" onClick={() => onSendMessage("Build me a new campaign")}>
            Create Campaign
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Content Drawer ───────────────────────────────────────────────────────────
function ContentDrawer({ data, onSendMessage }: { data: Record<string, unknown>; onSendMessage: (m: string) => void }) {
  const { data: contents } = trpc.content.list.useQuery({});
  const content = contents?.find(c => c.id === data.recordId) ?? contents?.[0];

  return (
    <div className="space-y-4">
      {content ? (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{content.title}</h3>
              <Badge variant="outline">{content.type}</Badge>
              <Badge variant={content.status === "published" ? "default" : "secondary"}>
                {content.status}
              </Badge>
            </div>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 max-h-48 overflow-y-auto">
            <p className="text-sm text-foreground whitespace-pre-wrap">{content.body}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => {
              navigator.clipboard.writeText(content.body ?? "");
              toast.success("Copied to clipboard");
            }}>
              <Copy className="w-3.5 h-3.5" /> Copy
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => onSendMessage(`Improve this content: ${content.title}`)}>
              <RefreshCw className="w-3.5 h-3.5" /> Improve
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => onSendMessage(`Repurpose content ${content.id} for social media`)}>
              <Share2 className="w-3.5 h-3.5" /> Repurpose
            </Button>
            <Button size="sm" className="gap-1" onClick={() => onSendMessage(`Publish content ${content.id}`)}>
              <Play className="w-3.5 h-3.5" /> Publish
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No content yet</p>
          <Button size="sm" className="mt-3" onClick={() => onSendMessage("Write me a blog post about my product")}>
            Generate Content
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Email Drawer ─────────────────────────────────────────────────────────────
function EmailDrawer({ data, onSendMessage }: { data: Record<string, unknown>; onSendMessage: (m: string) => void }) {
  const { data: emails } = trpc.email.sequences.useQuery();
  const email = emails?.find((e: { id: number }) => e.id === data.recordId) ?? emails?.[0];

  return (
    <div className="space-y-4">
      {email ? (
        <>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{email.name}</h3>
            {email.trigger && <p className="text-sm text-muted-foreground">Trigger: {email.trigger}</p>}
            <Badge variant={email.isActive ? "default" : "secondary"}>{email.isActive ? "Active" : "Inactive"}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Status", value: email.isActive ? "Active" : "Inactive" },
              { label: "Trigger", value: email.trigger ?? "—" },
              { label: "Created", value: new Date(email.createdAt).toLocaleDateString() },
            ].map(stat => (
              <div key={stat.label} className="p-2 rounded-lg bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-semibold text-sm text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 gap-1" onClick={() => onSendMessage(`Send email campaign ${email.id}`)}>
              <Mail className="w-3.5 h-3.5" /> Send
            </Button>
            <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => onSendMessage(`Improve email subject line for campaign ${email.id}`)}>
              <Edit3 className="w-3.5 h-3.5" /> Improve
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No email campaigns</p>
          <Button size="sm" className="mt-3" onClick={() => onSendMessage("Build an email campaign for my product launch")}>
            Create Email
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Landing Page Drawer ──────────────────────────────────────────────────────
function LandingPageDrawer({ data, onSendMessage }: { data: Record<string, unknown>; onSendMessage: (m: string) => void }) {
  const { data: pages } = trpc.landingPages.list.useQuery();
  const page = pages?.find(p => p.id === data.recordId) ?? pages?.[0];

  return (
    <div className="space-y-4">
      {page ? (
        <>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{page.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant={page.isPublished ? "default" : "secondary"}>
                {page.isPublished ? "Published" : "Draft"}
              </Badge>
              {page.slug && (
                <a
                  href={`/p/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  /p/{page.slug} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-semibold text-foreground">{page.isPublished ? "Published" : "Draft"}</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="font-semibold text-foreground">{new Date(page.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 gap-1" onClick={() => window.open(`/p/${page.slug}`, "_blank")}>
              <Eye className="w-3.5 h-3.5" /> Preview
            </Button>
            <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => onSendMessage(`Optimize landing page ${page.id} for conversions`)}>
              <TrendingUp className="w-3.5 h-3.5" /> Optimize
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No landing pages</p>
          <Button size="sm" className="mt-3" onClick={() => onSendMessage("Build a landing page for my offer")}>
            Create Page
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── DSP Drawer ───────────────────────────────────────────────────────────────
function DSPDrawer({ data, onSendMessage }: { data: Record<string, unknown>; onSendMessage: (m: string) => void }) {
  const { data: dspData } = trpc.dsp.campaigns.useQuery();
  const { data: wallet } = trpc.dsp.wallet.useQuery();

  return (
    <div className="space-y-4">
      {wallet && (
        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
          <p className="text-xs text-muted-foreground mb-1">DSP Wallet Balance</p>
          <p className="text-2xl font-bold text-primary">
            ${((wallet.balanceCents ?? 0) / 100).toFixed(2)}
          </p>
          <Button size="sm" className="mt-2 w-full gap-1" onClick={() => onSendMessage("Add funds to my DSP wallet")}>
            <DollarSign className="w-3.5 h-3.5" /> Add Funds
          </Button>
        </div>
      )}
      {dspData && dspData.length > 0 ? (
        <div className="space-y-2">
          {dspData.slice(0, 5).map((campaign) => (
            <div key={campaign.id} className="p-3 rounded-lg bg-secondary/30 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{campaign.name}</p>
                <p className="text-xs text-muted-foreground">{campaign.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">${((campaign.dailyBudgetCents ?? 0) / 100).toFixed(2)}/day</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No DSP campaigns</p>
          <Button size="sm" className="mt-3" onClick={() => onSendMessage("Launch a DSP programmatic ad campaign")}>
            Launch Campaign
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Analytics Drawer ─────────────────────────────────────────────────────────
function AnalyticsDrawer({ onSendMessage }: { onSendMessage: (m: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Impressions", value: "—", icon: Eye },
          { label: "Total Clicks", value: "—", icon: TrendingUp },
          { label: "Total Spend", value: "—", icon: DollarSign },
          { label: "Conversions", value: "—", icon: CheckCircle },
        ].map(stat => (
          <div key={stat.label} className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-1.5 mb-1">
              <stat.icon className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <p className="font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
      <Button className="w-full gap-1" onClick={() => onSendMessage("Show me detailed analytics for this month")}>
        <BarChart3 className="w-4 h-4" /> Full Analytics Report
      </Button>
    </div>
  );
}

// ─── SEO Drawer ───────────────────────────────────────────────────────────────
function SEODrawer({ data, onSendMessage }: { data: Record<string, unknown>; onSendMessage: (m: string) => void }) {
  const { data: audits } = trpc.seo.audits.useQuery();
  const audit = audits?.[0];

  return (
    <div className="space-y-4">
      {audit ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{audit.url}</h3>
              <p className="text-xs text-muted-foreground">{new Date(audit.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{audit.score ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
          </div>
          <Button className="w-full gap-1" onClick={() => onSendMessage(`Run a new SEO audit for ${audit.url}`)}>
            <RefreshCw className="w-4 h-4" /> Re-audit
          </Button>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No SEO audits</p>
          <Button size="sm" className="mt-3" onClick={() => onSendMessage("Run an SEO audit for my website")}>
            Run Audit
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Competitor Drawer ────────────────────────────────────────────────────────
function CompetitorDrawer({ onSendMessage }: { onSendMessage: (m: string) => void }) {
  const { data: competitors } = trpc.competitors.list.useQuery();

  return (
    <div className="space-y-4">
      {competitors && competitors.length > 0 ? (
        <div className="space-y-2">
          {competitors.map(c => (
            <div key={c.id} className="p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
              <Badge variant="outline" className="text-xs">Competitor</Badge>
            </div>
            {c.url && (
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                {c.url} <ExternalLink className="w-3 h-3" />
              </a>
            )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No competitor profiles</p>
        </div>
      )}
      <Button className="w-full gap-1" onClick={() => onSendMessage("Analyze my top competitors")}>
        <Database className="w-4 h-4" /> Analyze Competitors
      </Button>
    </div>
  );
}

// ─── CRM Drawer ───────────────────────────────────────────────────────────────
function CRMDrawer({ onSendMessage }: { onSendMessage: (m: string) => void }) {
  const { data: leads } = trpc.crm.leads.useQuery();
  const { data: deals } = trpc.crm.deals.useQuery();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">Total Leads</p>
          <p className="text-2xl font-bold text-foreground">{leads?.length ?? 0}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground">Open Deals</p>
          <p className="text-2xl font-bold text-foreground">{deals?.filter(d => d.stage !== "closed_won" && d.stage !== "closed_lost").length ?? 0}</p>
        </div>
      </div>
      {leads && leads.slice(0, 5).map(lead => (
        <div key={lead.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {(lead.firstName ?? "?").charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{lead.firstName} {lead.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
          </div>
          <Badge variant="outline" className="text-xs">{lead.status}</Badge>
        </div>
      ))}
      <Button className="w-full gap-1" onClick={() => onSendMessage("Show me my full CRM pipeline")}>
        <Users className="w-4 h-4" /> Full CRM View
      </Button>
    </div>
  );
}

// ─── Report Drawer ────────────────────────────────────────────────────────────
function ReportDrawer({ data, onSendMessage }: { data: Record<string, unknown>; onSendMessage: (m: string) => void }) {
  const { data: reports } = trpc.reports.list.useQuery();
  const report = reports?.find(r => r.id === data.recordId) ?? reports?.[0];

  return (
    <div className="space-y-4">
      {report ? (
        <>
          <div>
            <h3 className="font-semibold text-foreground">{report.name}</h3>
            <p className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            {report.shareToken && (
              <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => window.open(`/report/${report.shareToken}`, "_blank")}>
                <ExternalLink className="w-3.5 h-3.5" /> Share
              </Button>
            )}
            <Button size="sm" className="flex-1 gap-1" onClick={() => onSendMessage("Generate a new performance report")}>
              <RefreshCw className="w-3.5 h-3.5" /> New Report
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No reports yet</p>
          <Button size="sm" className="mt-3" onClick={() => onSendMessage("Generate a marketing performance report")}>
            Generate Report
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Drawer Type Map ──────────────────────────────────────────────────────────
const DRAWER_CONFIG: Record<string, { title: string; icon: React.ElementType; component: React.ComponentType<{ data: Record<string, unknown>; onSendMessage: (m: string) => void }> }> = {
  campaign: { title: "Campaign", icon: Target, component: CampaignDrawer },
  content: { title: "Content", icon: FileText, component: ContentDrawer },
  email: { title: "Email Campaign", icon: Mail, component: EmailDrawer },
  landingPage: { title: "Landing Page", icon: Globe, component: LandingPageDrawer },
  dsp: { title: "DSP Advertising", icon: Zap, component: DSPDrawer },
  analytics: { title: "Analytics", icon: BarChart3, component: AnalyticsDrawer },
  seo: { title: "SEO Audit", icon: Search, component: SEODrawer },
  competitor: { title: "Competitor Intelligence", icon: Database, component: CompetitorDrawer },
  crm: { title: "CRM", icon: Users, component: CRMDrawer },
  report: { title: "Report", icon: BarChart3, component: ReportDrawer },
};

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export default function ARIADrawer({ open, type, data, onClose, onSendMessage }: ARIADrawerProps) {
  const config = type ? DRAWER_CONFIG[type] : null;
  if (!config) return null;

  const Icon = config.icon;
  const DrawerContent = config.component;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="w-96 sm:w-[440px] flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            {config.title}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="px-6 py-4">
            <DrawerContent data={data ?? {}} onSendMessage={(msg) => { onSendMessage(msg); onClose(); }} />
          </div>
        </ScrollArea>
        <div className="px-6 py-4 border-t border-border flex-shrink-0">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => { onSendMessage(`Tell me more about ${config.title.toLowerCase()}`); onClose(); }}
          >
            Ask ARIA about this <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
