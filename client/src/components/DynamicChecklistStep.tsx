import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight, Sparkles, Lock } from "lucide-react";

interface AssetType {
  id: string;
  name: string;
  category: "content" | "advertising" | "email" | "seo" | "video";
  tier: "free" | "starter" | "pro" | "business" | "agency";
  estimatedTokens: number;
}

// Dynamic checklist based on detected strategy
const ASSET_LIBRARY: AssetType[] = [
  // Content Assets
  { id: "blog", name: "Blog Post (SEO)", category: "content", tier: "free", estimatedTokens: 2000 },
  { id: "social", name: "Social Media Calendar (4 weeks)", category: "content", tier: "free", estimatedTokens: 3000 },
  { id: "email_sequence", name: "Email Welcome Sequence (5 emails)", category: "email", tier: "free", estimatedTokens: 2500 },
  
  // Advertising Assets
  { id: "ad_copy_short", name: "Google Ads Copy Set", category: "advertising", tier: "starter", estimatedTokens: 1500 },
  { id: "ad_copy_long", name: "Facebook Ad Variations (4)", category: "advertising", tier: "starter", estimatedTokens: 2000 },
  { id: "dsp_banners", name: "DSP Banner Set (5 sizes)", category: "advertising", tier: "pro", estimatedTokens: 1800 },
  
  // Landing Pages
  { id: "landing_page", name: "Landing Page Copy", category: "content", tier: "starter", estimatedTokens: 3000 },
  
  // SEO Assets
  { id: "seo_audit", name: "Full SEO Audit Report", category: "seo", tier: "starter", estimatedTokens: 4000 },
  { id: "keyword_research", name: "Keyword Research Matrix", category: "seo", tier: "starter", estimatedTokens: 2500 },
  { id: "aeo_audit", name: "AEO Audit (Answer Engines)", category: "seo", tier: "pro", estimatedTokens: 3500 },
  
  // Video Assets
  { id: "video_script", name: "Product Demo Video Script", category: "video", tier: "pro", estimatedTokens: 2500 },
  { id: "tiktok_script", name: "TikTok Script (3 variations)", category: "video", tier: "pro", estimatedTokens: 1500 },
  { id: "testimonial_video", name: "Customer Testimonial Script", category: "video", tier: "business", estimatedTokens: 2000 },
];

export function DynamicChecklistStep({
  strategy,
  userTier,
  onNext,
}: {
  strategy: any;
  userTier: "free" | "starter" | "pro" | "business" | "agency" | "enterprise";
  onNext: (selectedAssets: AssetType[]) => void;
}) {
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [campaignName, setCampaignName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Filter available assets based on tier and strategy
  const availableAssets = useMemo(() => {
    return ASSET_LIBRARY.filter(asset => {
      // Tier check
      const tierHierarchy = ["free", "starter", "pro", "business", "agency", "enterprise"];
      const userTierIndex = tierHierarchy.indexOf(userTier);
      const assetTierIndex = tierHierarchy.indexOf(asset.tier);
      return userTierIndex >= assetTierIndex;
    }).sort((a, b) => a.estimatedTokens - b.estimatedTokens);
  }, [userTier]);

  // Calculate tokens
  const totalTokens = useMemo(() => {
    return Array.from(selectedAssets).reduce((sum, id) => {
      const asset = ASSET_LIBRARY.find(a => a.id === id);
      return sum + (asset?.estimatedTokens || 0);
    }, 0);
  }, [selectedAssets]);

  // Calculate cost estimate
  const costPerToken = 0.00003; // Rough estimate
  const estimatedCost = (totalTokens * costPerToken).toFixed(2);

  const handleToggleAsset = (assetId: string) => {
    const newSelected = new Set(selectedAssets);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      newSelected.add(assetId);
    }
    setSelectedAssets(newSelected);
  };

  const handleGenerateCampaign = async () => {
    if (!campaignName.trim()) {
      toast.error("Please name your campaign");
      return;
    }

    if (selectedAssets.size === 0) {
      toast.error("Please select at least one asset");
      return;
    }

    setIsGenerating(true);
    const assets = Array.from(selectedAssets)
      .map(id => ASSET_LIBRARY.find(a => a.id === id))
      .filter(Boolean) as AssetType[];

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onNext(assets);
    } catch (error) {
      toast.error("Failed to generate campaign");
      setIsGenerating(false);
    }
  };

  const categories = ["content", "advertising", "email", "seo", "video"] as const;
  const categoryLabels = {
    content: "Content & Copy",
    advertising: "Advertising",
    email: "Email Marketing",
    seo: "SEO & Analytics",
    video: "Video Assets",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">What assets do you need?</h1>
          <p className="text-slate-600">
            Based on your strategy, I've suggested assets. Check the ones you want generated.
          </p>
        </div>

        {/* Campaign Name */}
        <Card className="p-6 mb-8 border-0 shadow-lg">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Campaign Name
          </label>
          <input
            type="text"
            value={campaignName}
            onChange={e => setCampaignName(e.target.value)}
            placeholder="e.g., Q1 Product Launch 2026"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </Card>

        {/* Asset Selection by Category */}
        {categories.map(category => {
          const categoryAssets = availableAssets.filter(a => a.category === category);
          if (categoryAssets.length === 0) return null;

          return (
            <Card key={category} className="p-6 mb-6 border-0 shadow-lg">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                {categoryLabels[category]}
              </h2>

              <div className="space-y-3">
                {categoryAssets.map(asset => {
                  const isLocked = userTier === "free" && asset.tier !== "free";
                  const isSelected = selectedAssets.has(asset.id);

                  return (
                    <div
                      key={asset.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition cursor-pointer ${
                        isLocked
                          ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                      onClick={() => !isLocked && handleToggleAsset(asset.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isLocked}
                        onChange={() => !isLocked && handleToggleAsset(asset.id)}
                      />

                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{asset.name}</p>
                        <p className="text-xs text-slate-500">
                          ~{asset.estimatedTokens.toLocaleString()} tokens
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {asset.tier}
                        </Badge>
                        {isLocked && <Lock className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {/* Summary */}
        <Card className="p-6 mb-8 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-slate-50">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-1">
                Assets Selected
              </p>
              <p className="text-3xl font-bold text-slate-900">{selectedAssets.size}</p>
            </div>

            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-1">
                Estimated Tokens
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {totalTokens.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold mb-1">
                Est. Cost
              </p>
              <p className="text-3xl font-bold text-slate-900">${estimatedCost}</p>
            </div>
          </div>
        </Card>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateCampaign}
          disabled={isGenerating || selectedAssets.size === 0 || !campaignName.trim()}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              Generating Campaign (18-20 seconds)...
            </>
          ) : (
            <>
              Generate Campaign
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {/* Free Tier Upgrade Notice */}
        {userTier === "free" && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>Upgrade to unlock more assets:</strong> Your plan includes basic content assets. 
              Upgrade to Starter ($49/mo) to unlock advertising, video, and advanced SEO tools.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
