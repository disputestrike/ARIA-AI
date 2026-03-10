// server/aria/dag/orchestrator.ts
// ARIA DAG Orchestrator — analyzes intent, selects agents, runs DAG, assembles results
import type {
  AgentPlan, AgentName, IntentType, AgentResult, DAGResult, DAGSummary,
  CampaignBrief, AssetCount
} from "./types";
import { runStrategyAgent } from "./agents/strategy";
import { runContentAgent } from "./agents/content";
import { runEmailAgent } from "./agents/email";
import { runCreativeAgent } from "./agents/creative";
import { runVideoAgent } from "./agents/video";
import { runLandingPageAgent } from "./agents/landingpage";
import { runSEOAgent } from "./agents/seo";
import { runSocialAgent } from "./agents/social";
import { runDSPAgent } from "./agents/dsp";
import { runCRMAgent } from "./agents/crm";
import { runReviewAgent } from "./agents/review";

// ─── INTENT ANALYSIS ──────────────────────────────────────────────────────────

const INTENT_PATTERNS: Array<{
  pattern: RegExp;
  intent: IntentType;
  agents: AgentName[];
}> = [
  {
    pattern: /full\s*campaign|launch\s*(a\s+)?(product|brand|business|startup|company|supplement|app|service|store)/i,
    intent: "full_campaign",
    agents: ["strategy", "content", "email", "creative", "video", "landingpage", "seo", "social", "dsp", "crm"],
  },
  {
    pattern: /launch\s+\w+|full\s+launch|product\s+launch/i,
    intent: "launch_product",
    agents: ["strategy", "content", "email", "creative", "video", "landingpage", "seo", "social", "dsp", "crm"],
  },
  {
    pattern: /write\s+content|create\s+content|generate\s+content|blog\s+post|article|copywriting/i,
    intent: "write_content",
    agents: ["strategy", "content"],
  },
  {
    pattern: /make\s+(a\s+)?video|create\s+(a\s+)?video|video\s+(ad|script|content)|tiktok\s+video/i,
    intent: "make_video",
    agents: ["strategy", "video"],
  },
  {
    pattern: /run\s+ads|create\s+ads|ad\s+campaign|facebook\s+ads|google\s+ads|meta\s+ads|dsp\s+ads|programmatic/i,
    intent: "run_ads",
    agents: ["strategy", "creative", "dsp"],
  },
  {
    pattern: /email\s+(campaign|sequence|funnel|marketing|drip)|newsletter|email\s+blast/i,
    intent: "email_campaign",
    agents: ["strategy", "email", "crm"],
  },
  {
    pattern: /build\s+(a\s+)?funnel|sales\s+funnel|landing\s+page|opt.?in\s+page|squeeze\s+page/i,
    intent: "build_funnel",
    agents: ["strategy", "landingpage", "email", "crm"],
  },
  {
    pattern: /post\s+on\s+social|social\s+media\s+(post|content|calendar|schedule)|schedule\s+posts?/i,
    intent: "post_social",
    agents: ["strategy", "social", "content"],
  },
  {
    pattern: /seo\s+audit|audit\s+(my\s+)?seo|keyword\s+research|rank\s+(higher|better)|search\s+engine/i,
    intent: "audit_seo",
    agents: ["strategy", "seo"],
  },
  {
    pattern: /analyze\s+(my\s+)?competitor|competitor\s+analysis|spy\s+on|research\s+competitor/i,
    intent: "analyze_competitor",
    agents: ["strategy"],
  },
];

export function analyzeIntent(userMessage: string): AgentPlan {
  const msg = userMessage.toLowerCase();

  for (const { pattern, intent, agents } of INTENT_PATTERNS) {
    if (pattern.test(userMessage)) {
      return {
        intent,
        agentsToRun: agents,
        requiresDAG: agents.length > 1,
        confidence: 0.9,
        reasoning: `Matched pattern for intent: ${intent}`,
      };
    }
  }

  // Fallback: simple question → sequential loop
  return {
    intent: "simple_question",
    agentsToRun: [],
    requiresDAG: false,
    confidence: 0.8,
    reasoning: "No DAG pattern matched — using sequential agent loop",
  };
}

