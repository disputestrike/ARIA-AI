import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, BookOpen, Play, ArrowRight } from "lucide-react";

export function EmptyState({
  onNewChat,
}: {
  onNewChat: () => void;
}) {
  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold text-white mb-4">Welcome to ARIA</h1>
          <p className="text-xl text-slate-300 mb-12 leading-relaxed">
            Your AI Marketing Operating System that replaces every marketing tool you currently pay for.
            <br />
            Build a full campaign in 90 seconds. No setup required.
          </p>

          {/* Primary CTA */}
          <Button
            onClick={onNewChat}
            className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-base font-semibold mb-12"
          >
            Start a Conversation
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Quick Start Examples */}
          <div className="space-y-4 mb-12">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
              Try These
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: <Zap className="w-5 h-5" />,
                  title: "Full Campaign",
                  desc: "Launch my SaaS product",
                  color: "border-amber-600 hover:bg-amber-600/10",
                },
                {
                  icon: <BookOpen className="w-5 h-5" />,
                  title: "Existing Brand",
                  desc: "Optimize my website",
                  color: "border-blue-600 hover:bg-blue-600/10",
                },
                {
                  icon: <Play className="w-5 h-5" />,
                  title: "Quick Task",
                  desc: "Write a TikTok script",
                  color: "border-purple-600 hover:bg-purple-600/10",
                },
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={onNewChat}
                  className={`p-4 rounded-lg border-2 transition text-left ${example.color}`}
                >
                  <div className="text-slate-300 mb-2">{example.icon}</div>
                  <p className="text-sm font-semibold text-white">{example.title}</p>
                  <p className="text-xs text-slate-400">{example.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Highlights */}
          <Card className="p-8 border-slate-700 bg-slate-800/50 backdrop-blur mb-12">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-6">
              What You Can Do
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                "Email sequences",
                "Landing pages",
                "Video scripts",
                "Blog posts",
                "Social calendars",
                "Ad copy",
                "SEO audits",
                "Product demos",
                "Competitor analysis",
              ].map((feature, i) => (
                <div key={i} className="text-sm text-slate-300">
                  <Badge variant="outline" className="border-slate-700">
                    {feature}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { label: "Campaigns Created", value: "0" },
              { label: "Assets Generated", value: "0" },
              { label: "This Month", value: "1 of 1" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Help Text */}
          <p className="text-sm text-slate-400">
            💡 Tip: Just describe what you want to build. I'll detect what you need and route you to the right mode.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 px-6 py-4 text-center">
        <p className="text-xs text-slate-500">
          Free plan • 1 campaign/month • <a href="#" className="text-blue-400 hover:underline">Upgrade</a>
        </p>
      </div>
    </div>
  );
}

// DEMO CAMPAIGN (Pre-loaded for new users)
export function DemoCampaign() {
  return (
    <div className="h-screen w-screen flex bg-slate-900">
      {/* Left Sidebar - Asset List */}
      <div className="w-72 bg-slate-950 border-r border-slate-800 p-4 overflow-y-auto">
        <h2 className="font-bold text-white mb-4">Lumos Coffee Co.</h2>
        <p className="text-xs text-slate-400 mb-6">Demo Campaign • Score: 85/100</p>

        <div className="space-y-2">
          {[
            { title: "Product Launch Strategy", type: "strategy", status: "approved" },
            { title: "Email Welcome Series", type: "email", status: "published" },
            { title: "Landing Page Copy", type: "landing", status: "approved" },
            { title: "Social Media Calendar", type: "social", status: "draft" },
            { title: "Google Ads Copy Set", type: "ad", status: "draft" },
            { title: "Product Demo Video Script", type: "video", status: "draft" },
            { title: "Blog Post: Coffee Sustainability", type: "blog", status: "draft" },
          ].map((asset, i) => (
            <button
              key={i}
              className="w-full text-left p-3 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            >
              <p className="text-sm font-medium truncate">{asset.title}</p>
              <p className="text-xs text-slate-500 mt-1">{asset.type}</p>
              <Badge className="mt-2 text-xs" variant={asset.status === "draft" ? "secondary" : "default"}>
                {asset.status}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-slate-900">
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div>
            <h1 className="text-white font-semibold">Product Launch Strategy</h1>
            <p className="text-xs text-slate-400">Approved • v1</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Card className="bg-slate-800 border-slate-700 p-8 text-slate-100 max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6">Product Launch Strategy</h2>

            <div className="prose prose-invert max-w-none space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Brand Positioning</h3>
                <p className="text-slate-300">
                  Lumos Coffee Co. positions itself as the premium, sustainable coffee choice for health-conscious professionals and coffee enthusiasts who value quality and ethical sourcing.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Key Audience</h3>
                <ul className="text-slate-300 list-disc list-inside space-y-1">
                  <li>Remote workers and digital professionals (25-45)</li>
                  <li>Specialty coffee enthusiasts with premium budgets</li>
                  <li>Environmentally conscious consumers</li>
                  <li>Health and wellness focused individuals</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Recommended Channels</h3>
                <ul className="text-slate-300 list-disc list-inside space-y-1">
                  <li>Email marketing (welcome series → nurture)</li>
                  <li>LinkedIn (B2B corporate accounts)</li>
                  <li>Instagram (visual storytelling)</li>
                  <li>Content marketing (blog + SEO)</li>
                  <li>Paid search (Google Ads + Shopping)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">30-Day Roadmap</h3>
                <ul className="text-slate-300 list-disc list-inside space-y-1">
                  <li>Week 1: Launch landing page + email sequence</li>
                  <li>Week 2: Social calendar begins + email nurture</li>
                  <li>Week 3: Activate paid ads (Google, LinkedIn)</li>
                  <li>Week 4: Analyze + optimize based on data</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Control Bar */}
        <div className="bg-slate-800 border-t border-slate-700 px-6 py-4">
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-700 text-slate-300">
              ✏️ Edit
            </Button>
            <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-700 text-slate-300">
              ⚡ Regenerate
            </Button>
            <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-700 text-slate-300">
              📋 Copy
            </Button>
            <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-700 text-slate-300">
              ⬇️ Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
