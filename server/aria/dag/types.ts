// server/aria/dag/types.ts
// Shared type definitions for the ARIA DAG parallel agent architecture

export type AgentName =
  | "strategy"
  | "content"
  | "email"
  | "creative"
  | "video"
  | "landingpage"
  | "seo"
  | "social"
  | "dsp"
  | "crm"
  | "review";

export type IntentType =
  | "launch_product"
  | "write_content"
  | "make_video"
  | "run_ads"
  | "email_campaign"
  | "build_funnel"
  | "post_social"
  | "audit_seo"
  | "analyze_competitor"
  | "full_campaign"
  | "simple_question";

export interface AgentPlan {
  intent: IntentType;
  agentsToRun: AgentName[];
  requiresDAG: boolean;
  confidence: number;
  reasoning: string;
}

export interface CampaignBrief {
  productName: string;
  productDescription: string;
  targetAudience: string;
  ageRange?: string;
  tone: string;
  platforms: string[];
  goals: string[];
  brandVoice: string;
  websiteUrl?: string;
  competitors?: string[];
  budget?: string;
  keyMessages: string[];
}

export interface AssetCount {
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

export interface AgentResult {
  agentName: AgentName;
  success: boolean;
  durationMs: number;
  assets: Partial<AssetCount>;
  summary: string;
  data: Record<string, unknown>;
  error?: string;
}

export interface ReviewIssue {
  type: "tone" | "message" | "cta" | "audience" | "brand_voice";
  description: string;
  agentAffected: AgentName;
  severity: "low" | "medium" | "high";
}

export interface ReviewFix {
  issue: ReviewIssue;
  fixApplied: string;
}

export interface ReviewReport {
  consistent: boolean;
  issues: ReviewIssue[];
  fixes: ReviewFix[];
  consistencyScore: number; // 0-100
  summary: string;
}

export interface DAGResult {
  intent: IntentType;
  agentsActivated: AgentName[];
  agentResults: AgentResult[];
  reviewReport: ReviewReport;
  totalAssets: AssetCount;
  buildTimeMs: number;
  finalResponse: string;
  dagSummary: DAGSummary;
}

export interface DAGSummary {
  type: "dag_summary";
  intent: IntentType;
  agentsActivated: AgentName[];
  agentStatuses: Array<{
    name: AgentName;
    success: boolean;
    durationMs: number;
    summary: string;
  }>;
  totalAssets: AssetCount;
  buildTimeMs: number;
  reviewScore: number;
  reviewIssuesFound: number;
  reviewIssuesFixed: number;
  finalResponse: string;
}
