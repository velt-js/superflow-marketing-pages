// Typed JSON cache for tool results.
//
// Every checker caches on the normalized URL so a shared link ("look at our
// score") does not re-run a 15-second job for each person who opens it, and
// so a re-run after a fix is a deliberate click rather than the default.
//
// Cached entries carry their own `checkedAt`, which the UI renders as
// "checked 3 hours ago" next to a re-run button. That is the contract from
// the brief: cached results render instantly and are labelled as cached.

import { kvGet, kvSet, kvDelete } from "./kv";
import { cacheKeyFor } from "./url";

/** Cache lifetimes, in seconds. */
export const CACHE_TTL = {
  /** Checkers: a site's answer rarely changes within a day. */
  checker: 24 * 60 * 60,
  /** Generated llms.txt: expensive to produce, slow to go stale. */
  generator: 7 * 24 * 60 * 60,
  /** Screenshots: cheap to redo, and staleness is obvious. */
  screenshot: 60 * 60,
} as const;

export type CachedEnvelope<T> = {
  /** Epoch milliseconds when the result was produced. */
  checkedAt: number;
  /** Schema version, so a shape change invalidates old entries. */
  version: number;
  data: T;
};

export type CacheHit<T> = {
  data: T;
  checkedAt: number;
  /** Whole seconds since the result was produced. */
  ageSeconds: number;
};

/**
 * Builds the cache key for a tool run.
 *
 * The tool slug is part of the key so two tools checking the same URL never
 * collide, and the version is part of it so a schema change does not serve a
 * stale shape to new code.
 *
 * @param params - Tool slug, URL, and schema version.
 */
export function toolCacheKey(params: {
  tool: string;
  url: string;
  version: number;
  /** Optional extra dimensions, e.g. viewport width for a screenshot. */
  variant?: string;
}): string {
  try {
    const { tool, url, version, variant } = params;
    const base = `tools:${tool}:v${version}:${cacheKeyFor(url)}`;
    return variant ? `${base}:${variant}` : base;
  } catch {
    return `tools:${params.tool}:v${params.version}:${params.url}`;
  }
}

/**
 * Reads a cached tool result.
 *
 * Returns null on a miss, on a version mismatch, or when the store is
 * unreachable. Callers treat all three the same way: run the check.
 *
 * @param key - A key from `toolCacheKey`.
 * @param version - The schema version the caller understands.
 */
export async function readCache<T>(
  key: string,
  version: number,
): Promise<CacheHit<T> | null> {
  try {
    const raw = await kvGet(key);
    if (raw === null) return null;

    const envelope = JSON.parse(raw) as CachedEnvelope<T>;
    if (
      envelope === null ||
      typeof envelope !== "object" ||
      envelope.version !== version ||
      typeof envelope.checkedAt !== "number"
    ) {
      return null;
    }

    return {
      data: envelope.data,
      checkedAt: envelope.checkedAt,
      ageSeconds: Math.max(0, Math.round((Date.now() - envelope.checkedAt) / 1000)),
    };
  } catch {
    return null;
  }
}

/**
 * Writes a tool result to the cache. Failures are swallowed: a cache write is
 * never worth failing a completed check over.
 *
 * @param key - A key from `toolCacheKey`.
 * @param version - The schema version of `data`.
 * @param data - The result to store.
 * @param ttlSeconds - How long to keep it.
 */
export async function writeCache<T>(
  key: string,
  version: number,
  data: T,
  ttlSeconds: number,
): Promise<void> {
  try {
    const envelope: CachedEnvelope<T> = {
      checkedAt: Date.now(),
      version,
      data,
    };
    await kvSet(key, JSON.stringify(envelope), ttlSeconds);
  } catch {
    // Intentionally ignored.
  }
}

/**
 * Drops a cached result, used by the "re-run" button so the fresh run is
 * genuinely fresh.
 *
 * @param key - A key from `toolCacheKey`.
 */
export async function invalidateCache(key: string): Promise<void> {
  await kvDelete(key);
}

/**
 * Formats a cache age as the UI phrase. Plain words, no em dashes.
 *
 * @param ageSeconds - Seconds since the result was produced.
 */
export function formatCacheAge(ageSeconds: number): string {
  try {
    if (ageSeconds < 60) return "just now";
    const minutes = Math.floor(ageSeconds / 60);
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } catch {
    return "recently";
  }
}
