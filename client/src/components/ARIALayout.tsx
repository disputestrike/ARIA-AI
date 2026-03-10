import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import ARIASidebar from "./ARIASidebar";
import { Button } from "@/components/ui/button";
import { Loader2, Menu, Brain } from "lucide-react";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";

// CDN URL for the professional ARIA neural-network logo
const ARIA_LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-logo_1be63f43.png";

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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <img src={ARIA_LOGO_URL} alt="ARIA" className="w-12 h-12 rounded-xl object-contain" />
          <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <img src={ARIA_LOGO_URL} alt="ARIA" className="w-16 h-16 rounded-2xl object-contain mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900">ARIA</h1>
          <p className="text-gray-500">Sign in to access your AI marketing agent</p>
          <Button
            className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <div
        className={cn(
          "hidden lg:block flex-shrink-0 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <ARIASidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Sidebar - mobile */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 lg:hidden transition-transform duration-300",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <ARIASidebar onToggle={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        {(title || actions) && (
          <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            {title && (
              <h1 className="font-semibold text-gray-900 text-sm">{title}</h1>
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
