import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare, Target, FileText, Mail, Globe, Video,
  Palette, TestTube, GitBranch, Zap, BarChart3, Search,
  Database, Users, Settings, CreditCard, Star, Calendar,
  Layers, Cpu, Brain, ChevronRight, LogOut, Sparkles,
  TrendingUp, BookOpen, Workflow, Shield, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    <aside className={cn(
      "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-4 border-b border-border flex-shrink-0",
        collapsed && "justify-center px-2"
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm">ARIA</p>
            <p className="text-xs text-muted-foreground truncate">AI Marketing Agent</p>
          </div>
        )}
        {!collapsed && onToggle && (
          <Button variant="ghost" size="icon" className="w-6 h-6" onClick={onToggle}>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2 mt-2">
                  {section.title}
                </p>
              )}
              {collapsed && <Separator className="my-1" />}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                      "hover:bg-accent hover:text-accent-foreground",
                      active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground",
                      collapsed && "justify-center px-2"
                    )}>
                      <Icon className={cn("w-4 h-4 flex-shrink-0", active && "text-primary")} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <Badge variant="outline" className="text-xs py-0 px-1.5 border-primary/30 text-primary">
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
      </ScrollArea>

      {/* User Profile */}
      <div className={cn(
        "flex items-center gap-2.5 p-3 border-t border-border flex-shrink-0",
        collapsed && "justify-center"
      )}>
        <Avatar className="w-7 h-7 flex-shrink-0">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
            {user?.name?.charAt(0) ?? "U"}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.name ?? "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-muted-foreground hover:text-destructive"
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
