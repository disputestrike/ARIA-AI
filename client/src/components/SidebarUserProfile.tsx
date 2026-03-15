import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, Settings, LogOut, User, Bell, Shield } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: "free" | "starter" | "pro" | "business" | "agency" | "enterprise";
  campaignsUsed: number;
  campaignsLimit: number;
}

export function SidebarUserProfile({
  user,
  onSettings,
  onLogout,
}: {
  user: UserProfile;
  onSettings: () => void;
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const campaignPercentage = (user.campaignsUsed / user.campaignsLimit) * 100;
  const tierColors: Record<string, string> = {
    free: "bg-slate-100 text-slate-700",
    starter: "bg-blue-100 text-blue-700",
    pro: "bg-purple-100 text-purple-700",
    business: "bg-green-100 text-green-700",
    agency: "bg-amber-100 text-amber-700",
    enterprise: "bg-red-100 text-red-700",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 hover:bg-slate-800 px-2 py-2 rounded-lg transition"
      >
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
            {user.name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg mb-2 z-50">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Account
            </p>
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-blue-600 text-white text-sm font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>

            {/* Tier Badge */}
            <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${tierColors[user.tier]}`}>
              {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
            </div>
          </div>

          {/* Usage Bar */}
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Campaigns This Month
            </p>
            <div className="mb-2">
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition ${
                    campaignPercentage > 90
                      ? "bg-red-500"
                      : campaignPercentage > 70
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(campaignPercentage, 100)}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">
              {user.campaignsUsed} / {user.campaignsLimit} campaigns used
            </p>

            {user.campaignsUsed >= user.campaignsLimit && (
              <div className="mt-3">
                <Button
                  size="sm"
                  className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-xs font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  Upgrade to Build More
                </Button>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                onSettings();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-3 transition"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-3 transition"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-3 transition"
            >
              <Shield className="w-4 h-4" />
              Privacy & Security
            </button>

            <div className="border-t border-slate-700 my-1" />

            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 flex items-center gap-3 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
