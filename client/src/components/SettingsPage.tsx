import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronLeft, Settings, Lock, Bell, Palette, LogOut, Edit2, Save } from "lucide-react";

interface SettingsState {
  email: string;
  name: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  productUpdates: boolean;
  weeklyDigest: boolean;
  dataExport: boolean;
}

export function SettingsPage({
  onBack,
  onLogout,
}: {
  onBack: () => void;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<"account" | "brand" | "notifications" | "privacy">("account");
  const [settings, setSettings] = useState<SettingsState>({
    email: "ben@example.com",
    name: "Benjamin Peter",
    twoFactorEnabled: false,
    emailNotifications: true,
    productUpdates: true,
    weeklyDigest: false,
    dataExport: false,
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    toast.success("Settings saved!");
    setIsEditing(false);
  };

  const handleToggle = (key: keyof SettingsState) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
              <p className="text-sm text-slate-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-2">
              {[
                { id: "account", label: "Account", icon: Settings },
                { id: "brand", label: "Brand Kit", icon: Palette },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "privacy", label: "Privacy & Security", icon: Lock },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as any)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center gap-3 ${
                    tab === item.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Account Settings */}
            {tab === "account" && (
              <>
                <Card className="p-8 border-0 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Account Information</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Edit2 className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Full Name
                      </label>
                      <Input
                        value={settings.name}
                        onChange={e => setSettings(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Email Address
                      </label>
                      <Input
                        value={settings.email}
                        onChange={e => setSettings(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="border-slate-300"
                      />
                    </div>

                    {isEditing && (
                      <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    )}
                  </div>
                </Card>

                <Card className="p-8 border-0 shadow-lg">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Subscription</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">Pro Plan</p>
                      <p className="text-sm text-slate-600">$98/month • Renews March 14, 2026</p>
                    </div>
                    <Button variant="outline" className="border-slate-300">
                      Change Plan
                    </Button>
                  </div>
                </Card>

                <Card className="p-8 border-0 shadow-lg bg-red-50 border-l-4 border-red-600">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Delete Account</h2>
                  <p className="text-sm text-slate-700 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => toast.error("Account deletion not yet implemented")}
                  >
                    Delete Account
                  </Button>
                </Card>
              </>
            )}

            {/* Brand Kit */}
            {tab === "brand" && (
              <Card className="p-8 border-0 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Brand Kit</h2>
                <p className="text-slate-700 mb-6">
                  Your Brand Kit is automatically injected into every asset generated by ARIA.
                </p>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Brand Kit
                </Button>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Currently set:</strong> Lumos Coffee Co. • Professional, warm tone • Target: Coffee enthusiasts
                  </p>
                </div>
              </Card>
            )}

            {/* Notifications */}
            {tab === "notifications" && (
              <Card className="p-8 border-0 shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Email Preferences</h2>

                <div className="space-y-4">
                  {[
                    {
                      key: "emailNotifications",
                      label: "Campaign Notifications",
                      desc: "Get notified when campaigns are generated or published",
                    },
                    {
                      key: "productUpdates",
                      label: "Product Updates",
                      desc: "Learn about new features and improvements",
                    },
                    {
                      key: "weeklyDigest",
                      label: "Weekly Performance Digest",
                      desc: "Summary of your campaign performance every Monday",
                    },
                    {
                      key: "dataExport",
                      label: "Data Export Notifications",
                      desc: "Notify me when my data export is ready",
                    },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-semibold text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-600">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings[item.key as keyof SettingsState] as boolean}
                        onChange={() => handleToggle(item.key as keyof SettingsState)}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={() => toast.success("Notification preferences saved")} className="mt-6 bg-blue-600 hover:bg-blue-700">
                  Save Preferences
                </Button>
              </Card>
            )}

            {/* Privacy & Security */}
            {tab === "privacy" && (
              <>
                <Card className="p-8 border-0 shadow-lg">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Privacy & Security</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <p className="text-slate-700">
                          {settings.twoFactorEnabled ? "Enabled" : "Not enabled"}
                        </p>
                        <Button
                          variant="outline"
                          className="border-slate-300"
                          onClick={() => toast.info("2FA setup not yet implemented")}
                        >
                          {settings.twoFactorEnabled ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">API Keys</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Generate API keys for programmatic access to ARIA
                      </p>
                      <Button variant="outline" className="border-slate-300">
                        Manage API Keys
                      </Button>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Data Download</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Download all your data in JSON format
                      </p>
                      <Button variant="outline" className="border-slate-300">
                        Request Data Export
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 border-0 shadow-lg">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Sign Out</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Sign out of ARIA on all devices
                  </p>
                  <Button
                    onClick={onLogout}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out Everywhere
                  </Button>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
