// Observability layer for ARIA dashboard (Section 16.6)
// Integrates with Sentry (errors), Datadog (metrics), OpenTelemetry (tracing)

interface LogContext {
  userId?: string;
  campaignId?: string;
  assetId?: string;
  agentName?: string;
  timestamp: Date;
  duration?: number;
  [key: string]: any;
}

enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

// Sentry integration (error tracking)
export class SentryLogger {
  static captureException(error: Error, context: LogContext) {
    if (typeof window === "undefined") return; // Server-side

    const sentryDSN = process.env.REACT_APP_SENTRY_DSN;
    if (!sentryDSN) return;

    // Send to Sentry with context
    console.error("[Sentry]", error, context);

    // In production: Sentry.captureException(error, { contexts: { aria: context } });
  }

  static captureMessage(message: string, level: LogLevel, context: LogContext) {
    if (typeof window === "undefined") return;

    console.log(`[${level}]`, message, context);

    // In production: Sentry.captureMessage(message, level.toLowerCase());
  }
}

// Datadog integration (metrics & monitoring)
export class DatadogLogger {
  static logMetric(metricName: string, value: number, tags: Record<string, string> = {}) {
    const metricsData = {
      metric: `aria.${metricName}`,
      value,
      timestamp: Date.now() / 1000,
      tags: Object.entries(tags).map(([k, v]) => `${k}:${v}`),
    };

    console.log("[Datadog Metric]", metricsData);

    // In production: Send to Datadog API
    // fetch('https://api.datadoghq.com/api/v1/series', {
    //   method: 'POST',
    //   headers: { 'DD-API-KEY': DATADOG_API_KEY },
    //   body: JSON.stringify({ series: [metricsData] })
    // });
  }

  static logEvent(eventName: string, properties: Record<string, any> = {}) {
    const event = {
      eventName,
      timestamp: new Date().toISOString(),
      properties,
    };

    console.log("[Datadog Event]", event);

    // Track key business metrics (Section 16.6)
    if (eventName === "campaign_created") {
      this.logMetric("campaign_created_count", 1, {
        tier: properties.tier || "unknown",
      });
    }

    if (eventName === "campaign_completed") {
      this.logMetric("campaign_completion_rate", 1, {
        score: Math.round(properties.score / 10).toString(),
      });
    }

    if (eventName === "asset_regenerated") {
      this.logMetric("asset_regeneration_count", 1, {
        type: properties.assetType || "unknown",
      });
    }
  }
}

// OpenTelemetry integration (distributed tracing)
export class TraceLogger {
  private static spans: Map<string, { start: number; data: any }> = new Map();

  static startSpan(spanName: string, context: Partial<LogContext> = {}) {
    const spanId = `${spanName}-${Date.now()}-${Math.random()}`;
    this.spans.set(spanId, {
      start: Date.now(),
      data: context,
    });

    console.log("[Trace Start]", spanName, spanId);
    return spanId;
  }

  static endSpan(spanId: string, metadata: Record<string, any> = {}) {
    const span = this.spans.get(spanId);
    if (!span) {
      console.warn("[Trace] Unknown span ID:", spanId);
      return;
    }

    const duration = Date.now() - span.start;
    const traceData = {
      spanId,
      duration,
      ...span.data,
      ...metadata,
    };

    console.log("[Trace End]", traceData);

    // Log agent latency (Section 4.5)
    if (metadata.agentName) {
      DatadogLogger.logMetric("agent_latency_ms", duration, {
        agent: metadata.agentName,
      });
    }

    this.spans.delete(spanId);
  }

  static recordDagExecution(duration: number, agentResults: Record<string, any>) {
    DatadogLogger.logMetric("dag_execution_time_ms", duration);
    DatadogLogger.logEvent("dag_completed", {
      duration,
      agents: Object.keys(agentResults).length,
      succeeded: Object.values(agentResults).filter((r) => r.success).length,
    });
  }
}

// Performance monitoring
export class PerformanceMonitor {
  static recordPageLoadTime() {
    if (typeof window === "undefined") return;

    if (window.performance && window.performance.timing) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

      DatadogLogger.logMetric("page_load_time_ms", pageLoadTime);
    }
  }

  static recordApiCallDuration(endpoint: string, duration: number, statusCode: number) {
    DatadogLogger.logMetric("api_call_duration_ms", duration, {
      endpoint,
      status: statusCode.toString(),
    });
  }

  static recordMemoryUsage() {
    if (typeof window === "undefined") return;

    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      DatadogLogger.logMetric("memory_usage_mb", memory.usedJSHeapSize / 1048576);
    }
  }

  static recordUserAction(action: string, properties: Record<string, any> = {}) {
    DatadogLogger.logEvent(`user_action_${action}`, properties);

    // Track key user flows
    if (action === "campaign_created") {
      DatadogLogger.logEvent("funnel_campaign_created", { ...properties });
    }

    if (action === "asset_published") {
      DatadogLogger.logEvent("funnel_asset_published", { ...properties });
    }
  }
}

// Business metrics tracking (Section 16.6)
export class BusinessMetrics {
  static trackActivation(userId: string, assetType: string) {
    DatadogLogger.logEvent("user_activation", {
      userId,
      firstAssetType: assetType,
    });
  }

  static trackCampaignCompletion(campaignId: string, score: number, assetCount: number) {
    DatadogLogger.logEvent("campaign_completion", {
      campaignId,
      score,
      assetCount,
    });
  }

  static trackDSPSpend(campaignId: string, spend: number, managementFee: number) {
    DatadogLogger.logMetric("dsp_spend_total", spend, { campaign: campaignId });
    DatadogLogger.logMetric("dsp_management_fee", managementFee);

    DatadogLogger.logEvent("dsp_campaign_launched", {
      campaignId,
      spend,
      managementFeePercentage: "5%",
    });
  }

  static trackUpgrade(userId: string, fromTier: string, toTier: string) {
    DatadogLogger.logEvent("user_upgraded", {
      userId,
      fromTier,
      toTier,
    });
  }

  static trackChurn(userId: string, reason?: string) {
    DatadogLogger.logEvent("user_churn", {
      userId,
      reason: reason || "unknown",
    });
  }
}

// Debug mode for development
const DEBUG = process.env.NODE_ENV === "development";

export function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[ARIA Debug] ${message}`, data);
  }
}

export function debugError(message: string, error?: any) {
  if (DEBUG) {
    console.error(`[ARIA Error] ${message}`, error);
  }
}
