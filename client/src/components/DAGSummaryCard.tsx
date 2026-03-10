// client/src/components/DAGSummaryCard.tsx
// Displays the result of a DAG parallel agent execution as a rich summary card
import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Zap, Clock, Star } from "lucide-react";

type AgentName =
  | "strategy" | "content" | "email" | "creative" | "video"
  | "landingpage" | "seo" | "social" | "dsp" | "crm" | "review";

interface AgentStatus {
  name: AgentName;
  success: boolean;
  durationMs: number;
  summary: string;
}

interface AssetCount {
  contentPieces: number;
  emailSequences: number;
  adCreatives: number;
  videoScripts: number;
  landingPages: number;
  socialPosts: number;
  seoAudits: number;
  leads: number;
  campaigns: number;
}

interface DAGSummary {
  type: "dag_summary";
  intent: string;
  agentsActivated: AgentName[];
  agentStatuses: AgentStatus[];
  totalAssets: AssetCount;
  buildTimeMs: number;
  reviewScore: number;
  reviewIssuesFound: number;
  reviewIssuesFixed: number;
  finalResponse: string;
}

const AGENT_LABELS: Record<AgentName, string> = {
  strategy: "Strategy",
  content: "Content",
  email: "Email",
  creative: "Creatives",
  video: "Video",
  landingpage: "Landing Page",
  seo: "SEO",
  social: "Social",
  dsp: "DSP Ads",
  crm: "CRM",
  review: "Review",
};

const AGENT_COLORS: Record<AgentName, string> = {
  strategy: "bg-violet-100 text-violet-700 border-violet-200",
  content: "bg-blue-100 text-blue-700 border-blue-200",
  email: "bg-green-100 text-green-700 border-green-200",
  creative: "bg-pink-100 text-pink-700 border-pink-200",
  video: "bg-red-100 text-red-700 border-red-200",
  landingpage: "bg-orange-100 text-orange-700 border-orange-200",
  seo: "bg-yellow-100 text-yellow-700 border-yellow-200",
  social: "bg-cyan-100 text-cyan-700 border-cyan-200",
  dsp: "bg-indigo-100 text-indigo-700 border-indigo-200",
  crm: "bg-teal-100 text-teal-700 border-teal-200",
  review: "bg-gray-100 text-gray-700 border-gray-200",
};

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function assetLabel(key: keyof AssetCount, value: number): string {
  const labels: Record<keyof AssetCount, string> = {
    contentPieces: "Content",
    emailSequences: "Emails",
    adCreatives: "Creatives",
    videoScripts: "Videos",
    landingPages: "Pages",
    socialPosts: "Posts",
    seoAudits: "SEO",
    leads: "Leads",
    campaigns: "Campaigns",
  };
  return `${value} ${labels[key]}`;
}

export function DAGSummaryCard({ summary }: { summary: DAGSummary }) {
  const [expanded, setExpanded] = useState(false);

  const successCount = summary.agentStatuses.filter(a => a.success).length;
  const failCount = summary.agentStatuses.filter(a => !a.success).length;

  const assetEntries = Object.entries(summary.totalAssets).filter(
    ([, v]) => (v as number) > 0
  ) as Array<[keyof AssetCount, number]>;

  const scoreColor =
    summary.reviewScore >= 85 ? "text-green-600" :
    summary.reviewScore >= 65 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="my-3 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-cyan-50 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-violet-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">
              ARIA DAG — {summary.agentsActivated.length} Agents Activated
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatMs(summary.buildTimeMs)} total
              <span className="mx-1">·</span>
              {successCount} succeeded
              {failCount > 0 && <span className="text-red-500 ml-1">{failCount} skipped</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-500" />
            <span className={`text-sm font-bold ${scoreColor}`}>{summary.reviewScore}/100</span>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Agent pills */}
      <div className="px-4 py-3 flex flex-wrap gap-1.5">
        {summary.agentStatuses.map(agent => (
          <div
            key={agent.name}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${AGENT_COLORS[agent.name]}`}
          >
            {agent.success
              ? <CheckCircle className="w-3 h-3" />
              : <XCircle className="w-3 h-3 opacity-60" />
            }
            {AGENT_LABELS[agent.name]}
            <span className="opacity-60">{formatMs(agent.durationMs)}</span>
          </div>
        ))}
      </div>

      {/* Assets row */}
      {assetEntries.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {assetEntries.map(([key, value]) => (
            <div key={key} className="px-2.5 py-1 bg-white rounded-lg border border-gray-200 text-xs font-medium text-gray-700 shadow-sm">
              {assetLabel(key, value)}
            </div>
          ))}
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-violet-100 px-4 py-3 space-y-2">
          {summary.agentStatuses.map(agent => (
            <div key={agent.name} className="flex items-start gap-2">
              <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${agent.success ? "bg-green-100" : "bg-red-50"}`}>
                {agent.success
                  ? <CheckCircle className="w-3 h-3 text-green-600" />
                  : <XCircle className="w-3 h-3 text-red-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">{AGENT_LABELS[agent.name]}</span>
                  <span className="text-xs text-gray-400">{formatMs(agent.durationMs)}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{agent.summary}</p>
              </div>
            </div>
          ))}
          {summary.reviewIssuesFound > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200 text-xs text-yellow-700">
              {summary.reviewIssuesFound} consistency issue{summary.reviewIssuesFound > 1 ? "s" : ""} found
              {summary.reviewIssuesFixed > 0 && ` · ${summary.reviewIssuesFixed} auto-fixed`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
