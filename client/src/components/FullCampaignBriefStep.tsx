import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, Sparkles, Globe, AlertCircle } from "lucide-react";

interface BriefState {
  input: string;
  isResearching: boolean;
  domain?: string;
  industryGuess?: string;
  strategy?: {
    positioning: string;
    audience: string[];
    competitors: string[];
    channels: string[];
  };
  error?: string;
}

export function FullCampaignBriefStep({
  onNext,
}: {
  onNext: (strategy: any, domain: string) => void;
}) {
  const { user } = useAuth();
  const [brief, setBrief] = useState<BriefState>({
    input: "",
    isResearching: false,
  });

  // tRPC call to research brand/domain
  const researchMutation = trpc.aria.researchBrand.useMutation();

  const handleResearch = async () => {
    if (!brief.input.trim()) {
      toast.error("Please describe what you want to build");
      return;
    }

    setBrief(prev => ({ ...prev, isResearching: true, error: undefined }));

    try {
      // Call tRPC to do web research
      const result = await researchMutation.mutateAsync({
        input: brief.input,
        entryPoint: "new",
      });

      setBrief(prev => ({
        ...prev,
        domain: result.strategy?.brandName || "Unknown",
        industryGuess: "Inferred from content",
        strategy: result.strategy,
        isResearching: false,
      }));

      // Show strategy summary
      toast.success("Strategy analyzed!");
    } catch (error) {
      setBrief(prev => ({
        ...prev,
        error: "Failed to analyze. Try again.",
        isResearching: false,
      }));
      toast.error("Research failed");
    }
  };

  const handleBuildCampaign = () => {
    if (!brief.strategy || !brief.domain) return;
    onNext(brief.strategy, brief.domain);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">ARIA</h1>
          <p className="text-lg text-slate-600">Your AI Marketing Operating System</p>
        </div>

        {/* Main Card */}
        <Card className="p-8 shadow-lg border-0 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              What do you want to build?
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Describe your campaign, product, or marketing goal. I'll research your domain and create a strategy.
            </p>
          </div>

          <Textarea
            value={brief.input}
            onChange={e => setBrief(prev => ({ ...prev, input: e.target.value }))}
            placeholder="e.g., Launch my SaaS product for project management, or Build an email sequence for my e-commerce store, or Write social media content for my fitness coaching business"
            className="h-32 mb-6 text-base"
            disabled={brief.isResearching}
          />

          {/* Error Message */}
          {brief.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{brief.error}</p>
            </div>
          )}

          {/* Research Button */}
          <Button
            onClick={handleResearch}
            disabled={brief.isResearching || !brief.input.trim()}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
          >
            {brief.isResearching ? (
              <>
                <div className="animate-spin mr-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                Researching your domain...
              </>
            ) : (
              <>
                <Globe className="w-5 h-5 mr-2" />
                Research & Create Strategy
              </>
            )}
          </Button>
        </Card>

        {/* Strategy Summary (After Research) */}
        {brief.strategy && (
          <Card className="p-8 shadow-lg border-0 mb-6 bg-gradient-to-br from-blue-50 to-slate-50">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Strategy</h2>

            {brief.domain && (
              <div className="mb-6 p-4 bg-white border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                  Domain Detected
                </p>
                <p className="text-lg font-bold text-slate-900">{brief.domain}</p>
              </div>
            )}

            {brief.industryGuess && (
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">Industry</h3>
                <p className="text-slate-700">{brief.industryGuess}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Positioning</h3>
                <p className="text-sm text-slate-700">{brief.strategy.positioning}</p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Recommended Channels</h3>
                <div className="flex flex-wrap gap-2">
                  {brief.strategy.channels.map((channel, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-medium"
                    >
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3">Target Audience</h3>
              <div className="flex flex-wrap gap-2">
                {brief.strategy.audience.map((aud, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-slate-200 text-slate-900 rounded-full text-xs font-medium"
                  >
                    {aud}
                  </span>
                ))}
              </div>
            </div>

            {brief.strategy.competitors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">Key Competitors</h3>
                <div className="flex flex-wrap gap-2">
                  {brief.strategy.competitors.map((comp, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-red-100 text-red-900 rounded-full text-xs font-medium"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Build Campaign Button */}
            <Button
              onClick={handleBuildCampaign}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
            >
              Next: Build Dynamic Checklist
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          {user?.email}
        </p>
      </div>
    </div>
  );
}
