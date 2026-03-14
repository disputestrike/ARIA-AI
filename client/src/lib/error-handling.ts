// Error handling utilities for ARIA dashboard
import { toast } from "sonner";

export class ARIAError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ARIAError";
  }
}

// Error codes matching Section 4.2 - Error Handling & Circuit Breaker Protocol
export const ERROR_CODES = {
  STRATEGY_AGENT_FAILED: "STRATEGY_AGENT_FAILED",
  PARALLEL_AGENT_TIMEOUT: "PARALLEL_AGENT_TIMEOUT",
  REVIEW_AGENT_LOW_SCORE: "REVIEW_AGENT_LOW_SCORE",
  API_KEY_EXPIRED: "API_KEY_EXPIRED",
  URL_SCRAPE_FAILED: "URL_SCRAPE_FAILED",
  CAMPAIGN_LIMIT_EXCEEDED: "CAMPAIGN_LIMIT_EXCEEDED",
  BRAND_KIT_MISSING: "BRAND_KIT_MISSING",
  DATABASE_UNAVAILABLE: "DATABASE_UNAVAILABLE",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;

export interface ErrorResponse {
  code: string;
  message: string;
  statusCode: number;
  retryable: boolean;
  details?: Record<string, any>;
}

export function createErrorResponse(
  code: string,
  message: string,
  statusCode: number = 500,
  retryable: boolean = true
): ErrorResponse {
  return {
    code,
    message,
    statusCode,
    retryable,
  };
}

export function handleError(error: any): ErrorResponse {
  if (error instanceof ARIAError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      retryable: error.statusCode >= 500,
    };
  }

  if (error?.response?.status === 429) {
    return createErrorResponse(
      "RATE_LIMITED",
      "Too many requests. Please wait a moment and try again.",
      429,
      true
    );
  }

  if (error?.response?.status === 401) {
    return createErrorResponse("UNAUTHORIZED", "Session expired. Please refresh the page.", 401, false);
  }

  if (error?.code === "ECONNREFUSED") {
    return createErrorResponse(
      "NETWORK_ERROR",
      "Cannot connect to server. Please check your connection.",
      503,
      true
    );
  }

  return createErrorResponse("UNKNOWN_ERROR", error?.message || "An unknown error occurred", 500, true);
}

export function showErrorToast(error: ErrorResponse) {
  const messages: Record<string, string> = {
    STRATEGY_AGENT_FAILED: "Failed to analyze brand. Please try rephrasing your request.",
    PARALLEL_AGENT_TIMEOUT: "Generation took too long. Please try a simpler request.",
    CAMPAIGN_LIMIT_EXCEEDED: "You've reached your campaign limit. Upgrade to create more.",
    BRAND_KIT_MISSING: "Please set up your Brand Kit before generating campaigns.",
    URL_SCRAPE_FAILED: "Couldn't reach that website. Upload a PDF or paste brand text instead.",
    API_KEY_EXPIRED: "Connection issue detected. Our team has been notified.",
    NETWORK_ERROR: "Connection issue. Please check your internet and try again.",
  };

  const message = messages[error.code] || error.message;
  toast.error(message);
}

// Circuit breaker for cascading failures
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(
    private failureThreshold: number = 5,
    private resetTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new ARIAError("CIRCUIT_BREAKER_OPEN", "Service temporarily unavailable. Please try again later.", 503);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }

  reset() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      isAvailable: this.state !== "OPEN",
    };
  }
}

// Retry logic with exponential backoff (Section 4.2)
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry non-retryable errors
      if (error.statusCode && error.statusCode < 500) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

// Loading state management
export interface LoadingState {
  brief: boolean;
  checklist: boolean;
  generation: boolean;
  publishing: boolean;
}

export const initialLoadingState: LoadingState = {
  brief: false,
  checklist: false,
  generation: false,
  publishing: false,
};

// Validation helpers
export function validateDomain(domain: string): boolean {
  const domainRegex = /^([a-z0-9](-*[a-z0-9])*\.)+[a-z]{2,}$/i;
  return domainRegex.test(domain);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Sanitization helpers
export function sanitizeHTML(html: string): string {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

export function truncateText(text: string, maxLength: number, suffix: string = "..."): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}
