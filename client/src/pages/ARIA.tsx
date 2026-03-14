import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Sparkles, Send, Download, Copy, Edit3, Trash2, Clock, CheckCircle,
  AlertCircle, ChevronLeft, Menu, X, LogOut, ArrowRight, Settings, Share2
} from "lucide-react";
import { BrandKitModal } from "@/components/BrandKitModal";
import { SchedulerModal } from "@/components/SchedulerModal";
import { ClientShareModal } from "@/components/ClientShareModal";

// TYPES
interface BriefData {
  input: string;
  strategyJson?: any;
}

interface ChecklistItem {
  id: string;
  name: string;
  type: string;
  estimatedTokens: number;
  selected: boolean;
  locked: boolean;
}

interface ProjectAsset {
  id: string;
  type: string;
  versionNumber: number;
  contentJson: any;
  status: "generating" | "ready" | "published" | "failed";
  regen_count: number;
}

interface Project {
  id: string;
  name: string;
  campaign_score: number;
  assets: Array<{
    id: string;
    type: string;
    status: string;
    versionNumber: number;
    contentJson?: any;
    regen_count?: number;
  }>;
}

type Step = "brief" | "checklist" | "folder";

export default function ARIA() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();

  const [step, setStep] = useState<Step>("brief");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [briefData, setBriefData] = useState<BriefData>({ input: "" });
  const [isResearching, setIsResearching] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [campaignName, setCampaignName] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isBrandKitModalOpen, setIsBrandKitModalOpen] = useState(false);
  const [brandKit, setBrandKit] = useState<any>(null);
  const [isSchedulerModalOpen, setIsSchedulerModalOpen] = useState(false);
  const [schedulerAssetId, setSchedulerAssetId] = useState<string | null>(null);
  const [schedulerPlatform, setSchedulerPlatform] = useState("");
  const [isClientShareModalOpen, setIsClientShareModalOpen] = useState(false);

  // tRPC
  const researchMutation = trpc.aria.researchBrand.useMutation();
  const createProjectMutation = trpc.aria.createProject.useMutation();
  const generateMutation = trpc.aria.generateCampaign.useMutation();
  const updateAssetMutation = trpc.aria.updateAsset.useMutation();
  const publishAssetMutation = trpc.aria.publishAsset.useMutation();
  const saveBrandKitMutation = trpc.aria.saveBrandKit.useMutation();
  const getBrandKitQuery = trpc.aria.getBrandKit.useQuery(undefined, { enabled: !!user });

  // Load brand kit on mount
  useEffect(() => {
    if (getBrandKitQuery.data) {
      setBrandKit(getBrandKitQuery.data);
    }
  }, [getBrandKitQuery.data]);

  const scheduleAssetMutation = trpc.aria.scheduleAsset.useMutation();
  const generateShareLinkMutation = trpc.aria.generateShareLink.useMutation();
  const checkCampaignLimitQuery = trpc.aria.checkCampaignLimit.useQuery();
  const incrementUsageMutation = trpc.aria.incrementCampaignUsage.useMutation();

  const detectEntryPoint = (input: string) => {
    const lower = input.toLowerCase();
    if (["launch", "build", "campaign", "market"].some((k) => lower.includes(k))) return "new";
    if (["website", "analyze", "brand"].some((k) => lower.includes(k))) return "existing";
    if (["write", "make", "create"].some((k) => lower.includes(k))) return "task";
    return "clarify";
  };

  const handleBriefSubmit = async () => {
    if (!briefData.input.trim()) {
      toast.error("Please describe what you want to build");
      return;
    }

    setIsResearching(true);

    try {
      const result = await researchMutation.mutateAsync({
        input: briefData.input,
        entryPoint: detectEntryPoint(briefData.input),
      });

      setBriefData((prev) => ({ ...prev, strategyJson: result.strategy }));
      setCampaignName(result.strategy?.brandName || "New Campaign");

      const items = generateChecklist(result.strategy);
      setChecklistItems(items);
      calculateTokens(items);

      setStep("checklist");
    } catch (err) {
      toast.error("Failed to research brand");
    } finally {
      setIsResearching(false);
    }
  };

  const generateChecklist = (strategy: any) => {
    if (!strategy?.recommendedAssets) return [];
    return strategy.recommendedAssets.map((asset: string) => ({
      id: asset,
      name: formatAssetName(asset),
      type: asset,
      estimatedTokens: estimateTokens(asset),
      selected: true,
      locked: false,
    }));
  };

  const formatAssetName = (type: string) => {
    const names: Record<string, string> = {
      blog: "Blog Post",
      email: "Email Sequence",
      social: "Social Posts",
      ad: "Paid Ads",
      video: "Video",
      landing: "Landing Page",
      seo: "SEO Package",
      dsp: "DSP Campaign",
    };
    return names[type] || type;
  };

  const estimateTokens = (type: string) => {
    const map: Record<string, number> = {
      blog: 2000,
      email: 1500,
      social: 800,
      ad: 1000,
      video: 3000,
      landing: 2500,
      seo: 1200,
      dsp: 1500,
    };
    return map[type] || 1000;
  };

  const calculateTokens = (items: ChecklistItem[]) => {
    const total = items
      .filter((i) => i.selected && !i.locked)
      .reduce((sum, i) => sum + i.estimatedTokens, 0);
    setTotalTokens(total);
  };

  const handleToggleItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleStartCampaign = async () => {
    const selected = checklistItems.filter((i) => i.selected && !i.locked);
    if (selected.length === 0) {
      toast.error("Select at least one asset");
      return;
    }

    setIsGenerating(true);
    setStep("folder");

    try {
      const projectResult = await createProjectMutation.mutateAsync({
        name: campaignName,
        strategy: briefData.strategyJson,
        selectedAssets: selected.map((i) => i.type),
      });

      setProject(projectResult);

      await generateMutation.mutateAsync({
        projectId: projectResult.id,
        strategyJson: briefData.strategyJson,
        selectedAssets: selected.map((i) => i.type),
      });

      toast.success("Campaign generated!");
    } catch (err) {
      toast.error("Failed to generate campaign");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAsset = (asset: any) => {
    navigator.clipboard.writeText(JSON.stringify(asset.contentJson));
    toast.success("Copied!");
  };

  const handleDownloadAsset = (asset: any) => {
    const content = JSON.stringify(asset.contentJson, null, 2);
    const el = document.createElement("a");
    el.href = `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`;
    el.download = `${asset.type}-v${asset.versionNumber}.txt`;
    el.click();
  };

  const handlePublishAsset = async (assetId: string, platform: string) => {
    try {
      await publishAssetMutation.mutateAsync({
        assetId,
        platform,
      });
      toast.success(`Published to ${platform}`);
    } catch (err) {
      toast.error("Failed to publish");
    }
  };

  const handleSaveBrandKit = async (data: any) => {
    try {
      await saveBrandKitMutation.mutateAsync(data);
      setBrandKit(data);
      toast.success("Brand Kit saved!");
    } catch (err) {
      toast.error("Failed to save Brand Kit");
      throw err;
    }
  };

  const handleScheduleAsset = async (assetId: string, scheduledAt: Date) => {
    try {
      const platform = schedulerPlatform || "twitter";
      await scheduleAssetMutation.mutateAsync({
        assetId,
        scheduledAt,
        platform,
      });
      setIsSchedulerModalOpen(false);
      toast.success(`Scheduled for ${scheduledAt.toLocaleString()}`);
    } catch (err) {
      toast.error("Failed to schedule asset");
      throw err;
    }
  };

  const handleGenerateShareLink = async (projectId: string) => {
    try {
      const result = await generateShareLinkMutation.mutateAsync({ projectId });
      return result.shareUrl;
    } catch (err) {
      toast.error("Failed to generate share link");
      throw err;
    }
  };

  const openSchedulerModal = (assetId: string, platform: string = "twitter") => {
    setSchedulerAssetId(assetId);
    setSchedulerPlatform(platform);
    setIsSchedulerModalOpen(true);
  };

  // STEP 1: BRIEF
  if (step === "brief") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <BrandKitModal
          isOpen={isBrandKitModalOpen}
          onClose={() => setIsBrandKitModalOpen(false)}
          initialData={brandKit}
          onSave={handleSaveBrandKit}
        />
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663191442451/Xo3BLWEeUiTMAmf4aBe7Nf/aria-logo_1be63f43.png" alt="ARIA" className="w-12 h-12 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-slate-900">ARIA</h1>
            <p className="text-lg text-slate-600">Your AI Marketing Intelligence Agent</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-700">
                What do you want to build?
              </label>
              <button
                onClick={() => setIsBrandKitModalOpen(true)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Settings className="h-4 w-4" />
                Brand Kit
              </button>
            </div>
            <Textarea
              value={briefData.input}
              onChange={(e) => setBriefData((prev) => ({ ...prev, input: e.target.value }))}
              placeholder="e.g., Launch my coffee subscription or Write a TikTok script"
              className="w-full h-24 text-base mb-4"
            />

            {briefData.strategyJson && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4 text-sm">
                <p className="font-semibold text-blue-900 mb-2">Strategy Found</p>
                <p className="text-blue-800">{briefData.strategyJson.positioning}</p>
              </div>
            )}

            <Button
              onClick={handleBriefSubmit}
              disabled={isResearching || !briefData.input.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold"
            >
              {isResearching ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Build Campaign
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-slate-600 flex items-center justify-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <span>{user?.email}</span>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: CHECKLIST
  if (step === "checklist") {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <button
                onClick={() => setStep("brief")}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2 text-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </button>
              <h2 className="text-2xl font-bold text-slate-900">Campaign Checklist</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Total Tokens</p>
              <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">Strategy Summary</h3>
            <p className="text-slate-700">{briefData.strategyJson?.positioning}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Select Assets</h3>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => handleToggleItem(item.id)}
                    className="h-4 w-4 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.name}</p>
                  </div>
                  <Badge variant="outline">{item.estimatedTokens.toLocaleString()} tokens</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setStep("brief")} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleStartCampaign}
              disabled={isGenerating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-10"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Build Campaign
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: FOLDER
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <SchedulerModal
        isOpen={isSchedulerModalOpen}
        onClose={() => setIsSchedulerModalOpen(false)}
        assetId={schedulerAssetId || ""}
        platform={schedulerPlatform}
        onSchedule={handleScheduleAsset}
      />
      <ClientShareModal
        isOpen={isClientShareModalOpen}
        onClose={() => setIsClientShareModalOpen(false)}
        projectId={project?.id || ""}
        projectName={project?.name || ""}
        onGenerateLink={handleGenerateShareLink}
      />
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-0"} border-r border-slate-200 bg-white transition-all overflow-hidden flex flex-col`}>
        <div className="p-4 border-b">
          <h3 className="font-semibold text-slate-900">{campaignName}</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {project?.assets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setSelectedAssetId(asset.id)}
              className={`w-full text-left px-3 py-2 text-sm rounded ${
                selectedAssetId === asset.id
                  ? "bg-blue-100 text-blue-900 font-medium"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {formatAssetName(asset.type)}
            </button>
          ))}
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-xs">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <span className="truncate text-slate-900">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <h1 className="text-2xl font-bold">{campaignName}</h1>
              {project?.campaign_score && (
                <Badge className="bg-green-100 text-green-800">
                  Score: {project.campaign_score}/100
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
              <Button
                onClick={() => setIsClientShareModalOpen(true)}
                variant="outline"
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {project?.assets.map((asset) => (
              <div
                key={asset.id}
                className={`bg-white rounded-lg border-2 overflow-hidden ${
                  selectedAssetId === asset.id ? "border-blue-500 shadow-lg" : "border-slate-200"
                }`}
              >
                <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">{formatAssetName(asset.type)}</h3>
                  {asset.status === "generating" && <Sparkles className="h-4 w-4 animate-spin text-blue-600" />}
                  {asset.status === "ready" && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {asset.status === "failed" && <AlertCircle className="h-4 w-4 text-red-600" />}
                </div>

                <div className="p-4 min-h-32 max-h-48 overflow-auto text-sm text-slate-700">
                  {asset.contentJson?.title && <p className="font-medium mb-2">{asset.contentJson.title}</p>}
                  {asset.contentJson?.preview && <p>{asset.contentJson.preview}</p>}
                  {!asset.contentJson && <p className="text-slate-400 italic">Generating...</p>}
                </div>

                <div className="p-4 bg-slate-50 border-t grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleCopyAsset(asset)}
                    className="p-2 text-slate-600 hover:bg-white rounded flex items-center justify-center"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadAsset(asset)}
                    className="p-2 text-slate-600 hover:bg-white rounded flex items-center justify-center"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openSchedulerModal(asset.id, "twitter")}
                    className="p-2 text-slate-600 hover:bg-white rounded flex items-center justify-center"
                    title="Schedule"
                  >
                    <Clock className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handlePublishAsset(asset.id, "twitter")}
                    className="p-2 text-slate-600 hover:bg-white rounded flex items-center justify-center"
                    title="Publish"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Bar */}
        <div className="border-t bg-white p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Textarea
              placeholder="Refine your campaign... (e.g., 'make the email funnier')"
              className="h-12 text-sm resize-none"
            />
            <Button className="h-12 px-4 bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
