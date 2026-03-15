import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, AlertTriangle, CheckCircle2, Eye, EyeOff } from "lucide-react";

// WEBSITE ANALYSIS RESULT CARD
export interface WebsiteAnalysisResult {
  type: "website_analysis";
  domain: string;
  domainScore: number;
  monthlyTraffic: number;
  trafficSources: {
    organic: number;
    paid: number;
    social: number;
    direct: number;
  };
  topKeyword: string;
  strengths: string[];
  gaps: string[];
  opportunity: string;
}

export function WebsiteAnalysisCard({ data }: { data: WebsiteAnalysisResult }) {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-50";
    if (score >= 50) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Website Analysis
          </p>
          <h3 className="text-xl font-bold text-slate-900">{data.domain}</h3>
        </div>
        <div className={`text-center px-4 py-2 rounded-lg ${getScoreColor(data.domainScore)}`}>
          <p className="text-3xl font-bold">{data.domainScore}</p>
          <p className="text-xs font-semibold">DA Score</p>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600 font-semibold mb-1">Monthly Traffic</p>
          <p className="text-2xl font-bold text-slate-900">
            {(data.monthlyTraffic / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-slate-500 mt-1">AI Estimate</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600 font-semibold mb-1">Organic %</p>
          <p className="text-2xl font-bold text-slate-900">{data.trafficSources.organic}%</p>
          <p className="text-xs text-slate-500 mt-1">Of traffic</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600 font-semibold mb-1">Paid %</p>
          <p className="text-2xl font-bold text-slate-900">{data.trafficSources.paid}%</p>
          <p className="text-xs text-slate-500 mt-1">Of traffic</p>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-600 font-semibold mb-1">Top Keyword</p>
          <p className="text-sm font-bold text-slate-900 truncate">{data.topKeyword}</p>
          <p className="text-xs text-slate-500 mt-1">Volume: 2.5K</p>
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Strengths
          </h4>
          <ul className="space-y-2">
            {data.strengths.map((s, i) => (
              <li key={i} className="text-sm text-slate-700">• {s}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Gaps
          </h4>
          <ul className="space-y-2">
            {data.gaps.map((g, i) => (
              <li key={i} className="text-sm text-slate-700">• {g}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Opportunity Callout */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded">
        <p className="text-sm font-semibold text-blue-900 mb-1">Quick Win</p>
        <p className="text-sm text-blue-800">{data.opportunity}</p>
      </div>

      {/* Download Button */}
      <Button variant="outline" className="border-slate-300" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Download Full Report
      </Button>
    </Card>
  );
}

// KEYWORD GAP RESULT CARD
export interface KeywordGapResult {
  type: "keyword_gap";
  keywords: Array<{
    keyword: string;
    competitorRank: number;
    yourRank: number;
    volume: number;
    difficulty: number;
    opportunityScore: number;
  }>;
}

export function KeywordGapCard({ data }: { data: KeywordGapResult }) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (i: number) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(i)) newSet.delete(i);
    else newSet.add(i);
    setExpandedRows(newSet);
  };

  return (
    <Card className="p-6 border-0 shadow-lg overflow-x-auto">
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
          Keyword Gap Analysis
        </p>
        <h3 className="text-xl font-bold text-slate-900">Keywords You're Missing</h3>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-3 font-semibold text-slate-700">Keyword</th>
            <th className="text-left py-3 px-3 font-semibold text-slate-700">Competitor Rank</th>
            <th className="text-left py-3 px-3 font-semibold text-slate-700">Your Rank</th>
            <th className="text-left py-3 px-3 font-semibold text-slate-700">Volume</th>
            <th className="text-left py-3 px-3 font-semibold text-slate-700">Difficulty</th>
            <th className="text-left py-3 px-3 font-semibold text-slate-700">Opportunity</th>
          </tr>
        </thead>
        <tbody>
          {data.keywords.map((kw, i) => {
            const opColor =
              kw.opportunityScore >= 75
                ? "text-green-600 bg-green-50"
                : kw.opportunityScore >= 50
                ? "text-amber-600 bg-amber-50"
                : "text-red-600 bg-red-50";

            return (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-3">
                  <p className="font-medium text-slate-900">{kw.keyword}</p>
                </td>
                <td className="py-3 px-3 text-slate-700">#{kw.competitorRank}</td>
                <td className="py-3 px-3 text-slate-700">
                  {kw.yourRank > 100 ? "Not ranking" : `#${kw.yourRank}`}
                </td>
                <td className="py-3 px-3 text-slate-700">{kw.volume.toLocaleString()}</td>
                <td className="py-3 px-3">
                  <Badge variant="outline" className="text-xs">
                    {kw.difficulty}/100
                  </Badge>
                </td>
                <td className="py-3 px-3">
                  <Badge className={`text-xs font-bold ${opColor}`}>
                    {kw.opportunityScore}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Button variant="outline" className="border-slate-300 mt-4" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Download as Excel
      </Button>
    </Card>
  );
}

// TECHNICAL SEO AUDIT RESULT CARD
export interface TechnicalSeoResult {
  type: "technical_seo";
  score: number;
  issues: Array<{
    issue: string;
    severity: "critical" | "warning" | "info";
    fix: string;
  }>;
}

export function TechnicalSeoCard({ data }: { data: TechnicalSeoResult }) {
  const [expandedIssues, setExpandedIssues] = useState<Set<number>>(new Set());

  const severityColor = {
    critical: "bg-red-50 border-red-200 text-red-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
  };

  const severityBadgeColor = {
    critical: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <Card className="p-6 border-0 shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Technical SEO Audit
          </p>
          <h3 className="text-xl font-bold text-slate-900">Site Health Score</h3>
        </div>
        <div className="text-center px-4 py-2 rounded-lg bg-slate-50">
          <p className="text-3xl font-bold text-slate-900">{data.score}</p>
          <p className="text-xs font-semibold text-slate-600">/100</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.issues.map((issue, i) => (
          <div key={i} className={`p-4 rounded-lg border ${severityColor[issue.severity]}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-semibold text-sm">{issue.issue}</p>
                  <Badge className={`text-xs uppercase ${severityBadgeColor[issue.severity]}`}>
                    {issue.severity}
                  </Badge>
                </div>
                <p className="text-sm opacity-90 mb-3">{issue.fix}</p>
                <button className="text-xs font-medium opacity-75 hover:opacity-100">
                  Copy fix
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="border-slate-300 mt-4 w-full" size="sm">
        <Download className="w-4 h-4 mr-2" />
        Download Audit Report
      </Button>
    </Card>
  );
}

// CAMPAIGN SCORE CARD
export interface CampaignScoreResult {
  type: "campaign_score";
  score: number;
  contentScore: number;
  reachScore: number;
  engagementScore: number;
  conversionScore: number;
  recommendation: string;
}

export function CampaignScoreCard({ data }: { data: CampaignScoreResult }) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
          Campaign Score
        </p>
        <div className={`text-6xl font-bold ${getScoreColor(data.score)} mb-2`}>
          {data.score}
        </div>
        <p className="text-slate-600 font-medium">Overall Performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Content", value: data.contentScore },
          { label: "Reach", value: data.reachScore },
          { label: "Engagement", value: data.engagementScore },
          { label: "Conversion", value: data.conversionScore },
        ].map((metric, i) => (
          <div key={i} className="text-center">
            <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
            <p className="text-xs text-slate-600 font-semibold mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Top Recommendation */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-sm font-semibold text-blue-900 mb-1">Top Recommendation</p>
        <p className="text-sm text-blue-800">{data.recommendation}</p>
      </div>
    </Card>
  );
}
