import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, ArrowRight, FileText } from "lucide-react";

interface TaskResult {
  type: string;
  title: string;
  content: string;
  tokens: number;
  cost: number;
}

export function SpecificTaskStep({
  input,
  onNext,
}: {
  input: string;
  onNext: (result: TaskResult) => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TaskResult | null>(null);

  const handleGenerateTask = async () => {
    setIsGenerating(true);

    try {
      // Simulate immediate execution
      await new Promise(resolve => setTimeout(resolve, 3000));

      const taskResult: TaskResult = {
        type: "email_copy",
        title: `Email: "${input.slice(0, 50)}..."`,
        content: `Subject: Exclusive Offer Inside

Preview: Unlock something special just for you

---

Hi there,

I noticed you've been interested in what we do. I wanted to reach out personally because I think we have something that could genuinely help.

Here's what makes us different:
• We focus on results, not promises
• Our team actually answers support requests
• You get weekly insights tailored to your business

Here's what I'd like to do:

1. Send you a quick 5-minute video showing how this works
2. Let you try it free for 14 days
3. See if it's a fit

No credit card required. No upsell.

[Click here to get started]

Looking forward to working with you,
Team

P.S. If this doesn't seem right, no problem—just let me know and we'll part as friends.`,
        tokens: 1250,
        cost: 0.0375,
      };

      setResult(taskResult);
      toast.success("Task completed in 3 seconds!");
    } catch (error) {
      toast.error("Failed to generate task");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToFolder = () => {
    if (!result) return;
    onNext(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Need one thing fast?</h1>
          <p className="text-slate-600">
            Zero questions. Zero checklist. Just what you asked for.
          </p>
        </div>

        {!result ? (
          /* Generation State */
          <Card className="p-12 border-0 shadow-lg text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <div className="mb-8">
              <p className="text-lg text-slate-700 mb-2">You asked for:</p>
              <p className="text-2xl font-bold text-slate-900 break-words">
                "{input.length > 80 ? input.slice(0, 80) + "..." : input}"
              </p>
            </div>

            <Button
              onClick={handleGenerateTask}
              disabled={isGenerating}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 font-semibold text-base h-12 px-8"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Generating (3-5 seconds)...
                </>
              ) : (
                <>
                  Generate Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {isGenerating && (
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  ✓ Analyzing your request<br />
                  ✓ Running content agents<br />
                  ✓ Quality review<br />
                  ≈ 1-2 seconds remaining
                </p>
              </div>
            )}
          </Card>
        ) : (
          /* Result State */
          <div className="space-y-6">
            {/* Result Card */}
            <Card className="p-8 border-0 shadow-lg">
              <div className="flex items-start gap-3 mb-6">
                <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                    {result.type.replace(/_/g, " ")}
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900">{result.title}</h2>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 mb-6 border border-slate-200">
                <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {result.content}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-100 rounded-lg">
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-1">TOKENS</p>
                  <p className="text-lg font-bold text-slate-900">
                    {result.tokens.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-1">EST. COST</p>
                  <p className="text-lg font-bold text-slate-900">${result.cost.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-semibold mb-1">TIME</p>
                  <p className="text-lg font-bold text-slate-900">3.2s</p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleSaveToFolder}
                className="h-11 bg-blue-600 hover:bg-blue-700 font-semibold"
              >
                Save to Folder
              </Button>

              <Button
                variant="outline"
                className="h-11 border-slate-300"
                onClick={() => {
                  setResult(null);
                  setIsGenerating(false);
                }}
              >
                Generate Another
              </Button>
            </div>

            {/* Options */}
            <Card className="p-6 border-0 shadow-lg bg-slate-50">
              <p className="text-sm font-semibold text-slate-900 mb-4">What's next?</p>
              <div className="space-y-2 text-sm">
                <button className="w-full text-left p-3 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200">
                  <p className="font-medium text-slate-900">Expand into full campaign</p>
                  <p className="text-xs text-slate-600">Generate complementary assets</p>
                </button>
                <button className="w-full text-left p-3 hover:bg-white rounded-lg transition border border-transparent hover:border-slate-200">
                  <p className="font-medium text-slate-900">Save brand preferences</p>
                  <p className="text-xs text-slate-600">Remember your style for next time</p>
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
