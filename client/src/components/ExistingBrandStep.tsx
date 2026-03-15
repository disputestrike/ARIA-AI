import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Globe, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface BrandKit {
  id: string;
  domain: string;
  name: string;
  logo?: string;
  colors: string[];
  tone: string;
  targetAudience: string[];
  competitors: string[];
  products: string[];
  existingAssets: string[];
}

interface MissingAsset {
  type: string;
  name: string;
  reason: string;
  priority: "critical" | "high" | "medium";
}

export function ExistingBrandStep({
  input,
  onNext,
}: {
  input: string;
  onNext: (brandKit: BrandKit, missingAssets: MissingAsset[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [missingAssets, setMissingAssets] = useState<MissingAsset[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState("");

  const handleAnalyzeUrl = async () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simulate web scraping and Brand Kit detection
      await new Promise(resolve => setTimeout(resolve, 2000));

      const detectedBrand: BrandKit = {
        id: Date.now().toString(),
        domain: urlInput,
        name: "Acme Coffee Co.",
        colors: ["#2C1810", "#C8A882", "#F5DEB3"],
        tone: "Warm, inviting, expert",
        targetAudience: ["Coffee enthusiasts", "Remote workers", "Health-conscious professionals"],
        competitors: ["Blue Bottle", "Intelligentsia", "Counter Culture"],
        products: ["Single-origin beans", "Espresso blends", "Coffee equipment"],
        existingAssets: ["Website", "Instagram account", "Email list (500 subscribers)"],
      };

      const missing: MissingAsset[] = [
        { type: "email_sequence", name: "Welcome Email Series", reason: "No onboarding flow for new subscribers", priority: "critical" },
        { type: "landing_page", name: "Product Launch Page", reason: "New product launching in 2 weeks", priority: "critical" },
        { type: "seo_audit", name: "SEO Audit & Optimization", reason: "No keyword strategy", priority: "high" },
        { type: "social_calendar", name: "3-Month Social Calendar", reason: "Posting inconsistently", priority: "high" },
        { type: "ad_copy", name: "Google Ads Campaign", reason: "No paid search presence", priority: "medium" },
        { type: "video_script", name: "Product Demo Video", reason: "Missing video content", priority: "medium" },
      ];

      setBrandKit(detectedBrand);
      setMissingAssets(missing);
      toast.success("Brand detected and analyzed!");
    } catch (err) {
      setError("Failed to analyze URL. Please check the address and try again.");
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedWithMissing = () => {
    if (!brandKit) return;
    onNext(brandKit, missingAssets);
  };

  const priorityColor = {
    critical: "bg-red-100 text-red-700 border-red-300",
    high: "bg-amber-100 text-amber-700 border-amber-300",
    medium: "bg-blue-100 text-blue-700 border-blue-300",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">You have an existing brand</h1>
          <p className="text-slate-600">
            I'll analyze your website and load your Brand Kit automatically. Then I'll show you what's missing.
          </p>
        </div>

        {/* URL Input Card */}
        {!brandKit && (
          <Card className="p-8 mb-8 border-0 shadow-lg">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Enter your website or domain
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && handleAnalyzeUrl()}
                  placeholder="https://example.com or example.com"
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  disabled={loading}
                />
                <Button
                  onClick={handleAnalyzeUrl}
                  disabled={loading || !urlInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 h-11 px-6"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Alternative: Upload */}
            <div className="border-t border-slate-200 pt-6">
              <p className="text-sm text-slate-600 mb-4">Or upload a brand document (PDF, doc):</p>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900">Drop brand guidelines here</p>
                <p className="text-xs text-slate-500">or click to browse</p>
              </div>
            </div>
          </Card>
        )}

        {/* Brand Kit Loaded */}
        {brandKit && (
          <>
            {/* Brand Overview */}
            <Card className="p-8 mb-8 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-slate-50">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{brandKit.name}</h2>
                  <p className="text-slate-600">{brandKit.domain}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Brand Colors
                  </p>
                  <div className="flex gap-2">
                    {brandKit.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded border border-slate-300"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Brand Tone
                  </p>
                  <p className="text-sm text-slate-900">{brandKit.tone}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Existing Assets
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {brandKit.existingAssets.map((asset, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {asset}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Target Audience
                  </p>
                  <div className="space-y-1">
                    {brandKit.targetAudience.map((aud, i) => (
                      <p key={i} className="text-sm text-slate-700">• {aud}</p>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Key Competitors
                  </p>
                  <div className="space-y-1">
                    {brandKit.competitors.map((comp, i) => (
                      <p key={i} className="text-sm text-slate-700">• {comp}</p>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Missing Assets */}
            <Card className="p-8 border-0 shadow-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                What's Missing (Build Now)
              </h3>

              <div className="space-y-3 mb-8">
                {missingAssets.map((asset, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border-2 ${priorityColor[asset.priority]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">{asset.name}</p>
                        <p className="text-xs opacity-80">{asset.reason}</p>
                      </div>
                      <Badge className="ml-4 text-xs uppercase tracking-wide">
                        {asset.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleProceedWithMissing}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 font-semibold"
                >
                  Build Missing Assets
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  className="h-11 border-slate-300"
                  onClick={() => {
                    setBrandKit(null);
                    setMissingAssets([]);
                    setUrlInput("");
                  }}
                >
                  Try Different URL
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