// ─── AGENT RUNNER MAP ─────────────────────────────────────────────────────────

type AgentRunner = (
  userId: number,
  userMessage: string,
  brief: CampaignBrief
) => Promise<AgentResult>;

const AGENT_RUNNERS: Record<AgentName, AgentRunner> = {
  strategy: async () => { throw new Error("Strategy runs separately"); },
  content: runContentAgent,
  email: runEmailAgent,
  creative: runCreativeAgent,
  video: runVideoAgent,
  landingpage: runLandingPageAgent,
  seo: runSEOAgent,
  social: runSocialAgent,
  dsp: runDSPAgent,
  crm: runCRMAgent,
  review: async () => { throw new Error("Review runs separately"); },
};

// ─── ASSET COUNTER ────────────────────────────────────────────────────────────

function sumAssets(results: AgentResult[]): AssetCount {
  const total: AssetCount = {
    contentPieces: 0,
    emailSequences: 0,
    adCreatives: 0,
    videoScripts: 0,
    landingPages: 0,
    socialPosts: 0,
    seoAudits: 0,
    leads: 0,
    campaigns: 0,
  };
  for (const r of results) {
    if (r.assets.contentPieces) total.contentPieces += r.assets.contentPieces;
    if (r.assets.emailSequences) total.emailSequences += r.assets.emailSequences;
    if (r.assets.adCreatives) total.adCreatives += r.assets.adCreatives;
    if (r.assets.videoScripts) total.videoScripts += r.assets.videoScripts;
    if (r.assets.landingPages) total.landingPages += r.assets.landingPages;
    if (r.assets.socialPosts) total.socialPosts += r.assets.socialPosts;
    if (r.assets.seoAudits) total.seoAudits += r.assets.seoAudits;
    if (r.assets.leads) total.leads += r.assets.leads;
    if (r.assets.campaigns) total.campaigns += r.assets.campaigns;
  }
  return total;
}

// ─── RESULT ASSEMBLER ─────────────────────────────────────────────────────────

function assembleResults(
  strategyResult: AgentResult,
  parallelResults: AgentResult[],
  reviewReport: import("./types").ReviewReport,
  brief: CampaignBrief,
  plan: AgentPlan,
  buildTimeMs: number
): DAGResult {
  const allResults = [strategyResult, ...parallelResults];
  const totalAssets = sumAssets(allResults);

  const successCount = parallelResults.filter(r => r.success).length;
  const failCount = parallelResults.filter(r => !r.success).length;

  const assetLines: string[] = [];
  if (totalAssets.contentPieces > 0) assetLines.push(`${totalAssets.contentPieces} content pieces`);
  if (totalAssets.emailSequences > 0) assetLines.push(`${totalAssets.emailSequences} email sequences`);
  if (totalAssets.adCreatives > 0) assetLines.push(`${totalAssets.adCreatives} ad creatives`);
  if (totalAssets.videoScripts > 0) assetLines.push(`${totalAssets.videoScripts} video scripts`);
  if (totalAssets.landingPages > 0) assetLines.push(`${totalAssets.landingPages} landing pages`);
  if (totalAssets.socialPosts > 0) assetLines.push(`${totalAssets.socialPosts} social posts`);
  if (totalAssets.seoAudits > 0) assetLines.push(`${totalAssets.seoAudits} SEO audits`);
  if (totalAssets.campaigns > 0) assetLines.push(`${totalAssets.campaigns} campaigns`);

  const finalResponse = [
    `✅ **${brief.productName} campaign launched** in ${(buildTimeMs / 1000).toFixed(1)}s`,
    ``,
    `**Campaign Brief:** ${brief.targetAudience} | Tone: ${brief.tone} | Platforms: ${brief.platforms.join(", ")}`,
    ``,
    `**Assets Created:** ${assetLines.join(" · ") || "Campaign strategy complete"}`,
    ``,
    `**Agents:** ${successCount} succeeded${failCount > 0 ? `, ${failCount} skipped (missing API keys)` : ""}`,
    `**Review Score:** ${reviewReport.consistencyScore}/100 — ${reviewReport.summary}`,
    reviewReport.fixes.length > 0
      ? `**Auto-fixed:** ${reviewReport.fixes.length} consistency issue${reviewReport.fixes.length > 1 ? "s" : ""}`
      : "",
  ].filter(Boolean).join("\n");

  const dagSummary: DAGSummary = {
    type: "dag_summary",
    intent: plan.intent,
    agentsActivated: [strategyResult.agentName, ...parallelResults.map(r => r.agentName)],
    agentStatuses: allResults.map(r => ({
      name: r.agentName,
      success: r.success,
      durationMs: r.durationMs,
      summary: r.summary,
    })),
    totalAssets,
    buildTimeMs,
    reviewScore: reviewReport.consistencyScore,
    reviewIssuesFound: reviewReport.issues.length,
    reviewIssuesFixed: reviewReport.fixes.length,
    finalResponse,
  };

  return {
    intent: plan.intent,
    agentsActivated: dagSummary.agentsActivated,
    agentResults: allResults,
    reviewReport,
    totalAssets,
    buildTimeMs,
    finalResponse,
    dagSummary,
  };
}

