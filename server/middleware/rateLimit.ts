import type { Request, Response, NextFunction } from "express";

// ─── In-Memory Rate Limiter ────────────────────────────────────────────────────
// Uses a sliding window algorithm. In production, replace with Redis.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function getKey(req: Request, prefix: string): string {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "unknown";
  return `${prefix}:${ip}`;
}

function checkLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key);
  });
}, 5 * 60 * 1000);

// ─── Rate Limit Middleware Factories ─────────────────────────────────────────

/** General API rate limit: 100 requests per minute */
export function apiRateLimit(req: Request, res: Response, next: NextFunction) {
  const { allowed, remaining, resetAt } = checkLimit(getKey(req, "api"), 100, 60_000);
  res.setHeader("X-RateLimit-Limit", "100");
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", Math.ceil(resetAt / 1000).toString());
  if (!allowed) {
    return res.status(429).json({ error: "Too many requests. Please slow down.", retryAfter: Math.ceil((resetAt - Date.now()) / 1000) });
  }
  return next();
}

/** AI endpoint rate limit: 30 requests per minute per IP */
export function aiRateLimit(req: Request, res: Response, next: NextFunction) {
  const { allowed, remaining, resetAt } = checkLimit(getKey(req, "ai"), 30, 60_000);
  res.setHeader("X-RateLimit-Limit", "30");
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", Math.ceil(resetAt / 1000).toString());
  if (!allowed) {
    return res.status(429).json({ error: "AI rate limit exceeded. Please wait before sending more messages.", retryAfter: Math.ceil((resetAt - Date.now()) / 1000) });
  }
  return next();
}

/** Voice transcription rate limit: 10 requests per minute */
export function voiceRateLimit(req: Request, res: Response, next: NextFunction) {
  const { allowed, remaining, resetAt } = checkLimit(getKey(req, "voice"), 10, 60_000);
  res.setHeader("X-RateLimit-Limit", "10");
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", Math.ceil(resetAt / 1000).toString());
  if (!allowed) {
    return res.status(429).json({ error: "Voice transcription rate limit exceeded.", retryAfter: Math.ceil((resetAt - Date.now()) / 1000) });
  }
  return next();
}

/** Auth endpoint rate limit: 10 attempts per 15 minutes */
export function authRateLimit(req: Request, res: Response, next: NextFunction) {
  const { allowed, remaining, resetAt } = checkLimit(getKey(req, "auth"), 10, 15 * 60_000);
  res.setHeader("X-RateLimit-Limit", "10");
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", Math.ceil(resetAt / 1000).toString());
  if (!allowed) {
    return res.status(429).json({ error: "Too many authentication attempts. Please try again later.", retryAfter: Math.ceil((resetAt - Date.now()) / 1000) });
  }
  return next();
}
