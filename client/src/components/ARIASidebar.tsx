import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare, Target, FileText, Mail, Globe, Video,
  Palette, TestTube, GitBranch, Zap, BarChart3, Search,
  Database, Users, Settings, CreditCard, Star, Calendar,
  Layers, Cpu, Brain, ChevronRight, ChevronLeft, LogOut,
  TrendingUp, BookOpen, Workflow, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

// CDN URL for the professional ARIA neural-network logo
const ARIA_LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-logo_1be63f43.png";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Core",
    items: [
      { label: "ARIA Chat", href: "/", icon: MessageSquare, badge: "AI" },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Campaigns", href: "/campaigns", icon: Target },
      { label: "Content", href: "/content", icon: FileText },
      { label: "Email", href: "/email", icon: Mail },
      { label: "Landing Pages", href: "/landing-pages", icon: Globe },
      { label: "Video Ads", href: "/video", icon: Video },
      { label: "Creatives", href: "/creatives", icon: Palette },
      { label: "Scheduler", href: "/scheduler", icon: Calendar },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "SEO", href: "/seo", icon: Search },
      { label: "Competitors", href: "/competitors", icon: Database },
      { label: "Reviews", href: "/reviews", icon: Star },
      { label: "A/B Tests", href: "/ab-tests", icon: TestTube },
    ],
  },
  {
    title: "Growth",
    items: [
      { label: "CRM", href: "/crm", icon: Users },
      { label: "Funnels", href: "/funnels", icon: GitBranch },
      { label: "Automations", href: "/automations", icon: Workflow },
      { label: "DSP Ads", href: "/dsp", icon: Zap },
      { label: "Reports", href: "/reports", icon: TrendingUp },
    ],
  },
  {
    title: "Brand",
    items: [
      { label: "Brand Kit", href: "/brand", icon: Layers },
      { label: "Templates", href: "/templates", icon: BookOpen },
      { label: "Products", href: "/products", icon: Cpu },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Team", href: "/team", icon: Shield },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Billing", href: "/billing", icon: CreditCard },
    ],
  },
];

interface ARIASidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function ARIASidebar({ collapsed = false, onToggle }: ARIASidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        // Full height, no overflow on the aside itself — children handle scroll
        "h-screen",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-4 border-b border-gray-100 flex-shrink-0",
          collapsed && "justify-center px-2"
        )}
      >
        {/* Real ARIA logo image */}
        <img
          src={ARIA_LOGO_URL}
          alt="ARIA"
          className="w-8 h-8 rounded-lg flex-shrink-0 object-contain"
          onError={(e) => {
            // Fallback to gradient Brain icon if image fails
            const target = e.currentTarget;
            target.style.display = "none";
            const fallback = target.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        {/* Hidden fallback icon */}
        <div
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 items-center justify-center flex-shrink-0"
          style={{ display: "none" }}
        >
          <Brain className="w-4 h-4 text-white" />
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm tracking-tight">ARIA</p>
            <p className="text-xs text-gray-500 truncate">AI Marketing Agent</p>
          </div>
        )}
        {!collapsed && onToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-gray-400 hover:text-gray-700"
            onClick={onToggle}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
        )}
        {collapsed && onToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-gray-400 hover:text-gray-700 mt-1"
            onClick={onToggle}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* ── Navigation (scrollable) ── */}
      {/* 
        Key fix: use overflow-y-auto with a flex-1 container.
        The aside is h-screen, header and footer are flex-shrink-0,
        so this middle section gets all remaining height and scrolls.
      */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <nav className="p-2 pb-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-1">
              {!collapsed && (
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 pt-4 pb-1">
                  {section.title}
                </p>
              )}
              {collapsed && <Separator className="my-2 bg-gray-100" />}

              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all text-sm select-none",
                        "hover:bg-violet-50 hover:text-violet-700",
                        active
                          ? "bg-violet-50 text-violet-700 font-semibold"
                          : "text-gray-600",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 flex-shrink-0",
                          active ? "text-violet-600" : "text-gray-400"
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 px-1.5 border-violet-200 text-violet-600 bg-violet-50"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* ── User Profile ── */}
      <div
        className={cn(
          "flex items-center gap-2.5 p-3 border-t border-gray-100 flex-shrink-0 bg-white",
          collapsed && "justify-center"
        )}
      >
        <Avatar className="w-7 h-7 flex-shrink-0">
          <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{user?.name ?? "User"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email ?? ""}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-gray-400 hover:text-red-500"
              onClick={() => logout()}
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
