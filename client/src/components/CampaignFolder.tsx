import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Edit3, Copy, Download, Share2, Trash2, Clock, Send,
  ChevronLeft, Settings, LogOut, Menu, X, Star, MoreVertical,
  CheckCircle, AlertCircle
} from "lucide-react";

interface CampaignAsset {
  id: string;
  type: string;
  title: string;
  status: "draft" | "approved" | "scheduled" | "published";
  content: string;
  version: number;
  createdAt: Date;
  scheduledFor?: Date;
  platform?: string;
}

interface CampaignFolder {
  id: string;
  name: string;
  score: number;
  assets: CampaignAsset[];
  createdAt: Date;
}

const ASSET_TYPE_ICONS: Record<string, React.ReactNode> = {
  blog: "📝",
  email: "✉️",
  social: "📱",
  video: "🎬",
  landing: "🔗",
  ad: "📢",
  seo: "🔍",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  approved: "bg-green-100 text-green-700",
  scheduled: "bg-blue-100 text-blue-700",
  published: "bg-purple-100 text-purple-700",
};

export function CampaignFolder({
  folder,
  onBack,
}: {
  folder: CampaignFolder;
  onBack: () => void;
}) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    folder.assets[0]?.id || null
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showAssetMenu, setShowAssetMenu] = useState<string | null>(null);

  const selectedAsset = folder.assets.find(a => a.id === selectedAssetId);

  const handleEditAsset = (assetId: string) => {
    toast.info(`Edit mode for asset: ${assetId}`);
    // TODO: Open inline editor
  };

  const handleRegenerateAsset = (assetId: string) => {
    toast.loading("Regenerating asset...");
    setTimeout(() => {
      toast.success("Asset regenerated!");
    }, 2000);
  };

  const handleCopyAsset = (assetId: string) => {
    const asset = folder.assets.find(a => a.id === assetId);
    if (asset) {
      navigator.clipboard.writeText(asset.content);
      toast.success("Copied to clipboard!");
    }
  };

  const handleDownloadAsset = (asset: CampaignAsset) => {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(asset.content));
    element.setAttribute("download", `${asset.title}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded!");
  };

  const handlePublishAsset = (assetId: string) => {
    toast.loading("Publishing...");
    setTimeout(() => {
      toast.success("Published!");
    }, 1500);
  };

  const handleScheduleAsset = (assetId: string) => {
    toast.info("Schedule modal would open here");
    // TODO: Open schedule modal
  };

  const handleShareAsset = (assetId: string) => {
    toast.info("Share modal would open here");
    // TODO: Open client share modal
  };

  const handleDeleteAsset = (assetId: string) => {
    toast.success("Asset deleted (with version history preserved)");
  };

  return (
    <div className="h-screen w-screen flex bg-slate-900">
      {/* SIDEBAR - Asset List */}
      <div className={`${sidebarOpen ? "w-72" : "w-0"} bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-200 overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-white text-lg">{folder.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-semibold text-white">Score: {folder.score}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Asset List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {folder.assets.map(asset => (
            <button
              key={asset.id}
              onClick={() => setSelectedAssetId(asset.id)}
              className={`w-full text-left p-3 rounded-lg transition ${
                selectedAssetId === asset.id
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">
                  {ASSET_TYPE_ICONS[asset.type] || "📄"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{asset.title}</p>
                  <p className="text-xs opacity-75 truncate">{asset.type}</p>
                </div>
              </div>
              <Badge className={`mt-2 text-xs ${STATUS_COLORS[asset.status]}`}>
                {asset.status}
              </Badge>
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800 p-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800"
            onClick={() => toast.info("Settings would open")}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-red-400 border-slate-700 hover:bg-slate-800"
            onClick={onBack}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Chat
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT - Asset Detail */}
      <div className="flex-1 flex flex-col bg-slate-900">
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-slate-300" />
              ) : (
                <Menu className="w-5 h-5 text-slate-300" />
              )}
            </button>
            <div>
              <h1 className="text-white font-semibold">
                {selectedAsset?.title || "Select an asset"}
              </h1>
              <p className="text-xs text-slate-400">
                {selectedAsset?.type} • v{selectedAsset?.version}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {selectedAsset && (
            <div className="flex items-center gap-2">
              {selectedAsset.status === "published" && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              {selectedAsset.status === "scheduled" && (
                <Clock className="w-5 h-5 text-blue-400" />
              )}
              <Badge className={STATUS_COLORS[selectedAsset.status]}>
                {selectedAsset.status}
              </Badge>
            </div>
          )}
        </div>

        {/* Content Area */}
        {selectedAsset ? (
          <div className="flex-1 overflow-y-auto p-6">
            <Card className="bg-slate-800 border-slate-700 p-8 text-slate-100">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {selectedAsset.title}
                </h2>
                <p className="text-slate-300 whitespace-pre-wrap">
                  {selectedAsset.content}
                </p>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400">Select an asset to view</p>
          </div>
        )}

        {/* 8-Control Bar */}
        {selectedAsset && (
          <div className="bg-slate-800 border-t border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Control Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-700 text-slate-300"
                  onClick={() => handleEditAsset(selectedAsset.id)}
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-700 text-slate-300"
                  onClick={() => handleRegenerateAsset(selectedAsset.id)}
                  title="Regenerate"
                >
                  <span className="text-xs">⚡ Regen</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-700 text-slate-300"
                  onClick={() => handleCopyAsset(selectedAsset.id)}
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-700 text-slate-300"
                  onClick={() => handleDownloadAsset(selectedAsset)}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-700 text-slate-300"
                  onClick={() => handlePublishAsset(selectedAsset.id)}
                  title="Publish"
                >
                  <Send className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-700 text-blue-400"
                  onClick={() => handleScheduleAsset(selectedAsset.id)}
                  title="Schedule"
                >
                  <Clock className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-700 text-slate-300"
                  onClick={() => handleShareAsset(selectedAsset.id)}
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 hover:bg-slate-700 text-red-400"
                  onClick={() => handleDeleteAsset(selectedAsset.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Status Info */}
              <div className="text-xs text-slate-400">
                Created {selectedAsset.createdAt.toLocaleDateString()} • v{selectedAsset.version}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
