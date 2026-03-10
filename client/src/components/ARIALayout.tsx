import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import ARIASidebar from "./ARIASidebar";
import { Button } from "@/components/ui/button";
import { Loader2, Menu, Brain } from "lucide-react";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";

interface ARIALayoutProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
}

export default function ARIALayout({ children, title, actions }: ARIALayoutProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ARIA</h1>
          <p className="text-muted-foreground">Sign in to access your AI marketing agent</p>
          <Button
            className="bg-gradient-to-r from-primary to-chart-2 hover:opacity-90"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <div className={cn(
        "hidden lg:flex flex-shrink-0 transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <ARIASidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Sidebar - mobile */}
      <div className={cn(
        "fixed left-0 top-0 bottom-0 z-50 lg:hidden transition-transform duration-300",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <ARIASidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        {(title || actions) && (
          <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            {title && (
              <h1 className="font-semibold text-foreground text-sm">{title}</h1>
            )}
            {actions && (
              <div className="ml-auto flex items-center gap-2">
                {actions}
              </div>
            )}
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
