import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Sparkles, Send, Mic, MicOff, Plus, ChevronLeft, ChevronRight,
  MessageSquare, Trash2, Settings, CreditCard, Users, BarChart3,
  FileText, Mail, Globe, Zap, Target, TrendingUp, Video, Palette,
  TestTube, GitBranch, Calendar, Database, Star, Search, Cpu,
  Bot, Brain, LogOut, Menu, X, ChevronDown, Play, Eye, Edit3,
  Copy, ExternalLink, Download, RefreshCw, CheckCircle, AlertCircle,
  Clock, DollarSign, Layers, Share2, Archive, MoreHorizontal
} from "lucide-react";
import { Streamdown } from "streamdown";
import ARIADrawer from "@/components/ARIADrawer";
import MemoryBar from "@/components/MemoryBar";
import VoiceInput from "@/components/VoiceInput";

// CDN URL for the professional ARIA neural-network logo
const ARIA_LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-logo_1be63f43.png";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResult[];
  timestamp: Date;
}

interface ToolResult {
  kind: string;
  status: "success" | "error" | "pending";
  data?: Record<string, unknown>;
  message?: string;
  recordId?: number;
}

interface DrawerState {
  open: boolean;
  type: string | null;
  data: Record<string, unknown> | null;
}

// ─── Sidebar Nav Items ────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: "Intelligence",
    items: [
      { icon: Brain, label: "Memory", prompt: "Show me what ARIA knows about my business" },
      { icon: BarChart3, label: "Analytics", prompt: "Show me my marketing analytics overview" },
      { icon: TrendingUp, label: "Performance", prompt: "Show my campaign performance metrics" },
    ]
  },
  {
    label: "Create",
    items: [
      { icon: FileText, label: "Content", prompt: "Show me my content library" },
      { icon: Mail, label: "Email", prompt: "Show me my email campaigns" },
      { icon: Globe, label: "Landing Pages", prompt: "Show me my landing pages" },
      { icon: Video, label: "Video Ads", prompt: "Show me my video ads" },
      { icon: Palette, label: "Creatives", prompt: "Show me my creative assets" },
    ]
  },
  {
    label: "Campaigns",
    items: [
      { icon: Target, label: "Campaigns", prompt: "Show me all my campaigns" },
      { icon: Zap, label: "DSP Ads", prompt: "Show me my DSP campaigns and wallet balance" },
      { icon: Calendar, label: "Scheduler", prompt: "Show me my scheduled posts" },
      { icon: Share2, label: "Social", prompt: "Show me my social publishing queue" },
    ]
  },
  {
    label: "Optimize",
    items: [
      { icon: TestTube, label: "A/B Tests", prompt: "Show me my A/B tests" },
      { icon: GitBranch, label: "Funnels", prompt: "Show me my marketing funnels" },
      { icon: Search, label: "SEO", prompt: "Show me my SEO audits" },
      { icon: Cpu, label: "Automations", prompt: "Show me my automation workflows" },
    ]
  },
  {
    label: "Grow",
    items: [
      { icon: Users, label: "CRM", prompt: "Show me my leads and deals" },
      { icon: Star, label: "Reviews", prompt: "Show me my reviews and reputation" },
      { icon: Database, label: "Competitors", prompt: "Show me my competitor intelligence" },
    ]
  },
  {
    label: "Manage",
    items: [
      { icon: Layers, label: "Products", prompt: "Show me my products" },
      { icon: Palette, label: "Brand", prompt: "Show me my brand kit and voice profiles" },
      { icon: Users, label: "Team", prompt: "Show me my team members and approvals" },
      { icon: FileText, label: "Reports", prompt: "Show me my reports" },
    ]
  },
];

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ result, onAction }: { result: ToolResult; onAction: (type: string, data: Record<string, unknown>) => void }) {
  const kindLabels: Record<string, string> = {
    buildCampaign: "Campaign Created",
    generateContent: "Content Generated",
    buildEmailCampaign: "Email Campaign",
    buildLandingPage: "Landing Page",
    buildVideoAd: "Video Ad",
    buildCreative: "Creative Asset",
    buildABTest: "A/B Test",
    buildFunnel: "Marketing Funnel",
    launchDSPCampaign: "DSP Campaign",
    schedulePost: "Post Scheduled",
    generateReport: "Report Generated",
    generateSEOAudit: "SEO Audit",
    replyToReview: "Review Reply",
    analyzeCompetitor: "Competitor Analysis",
    buildBrandVoice: "Brand Voice",
    buildBrandKit: "Brand Kit",
    buildAutomation: "Automation",
    sendEmail: "Email Sent",
    publishContent: "Content Published",
    getAnalytics: "Analytics",
    getLeads: "CRM Data",
    buildProduct: "Product Created",
    buildForm: "Form Created",
    buildPersonalVideo: "Personal Video",
    repurposeContent: "Content Repurposed",
  };

  const kindIcons: Record<string, React.ElementType> = {
    buildCampaign: Target, generateContent: FileText, buildEmailCampaign: Mail,
    buildLandingPage: Globe, buildVideoAd: Video, buildCreative: Palette,
    buildABTest: TestTube, buildFunnel: GitBranch, launchDSPCampaign: Zap,
    schedulePost: Calendar, generateReport: BarChart3, generateSEOAudit: Search,
    replyToReview: Star, analyzeCompetitor: Database, buildBrandVoice: Brain,
    buildBrandKit: Palette, buildAutomation: Cpu, sendEmail: Mail,
    publishContent: Share2, getAnalytics: TrendingUp, getLeads: Users,
    buildProduct: Layers, buildForm: FileText, buildPersonalVideo: Video,
    repurposeContent: RefreshCw,
  };

  const Icon = kindIcons[result.kind] ?? Sparkles;
  const label = kindLabels[result.kind] ?? result.kind;
  const isSuccess = result.status === "success";

  const drawerTypeMap: Record<string, string> = {
    buildCampaign: "campaign", generateContent: "content", buildEmailCampaign: "email",
    buildLandingPage: "landingPage", buildVideoAd: "video", buildCreative: "creative",
    buildABTest: "abTest", buildFunnel: "funnel", launchDSPCampaign: "dsp",
    generateReport: "report", generateSEOAudit: "seo", analyzeCompetitor: "competitor",
    getAnalytics: "analytics", getLeads: "crm",
  };

  return (
    <div className={`result-card-glow rounded-xl border p-4 bg-card animate-slide-in-bottom ${isSuccess ? "border-primary/20" : "border-destructive/20"}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${isSuccess ? "bg-primary/10" : "bg-destructive/10"}`}>
          <Icon className={`w-4 h-4 ${isSuccess ? "text-primary" : "text-destructive"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <Badge variant={isSuccess ? "default" : "destructive"} className="text-xs">
              {isSuccess ? "Done" : "Error"}
            </Badge>
          </div>
          {result.message && (
            <p className="text-xs text-muted-foreground mb-2">{result.message}</p>
          )}
          {isSuccess && result.data && (
            <div className="text-xs text-muted-foreground space-y-1">
              {Object.entries(result.data).slice(0, 3).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-muted-foreground/60 capitalize">{k}:</span>
                  <span className="text-foreground truncate">{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isSuccess && drawerTypeMap[result.kind] && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 gap-1"
            onClick={() => onAction(drawerTypeMap[result.kind], result.data ?? {})}
          >
            <Eye className="w-3 h-3" /> View
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
            <Edit3 className="w-3 h-3" /> Edit
          </Button>
          {(result.data?.shareUrl as string | undefined) && (
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
              <ExternalLink className="w-3 h-3" /> Open
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Chat Message ─────────────────────────────────────────────────────────────
function ChatMessage({ msg, onAction }: { msg: Message; onAction: (type: string, data: Record<string, unknown>) => void }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-slide-in-bottom`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 ${isUser
          ? "bg-primary text-primary-foreground rounded-tr-sm"
          : "bg-card border border-border rounded-tl-sm"
        }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="aria-prose">
              <Streamdown>{msg.content}</Streamdown>
            </div>
          )}
        </div>
        {msg.toolResults && msg.toolResults.length > 0 && (
          <div className="space-y-2 w-full">
            {msg.toolResults.map((r, i) => (
              <ResultCard key={i} result={r} onAction={onAction} />
            ))}
          </div>
        )}
        <span className="text-xs text-muted-foreground px-1">
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

// ─── Thinking Indicator ───────────────────────────────────────────────────────
function ThinkingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center">
          <div className="aria-thinking-dot w-2 h-2 rounded-full bg-primary" />
          <div className="aria-thinking-dot w-2 h-2 rounded-full bg-primary" />
          <div className="aria-thinking-dot w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground ml-2">ARIA is thinking...</span>
        </div>
      </div>
    </div>
  );
}