// ─── MAIN DAG RUNNER ──────────────────────────────────────────────────────────

export async function runDAG(
  userId: number,
  userMessage: string,
  plan: AgentPlan
): Promise<DAGResult> {
  const dagStart = Date.now();
  console.log(`[DAG] Starting DAG execution — intent: ${plan.intent}, agents: ${plan.agentsToRun.join(", ")}`);

  // ── Step 1: Strategy Agent (always first, sequential) ──────────────────────
  console.log(`[DAG] [${Date.now() - dagStart}ms] Running StrategyAgent...`);
  const strategyResult = await runStrategyAgent(userId, userMessage);
  const brief = (strategyResult.data as { brief?: CampaignBrief }).brief ?? {
    productName: "Product",
    productDescription: userMessage,
    targetAudience: "General audience",
    tone: "professional",
    platforms: ["Meta", "Google"],
    goals: ["awareness", "conversions"],
    brandVoice: "professional and engaging",
    keyMessages: [userMessage],
  };
  console.log(`[DAG] [${Date.now() - dagStart}ms] StrategyAgent complete — brief: ${brief.productName}`);

  // ── Step 2: Parallel agents ────────────────────────────────────────────────
  const parallelAgentNames = plan.agentsToRun.filter(
    a => a !== "strategy" && a !== "review"
  );

  console.log(`[DAG] [${Date.now() - dagStart}ms] Launching ${parallelAgentNames.length} agents in parallel: ${parallelAgentNames.join(", ")}`);

  const parallelSettled = await Promise.allSettled(
    parallelAgentNames.map(agentName => {
      const runner = AGENT_RUNNERS[agentName];
      const agentStart = Date.now();
      console.log(`[DAG] [${Date.now() - dagStart}ms] → ${agentName} started`);
      return runner(userId, userMessage, brief).then(result => {
        console.log(`[DAG] [${Date.now() - dagStart}ms] ← ${agentName} done in ${Date.now() - agentStart}ms`);
        return result;
      });
    })
  );

  const parallelResults: AgentResult[] = parallelSettled.map((settled, i) => {
    if (settled.status === "fulfilled") return settled.value;
    const agentName = parallelAgentNames[i];
    console.warn(`[DAG] Agent ${agentName} failed:`, settled.reason);
    return {
      agentName,
      success: false,
      durationMs: 0,
      assets: {},
      summary: `${agentName} skipped — ${String(settled.reason?.message ?? "unknown error")}`,
      data: {},
      error: String(settled.reason?.message ?? "unknown error"),
    };
  });

  console.log(`[DAG] [${Date.now() - dagStart}ms] All parallel agents complete`);

  // ── Step 3: Review Agent (always last, sequential) ─────────────────────────
  console.log(`[DAG] [${Date.now() - dagStart}ms] Running ReviewAgent...`);
  const reviewReport = await runReviewAgent(userId, parallelResults, brief);
  console.log(`[DAG] [${Date.now() - dagStart}ms] ReviewAgent complete`);

  const buildTimeMs = Date.now() - dagStart;
  console.log(`[DAG] Total build time: ${buildTimeMs}ms`);

  return assembleResults(strategyResult, parallelResults, reviewReport, brief, plan, buildTimeMs);
}
