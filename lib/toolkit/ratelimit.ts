// Per-IP rate limiting for the free tools.
//
// Two budgets, matching the brief: heavy tools (render, crawl, LLM) get 10
// runs an hour, light tools (fetch and parse only) get 60. Both are per IP.
//
// The failure mode that matters here is a false positive. These tools have no
// login, so a rate-limit hit is a stranger's first impression of Superflow.
// When the store is unreachable the limiter fails OPEN, and when it does
// limit, the message says exactly when to come back.

import { kvSlidingWindow, isDistributed } from "./kv";

/** Named budgets. Tools pick one rather than inventing numbers. */
export const RATE_LIMITS = {
  /** Headless render, multi-page crawl, or an LLM call. */
  heavy: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
  /** Fetch and parse only. */
  light: { windowMs: 60 * 60 * 1000, maxRequests: 60 },
  /** Multi-page generation with per-page LLM calls. */
  generation: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
  /** Per-image budget for the alt text generator. */
  images: { windowMs: 60 * 60 * 1000, maxRequests: 30 },
} as const;

export type RateLimitTier = keyof typeof RATE_LIMITS;

export type RateLimitDecision = {
  allowed: boolean;
  /** Requests used in the current window. */
  count: number;
  limit: number;
  /** Seconds until the caller can try again. Zero when allowed. */
  retryAfterSeconds: number;
  /** Ready-to-render message. Empty when allowed. */
  message: string;
  /**
   * False when limits are per-instance rather than shared. Useful for a log
   * line; never shown to the user.
   */
  shared: boolean;
};

/**
 * Turns a retry delay into the friendly half of the error message.
 *
 * @param seconds - Seconds until the window frees up.
 */
function retryPhrase(seconds: number): string {
  try {
    if (seconds <= 60) return "in about a minute";
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) return `in about ${minutes} minutes`;
    const hours = Math.ceil(minutes / 60);
    return `in about ${hours} ${hours === 1 ? "hour" : "hours"}`;
  } catch {
    return "shortly";
  }
}

/**
 * Applies a rate limit for one caller and one tool.
 *
 * The key combines tier, tool, and IP so a user who has exhausted the
 * screenshot budget can still run the visibility checker.
 *
 * @param params - Tool slug, client IP, and which budget applies.
 */
export async function applyRateLimit(params: {
  tool: string;
  ip: string;
  tier: RateLimitTier;
}): Promise<RateLimitDecision> {
  const { tool, ip, tier } = params;
  const { windowMs, maxRequests } = RATE_LIMITS[tier];

  try {
    const result = await kvSlidingWindow({
      key: `ratelimit:${tier}:${tool}:${ip}`,
      windowMs,
      maxRequests,
    });

    const retryAfterSeconds = Math.max(
      0,
      Math.ceil(result.retryAfterMs / 1000),
    );

    return {
      allowed: !result.limited,
      count: result.count,
      limit: maxRequests,
      retryAfterSeconds,
      message: result.limited
        ? `You have used all ${maxRequests} free runs for this hour. Try again ${retryPhrase(retryAfterSeconds)}. No signup needed, this is just to keep the tool fast for everyone.`
        : "",
      shared: isDistributed(),
    };
  } catch {
    // Never block on a limiter bug.
    return {
      allowed: true,
      count: 0,
      limit: maxRequests,
      retryAfterSeconds: 0,
      message: "",
      shared: isDistributed(),
    };
  }
}

/**
 * Best-effort client IP for a request.
 *
 * Vercel sets `x-forwarded-for` with the real client first. We take the first
 * entry and fall back to a constant, which buckets unknown callers together.
 * That is the safe direction: the alternative, treating every unknown as
 * unique, makes the limiter useless.
 *
 * @param headers - The incoming request headers.
 */
export function clientIpFrom(headers: Headers): string {
  try {
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
    return headers.get("x-real-ip")?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}