// ─── Suggestion Chips ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Build me a full campaign for my product launch",
  "Write 5 ad variations for Facebook",
  "Create a landing page for my offer",
  "Analyze my competitors",
  "Schedule posts for this week",
  "Generate an SEO audit for my site",
  "Build an email sequence for new leads",
  "Show me my analytics overview",
];

// ─── Main ARIA Component ──────────────────────────────────────────────────────
export default function ARIA() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [conversationId, setConversationId] = useState<number | null | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, type: null, data: null });
  // voice input is now inline — no modal needed
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversations, refetch: refetchConversations } = trpc.aria.conversations.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const sendMutation = trpc.aria.chat.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      const assistantMsg: Message = {
        id: Date.now().toString() + "_a",
        role: "assistant",
        content: data.reply,
        toolResults: (data.toolResults as ToolResult[] | undefined) ?? [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsThinking(false);
      refetchConversations();
    },
    onError: (err) => {
      setIsThinking(false);
      toast.error("ARIA encountered an error: " + err.message);
    }
  });

  const deleteConversationMutation = trpc.aria.deleteConversation.useMutation({
    onSuccess: () => {
      setMessages([]);
      setConversationId(undefined);
      refetchConversations();
    }
  });

  const { data: memoryData } = trpc.aria.memory.useQuery(undefined, { enabled: isAuthenticated });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = useCallback((text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    sendMutation.mutate({ message: msg, conversationId: conversationId ?? undefined });
  }, [input, isThinking, messages, conversationId, sendMutation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(undefined);
  };

  const openDrawer = (type: string, data: Record<string, unknown>) => {
    setDrawer({ open: true, type, data });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src={ARIA_LOGO_URL} alt="ARIA" className="w-12 h-12 rounded-xl object-contain" />
          <p className="text-gray-500 text-sm">Loading ARIA...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-4">
          <img src={ARIA_LOGO_URL} alt="ARIA" className="w-20 h-20 rounded-2xl object-contain mx-auto" />
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to ARIA</h1>
            <p className="text-muted-foreground">
              Your AI-first marketing co-pilot. One conversation replaces 35 marketing tools.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-left">
            {["Build campaigns", "Write content", "Analyze competitors", "Schedule posts",
              "Run DSP ads", "Manage reviews", "Track analytics", "Automate workflows"].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <Button
            size="lg"
            className="w-full gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
            onClick={() => window.location.href = getLoginUrl()}
          >
            <Sparkles className="w-5 h-5" />
            Start with ARIA
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-screen`}>
        <div className="p-4 flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <img src={ARIA_LOGO_URL} alt="ARIA" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
            <span className="font-bold text-gray-900 text-lg">ARIA</span>
            <Badge variant="secondary" className="text-xs ml-auto">AI</Badge>
          </div>

          {/* New Chat */}
          <Button
            className="w-full gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
            variant="ghost"
            onClick={handleNewChat}
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </Button>
        </div>

        {/* Memory Bar */}
        {memoryData && (
          <div className="px-4 pb-3 flex-shrink-0">
            <MemoryBar memory={memoryData} />
          </div>
        )}

        <Separator />

        {/* Nav */}
        <ScrollArea className="flex-1 py-2">
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="mb-2">
              <p className="text-xs font-semibold text-muted-foreground px-4 py-1 uppercase tracking-wider">
                {section.label}
              </p>
              {section.items.map(item => (
                <button
                  key={item.label}
                  onClick={() => handleSend(item.prompt)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors text-left"
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          ))}

          {/* Recent Conversations */}
          {conversations && conversations.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-muted-foreground px-4 py-1 uppercase tracking-wider">
                Recent
              </p>
              {conversations.slice(0, 8).map(conv => (
                <button
                  key={conv.id}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors text-left group"
                  onClick={() => {
                    setConversationId(conv.id);
                    // Load messages for this conversation
                  }}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate flex-1">
                    {(conv.messages as unknown[])?.length ? `Conversation ${conv.id}` : `Chat ${conv.id}`}
                  </span>
                  <div
                    role="button"
                    tabIndex={0}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversationMutation.mutate({ id: conv.id });
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); deleteConversationMutation.mutate({ id: conv.id }); } }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />

        {/* User */}
        <div className="p-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {user?.name?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7"
                onClick={() => handleSend("Show me my account settings")}
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7"
                onClick={logout}
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Chat Area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          <div className="flex items-center gap-2">
            <img src={ARIA_LOGO_URL} alt="ARIA" className="w-6 h-6 rounded-md object-contain flex-shrink-0" />
            <span className="font-semibold text-gray-900">ARIA</span>
            <span className="text-muted-foreground text-sm">— AI Marketing Intelligence</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 inline-block" />
              Claude Sonnet 4.5
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1"
              onClick={() => handleSend("Show me my billing and credits")}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Credits
            </Button>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1" ref={scrollRef as React.RefObject<HTMLDivElement>}>
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="text-center space-y-8 py-12">
                <div className="space-y-3">
                  <img src={ARIA_LOGO_URL} alt="ARIA" className="w-16 h-16 rounded-2xl object-contain mx-auto" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {user?.name?.split(" ")[0] ?? "there"}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    I'm ARIA, your AI marketing co-pilot. Tell me what you want to build, analyze, or launch — I'll handle the rest.
                  </p>
                </div>

                {/* Suggestion chips */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="px-3 py-1.5 rounded-full border border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Capability grid */}
                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                  {[
                    { icon: Target, label: "Campaigns", desc: "Build & launch" },
                    { icon: FileText, label: "Content", desc: "Write & publish" },
                    { icon: BarChart3, label: "Analytics", desc: "Track & optimize" },
                    { icon: Users, label: "CRM", desc: "Leads & deals" },
                    { icon: Zap, label: "DSP Ads", desc: "Programmatic" },
                    { icon: Brain, label: "AI Memory", desc: "Learns your brand" },
                  ].map(cap => (
                    <div
                      key={cap.label}
                      className="p-3 rounded-xl border border-border bg-card/50 text-center cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => handleSend(`Tell me about ${cap.label.toLowerCase()}`)}
                    >
                      <cap.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="text-xs font-medium text-foreground">{cap.label}</p>
                      <p className="text-xs text-muted-foreground">{cap.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <ChatMessage key={msg.id} msg={msg} onAction={openDrawer} />
              ))
            )}
            {isThinking && <ThinkingIndicator />}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-card border border-border rounded-2xl p-3 focus-within:border-primary/50 transition-colors">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ARIA anything — build a campaign, write content, analyze data..."
                className="flex-1 border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px] max-h-[200px] text-sm placeholder:text-muted-foreground/60 p-0"
                rows={1}
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <VoiceInput
                  onTranscript={(text) => setInput(prev => prev ? prev + " " + text : text)}
                  disabled={isThinking}
                />
                <Button
                  size="icon"
                  className="w-8 h-8 bg-primary hover:bg-primary/90 rounded-xl"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isThinking}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              ARIA uses Claude 3.5 Sonnet · Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* ── Drawer ───────────────────────────────────────────────────────── */}
      <ARIADrawer
        open={drawer.open}
        type={drawer.type}
        data={drawer.data}
        onClose={() => setDrawer({ open: false, type: null, data: null })}
        onSendMessage={handleSend}
      />

      {/* Voice input is now inline in the chat bar */}
    </div>
  );
}
