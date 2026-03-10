import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Sparkles, Send, Plus, ChevronLeft,
  MessageSquare, Trash2, Settings, CreditCard, Users, BarChart3,
  FileText, Mail, Globe, Zap, Target, TrendingUp, Video, Palette,
  TestTube, GitBranch, Calendar, Database, Star, Search, Cpu,
  Bot, Brain, LogOut, Menu, X,
  Copy, ExternalLink, Eye, Edit3,
  RefreshCw, CheckCircle,
  DollarSign, Layers, Share2, MoreHorizontal,
  Paperclip, Link, Image, File, AlertCircle
} from "lucide-react";
import { Streamdown } from "streamdown";
import ARIADrawer from "@/components/ARIADrawer";
import MemoryBar from "@/components/MemoryBar";
import VoiceInput from "@/components/VoiceInput";
import { useAuth } from "@/_core/hooks/useAuth";
import { DAGSummaryCard } from "@/components/DAGSummaryCard";

// CDN URL for the professional ARIA neural-network logo
const ARIA_LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-logo_1be63f43.png";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Attachment {
  name: string;
  url: string;
  type: string;
  size?: number;
  content?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolResults?: ToolResult[];
  attachments?: Attachment[];
  timestamp: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dagSummary?: any | null;
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
      { icon: Layers, label: "Products", route: "/products" },
      { icon: Palette, label: "Brand", route: "/brand" },
      { icon: Users, label: "Team", route: "/team" },
      { icon: FileText, label: "Reports", route: "/reports" },
    ]
  },
];

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ result, onAction }: { result: ToolResult; onAction: (type: string, data: Record<string, unknown>) => void }) {
  const kindLabels: Record<string, string> = {
    buildCampaign: "Campaign Created", generateContent: "Content Generated",
    buildEmailCampaign: "Email Campaign", buildLandingPage: "Landing Page",
    buildVideoAd: "Video Ad", buildCreative: "Creative Asset",
    buildABTest: "A/B Test", buildFunnel: "Marketing Funnel",
    launchDSPCampaign: "DSP Campaign", schedulePost: "Post Scheduled",
    generateReport: "Report Generated", generateSEOAudit: "SEO Audit",
    replyToReview: "Review Reply", analyzeCompetitor: "Competitor Analysis",
    buildBrandVoice: "Brand Voice", buildBrandKit: "Brand Kit",
    buildAutomation: "Automation", sendEmail: "Email Sent",
    publishContent: "Content Published", getAnalytics: "Analytics",
    getLeads: "CRM Data", buildProduct: "Product Created",
    buildForm: "Form Created", buildPersonalVideo: "Personal Video",
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
  const drawerTypeMap: Record<string, string> = {
    buildCampaign: "campaign", generateContent: "content", buildEmailCampaign: "email",
    buildLandingPage: "landingPage", buildVideoAd: "video", buildCreative: "creative",
    buildABTest: "abTest", buildFunnel: "funnel", launchDSPCampaign: "dsp",
    generateReport: "report", generateSEOAudit: "seo", analyzeCompetitor: "competitor",
    getAnalytics: "analytics", getLeads: "crm",
  };
  const Icon = kindIcons[result.kind] ?? Sparkles;
  const label = kindLabels[result.kind] ?? result.kind;
  const isSuccess = result.status === "success";
  return (
    <div className={`rounded-xl border p-4 bg-card animate-slide-in-bottom ${isSuccess ? "border-primary/20" : "border-destructive/20"}`}>
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
          {result.message && <p className="text-xs text-muted-foreground mb-2">{result.message}</p>}
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
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1" onClick={() => onAction(drawerTypeMap[result.kind], result.data ?? {})}>
            <Eye className="w-3 h-3" /> View
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
            <Edit3 className="w-3 h-3" /> Edit
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Attachment Chip ──────────────────────────────────────────────────────────
function AttachmentChip({ attachment }: { attachment: Attachment }) {
  const isImage = attachment.type.startsWith("image/");
  const isPdf = attachment.type === "application/pdf";
  const Icon = isImage ? Image : isPdf ? FileText : File;
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/20 transition-colors max-w-[200px]"
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="truncate">{attachment.name}</span>
      <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 opacity-60" />
    </a>
  );
}

// ─── Chat Message ─────────────────────────────────────────────────────────────
function ChatMessage({ msg, onAction }: { msg: Message; onAction: (type: string, data: Record<string, unknown>) => void }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-slide-in-bottom group`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Attachments (shown above the message bubble for user messages) */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.attachments.map((a, i) => <AttachmentChip key={i} attachment={a} />)}
          </div>
        )}
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
        {msg.dagSummary && msg.dagSummary.type === "dag_summary" && (
          <div className="w-full">
            <DAGSummaryCard summary={msg.dagSummary} />
          </div>
        )}
        {msg.toolResults && msg.toolResults.length > 0 && (
          <div className="space-y-2 w-full">
            {msg.toolResults.map((r, i) => (
              <ResultCard key={i} result={r} onAction={onAction} />
            ))}
          </div>
        )}
        <div className={`flex items-center gap-2 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs text-muted-foreground">
            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
            title="Copy message"
          >
            {copied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Thinking Indicator ───────────────────────────────────────────────────────
const DAG_AGENT_LABELS: Record<string, string> = {
  strategy: "Strategy",
  content: "Content",
  email: "Email",
  creative: "Creative",
  video: "Video",
  landingpage: "Landing Page",
  seo: "SEO",
  social: "Social",
  dsp: "DSP Ads",
  crm: "CRM",
  review: "Review",
};

const DAG_TRIGGERS = /campaign|launch|content|email|video|ads|funnel|social|seo|lead|marketing|brand|product|landing page|drip|sequence|ad copy|creative|audience|competitor|strategy|grow|scale|promote|advertise|convert|optimize|automate/i;

function ThinkingIndicator({ lastUserMessage }: { lastUserMessage?: string }) {
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [phaseLabel, setPhaseLabel] = useState("Analyzing your request...");
  const [elapsed, setElapsed] = useState(0);
  const isDag = lastUserMessage && DAG_TRIGGERS.test(lastUserMessage);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 500);
    if (!isDag) return () => clearInterval(timer);

    const t1 = setTimeout(() => { setPhaseLabel("Strategy agent building plan..."); setActiveAgents(["strategy"]); }, 800);
    const t2 = setTimeout(() => {
      setPhaseLabel("Running 9 agents in parallel...");
      setActiveAgents(["strategy", "content", "email", "creative"]);
    }, 3000);
    const t3 = setTimeout(() => {
      setActiveAgents(["strategy", "content", "email", "creative", "video", "landingpage", "seo", "social"]);
    }, 5500);
    const t4 = setTimeout(() => {
      setActiveAgents(["strategy", "content", "email", "creative", "video", "landingpage", "seo", "social", "dsp", "crm"]);
    }, 8000);
    const t5 = setTimeout(() => { setPhaseLabel("Review agent auditing all outputs..."); setActiveAgents(prev => [...prev, "review"]); }, 13000);

    return () => { clearInterval(timer); [t1, t2, t3, t4, t5].forEach(clearTimeout); };
  }, [isDag]);

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center flex-shrink-0 mt-1">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex-1 max-w-lg">
        {isDag && activeAgents.length > 0 ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="aria-thinking-dot w-1.5 h-1.5 rounded-full bg-primary" />
                <div className="aria-thinking-dot w-1.5 h-1.5 rounded-full bg-primary" />
                <div className="aria-thinking-dot w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">{phaseLabel}</span>
              <span className="text-xs text-muted-foreground ml-auto tabular-nums">{elapsed}s</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeAgents.map(agent => (
                <span
                  key={agent}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 animate-fade-in"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
                  {DAG_AGENT_LABELS[agent] ?? agent}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-1.5 items-center">
            <div className="aria-thinking-dot w-2 h-2 rounded-full bg-primary" />
            <div className="aria-thinking-dot w-2 h-2 rounded-full bg-primary" />
            <div className="aria-thinking-dot w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground ml-2">ARIA is thinking...</span>
          </div>
        )}
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

// ─── Pending Attachment Preview ───────────────────────────────────────────────
function PendingAttachmentPreview({ attachments, onRemove }: { attachments: Attachment[]; onRemove: (i: number) => void }) {
  if (attachments.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 px-3 pt-2">
      {attachments.map((a, i) => {
        const isImage = a.type.startsWith("image/");
        const Icon = isImage ? Image : a.type === "application/pdf" ? FileText : File;
        return (
          <div key={i} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary">
            <Icon className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[120px]">{a.name}</span>
            <button onClick={() => onRemove(i)} className="hover:text-destructive ml-0.5">
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ARIA Component ──────────────────────────────────────────────────────
export default function ARIA() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [conversationId, setConversationId] = useState<number | null | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, type: null, data: null });
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: conversations, refetch: refetchConversations } = trpc.aria.conversations.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const getConversationQuery = trpc.aria.getConversation.useQuery(
    { id: conversationId! },
    { enabled: typeof conversationId === "number" && conversationId > 0 && messages.length === 0 }
  );

  // Load messages when a conversation is selected from history
  useEffect(() => {
    if (getConversationQuery.data && messages.length === 0) {
      const conv = getConversationQuery.data;
      const loaded = (conv.messages as Array<{ role: string; content: string }>).map((m, i) => ({
        id: `hist_${i}`,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date(conv.updatedAt),
      }));
      setMessages(loaded);
    }
  }, [getConversationQuery.data]);

  const sendMutation = trpc.aria.chat.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      const assistantMsg: Message = {
        id: Date.now().toString() + "_a",
        role: "assistant",
        content: data.reply,
        toolResults: (data.toolResults as ToolResult[] | undefined) ?? [],
        timestamp: new Date(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dagSummary: (data as any).dagSummary ?? null,
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

  // ── Auto-send ?q= query param on mount (deep-link from feature pages) ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || loading) return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && q.trim()) {
      const url = new URL(window.location.href);
      url.searchParams.delete("q");
      window.history.replaceState({}, "", url.toString());
      setTimeout(() => handleSend(decodeURIComponent(q.replace(/\\+/g, " "))), 300);
    }
  }, [isAuthenticated, loading]);

  // ── File upload handler ──────────────────────────────────────────────────
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(f => formData.append("files", f));
      const res = await fetch("/api/upload/attachment", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      const { attachments } = await res.json() as { attachments: Attachment[] };
      setPendingAttachments(prev => [...prev, ...attachments]);
      toast.success(`${attachments.length} file${attachments.length > 1 ? "s" : ""} attached`);
    } catch (err) {
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── URL attachment handler ───────────────────────────────────────────────
  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    try {
      new URL(url); // validate
      const name = url.replace(/^https?:\/\//, "").split("/")[0];
      setPendingAttachments(prev => [...prev, { name, url, type: "text/uri-list" }]);
      setUrlInput("");
      setShowUrlInput(false);
      toast.success("URL attached");
    } catch {
      toast.error("Please enter a valid URL (e.g. https://example.com)");
    }
  };

  const handleSend = useCallback((text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setPendingAttachments([]);
    setIsThinking(true);

    sendMutation.mutate({
      message: msg,
      conversationId: conversationId ?? undefined,
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
    });
  }, [input, isThinking, pendingAttachments, conversationId, sendMutation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle paste: detect URLs and offer to attach
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    if (text.startsWith("http://") || text.startsWith("https://")) {
      try {
        new URL(text);
        const name = text.replace(/^https?:\/\//, "").split("/")[0];
        setPendingAttachments(prev => [...prev, { name, url: text, type: "text/uri-list" }]);
        e.preventDefault();
        toast.success(`URL attached: ${name}`);
        return;
      } catch { /* not a valid URL, fall through */ }
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(undefined);
    setPendingAttachments([]);
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
    // Use full page redirect to ensure clean state after logout
    window.location.href = "/";
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src={ARIA_LOGO_URL} alt="ARIA" className="w-12 h-12 rounded-xl object-contain" />
          <p className="text-gray-500 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
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

        {/* Nav + Recent Conversations */}
        <div className="flex-1 overflow-y-auto min-h-0 py-2">
          {/* Recent Conversations */}
          {conversations && conversations.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-muted-foreground px-4 py-1 uppercase tracking-wider">
                Recent
              </p>
              {conversations.slice(0, 10).map(conv => {
                const title = conv.title ??
                  (() => {
                    const msgs = conv.messages as Array<{ role: string; content: string }>;
                    const first = msgs.find(m => m.role === "user");
                    if (!first) return `Chat ${conv.id}`;
                    const words = first.content.trim().split(/\s+/).slice(0, 6).join(" ");
                    return words.length > 40 ? words.slice(0, 40) + "…" : words;
                  })();
                const isActive = conversationId === conv.id;
                return (
                  <button
                    key={conv.id}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors text-left group ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}
                    onClick={() => {
                      setMessages([]);
                      setConversationId(conv.id);
                    }}
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate flex-1">{title}</span>
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
                );
              })}
            </div>
          )}

          {/* Navigation sections */}
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="mb-2">
              <p className="text-xs font-semibold text-muted-foreground px-4 py-1 uppercase tracking-wider">
                {section.label}
              </p>
              {section.items.map(item => (
                <button
                  key={item.label}
                  onClick={() => {
                    if ('route' in item) {
                      navigate(item.route);
                    } else {
                      handleSend(item.prompt);
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors text-left"
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </div>

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
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => navigate("/settings")} title="Settings">
                <Settings className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-7 h-7" onClick={async () => { await logout(); window.location.href = "/"; }}>
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Chat Area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/billing")}>
              <CreditCard className="w-3.5 h-3.5" />
              Credits
            </Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto min-h-0" ref={scrollRef as React.RefObject<HTMLDivElement>}>
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.length === 0 && !getConversationQuery.isLoading ? (
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
            ) : getConversationQuery.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <img src={ARIA_LOGO_URL} alt="ARIA" className="w-10 h-10 rounded-xl object-contain animate-pulse" />
                  <p className="text-sm text-muted-foreground">Loading conversation...</p>
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <ChatMessage key={msg.id} msg={msg} onAction={openDrawer} />
              ))
            )}
            {isThinking && <ThinkingIndicator lastUserMessage={messages.filter(m => m.role === "user").at(-1)?.content} />}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            {/* URL input row */}
            {showUrlInput && (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleAddUrl(); if (e.key === "Escape") setShowUrlInput(false); }}
                  placeholder="Paste a URL (website, doc, page)..."
                  className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary/50 bg-white"
                  autoFocus
                />
                <Button size="sm" onClick={handleAddUrl} className="h-8 text-xs">Attach</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowUrlInput(false)} className="h-8 w-8 p-0">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            <div className="relative flex flex-col bg-card border border-border rounded-2xl focus-within:border-primary/50 transition-colors">
              {/* Pending attachments preview */}
              <PendingAttachmentPreview
                attachments={pendingAttachments}
                onRemove={(i) => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))}
              />

              <div className="flex items-end gap-2 p-3">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder="Ask ARIA anything — or paste a URL to attach it..."
                  className="flex-1 border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[44px] max-h-[200px] text-sm placeholder:text-muted-foreground/60 p-0"
                  rows={1}
                />
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Attach file button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.csv,.md,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.webm,.ogg,.m4a"
                    className="hidden"
                    onChange={e => handleFileUpload(e.target.files)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-foreground"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Attach file (PDF, Word, image, audio)"
                  >
                    {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                  </Button>
                  {/* Attach URL button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    title="Attach a URL"
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                  {/* Voice input */}
                  <VoiceInput
                    onTranscript={(text) => setInput(prev => prev ? prev + " " + text : text)}
                    disabled={isThinking}
                  />
                  {/* Send */}
                  <Button
                    size="icon"
                    className="w-8 h-8 bg-primary hover:bg-primary/90 rounded-xl"
                    onClick={() => handleSend()}
                    disabled={(!input.trim() && pendingAttachments.length === 0) || isThinking}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              ARIA uses Claude Sonnet 4.5 · Enter to send · Shift+Enter for new line · Paste a URL to attach it
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

      {/* Hidden file input */}
    </div>
  );
}
