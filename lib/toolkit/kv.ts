// Key-value store for tool caching and rate limiting.
//
// Talks to Upstash Redis over its REST API using plain `fetch`, so this adds
// no npm dependency. When Upstash is not configured (local dev, preview
// deploys, or before the env vars are set in production) it degrades to a
// per-instance in-memory Map.
//
// The degradation is deliberate and is NOT silent: `isDistributed()` reports
// which mode is active so the rate limiter can be honest about the fact that
// per-instance limits are weaker than shared ones.
//
// Env vars (Upstash's standard names, so this works with the Vercel
// integration without renaming anything):
//   UPSTASH_REDIS_REST_URL
//   UPSTASH_REDIS_REST_TOKEN

const REST_URL = process.env.UPSTASH_REDIS_REST_URL ?? "";
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

/** How long a single Upstash round trip may take before we give up on it. */
const KV_TIMEOUT_MS = 2500;

/** Cap on the in-memory fallback so a long-lived instance cannot grow forever. */
const MEMORY_MAX_ENTRIES = 2000;

type MemoryEntry = { value: string; expiresAt: number };

/** Fallback store. Per-instance, so it is a cache, never a source of truth. */
const memory = new Map<string, MemoryEntry>();

/** Fallback sorted sets for the rate limiter, keyed the same way. */
const memoryWindows = new Map<string, number[]>();

/** True when a real shared store is configured. */
export function isDistributed(): boolean {
  return REST_URL.length > 0 && REST_TOKEN.length > 0;
}

/**
 * Drops expired entries and, if still over the cap, the oldest ones.
 * Runs opportunistically on write rather than on a timer.
 */
function pruneMemory(): void {
  try {
    const now = Date.now();
    for (const [key, entry] of memory) {
      if (entry.expiresAt <= now) memory.delete(key);
    }
    if (memory.size <= MEMORY_MAX_ENTRIES) return;

    const overflow = memory.size - MEMORY_MAX_ENTRIES;
    let removed = 0;
    for (const key of memory.keys()) {
      memory.delete(key);
      removed += 1;
      if (removed >= overflow) break;
    }
  } catch {
    // A prune failure is not worth failing a request over.
  }
}

/**
 * Sends a command array to Upstash's pipeline endpoint.
 *
 * @param commands - Redis commands, each as an argv array.
 * @returns The `result` of each command, or null when the call failed.
 */
async function pipeline(commands: string[][]): Promise<unknown[] | null> {
  if (!isDistributed()) return null;

  try {
    const response = await fetch(`${REST_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(KV_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as Array<{
      result?: unknown;
      error?: string;
    }>;
    if (!Array.isArray(payload)) return null;

    return payload.map((item) => (item?.error ? null : (item?.result ?? null)));
  } catch {
    // Timeout, network error, or malformed response. The caller treats a null
    // as "store unavailable" and carries on without it.
    return null;
  }
}

/**
 * Reads a string value.
 *
 * @param key - The key to read.
 * @returns The value, or null when absent or unreachable.
 */
export async function kvGet(key: string): Promise<string | null> {
  try {
    if (isDistributed()) {
      const results = await pipeline([["GET", key]]);
      const value = results?.[0];
      return typeof value === "string" ? value : null;
    }

    const entry = memory.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      memory.delete(key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

/**
 * Writes a string value with a TTL.
 *
 * @param key - The key to write.
 * @param value - The value to store.
 * @param ttlSeconds - Time to live.
 * @returns True when the write landed.
 */
export async function kvSet(
  key: string,
  value: string,
  ttlSeconds: number,
): Promise<boolean> {
  try {
    if (isDistributed()) {
      const results = await pipeline([
        ["SET", key, value, "EX", String(Math.max(1, Math.floor(ttlSeconds)))],
      ]);
      return results !== null;
    }

    memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    pruneMemory();
    return true;
  } catch {
    return false;
  }
}

/**
 * Deletes a key.
 *
 * @param key - The key to remove.
 */
export async function kvDelete(key: string): Promise<void> {
  try {
    if (isDistributed()) {
      await pipeline([["DEL", key]]);
      return;
    }
    memory.delete(key);
  } catch {
    // Nothing to do.
  }
}

export type WindowResult = {
  /** Requests already counted in the current window, including this one. */
  count: number;
  /** True when this request is over the limit. */
  limited: boolean;
  /** Milliseconds until the oldest request ages out of the window. */
  retryAfterMs: number;
};

/**
 * Records a hit against a sliding window and reports whether it is over the
 * limit.
 *
 * Blocked attempts still count toward the window. That makes the limiter get
 * stricter under sustained abuse, which is the behaviour you want on a free
 * public endpoint, and it means a caller who backs off recovers on schedule.
 *
 * Falls back to a per-instance window when Upstash is not configured. That is
 * a real weakening on multi-instance serverless: use `isDistributed()` if you
 * need to know.
 *
 * @param params - The window key, size, and limit.
 */
export async function kvSlidingWindow(params: {
  key: string;
  windowMs: number;
  maxRequests: number;
}): Promise<WindowResult> {
  const { key, windowMs, maxRequests } = params;
  const now = Date.now();
  const cutoff = now - windowMs;

  try {
    if (isDistributed()) {
      // A unique member per hit; the score is the timestamp so the window
      // trims by score.
      const member = `${now}-${Math.random().toString(36).slice(2, 10)}`;
      const results = await pipeline([
        ["ZREMRANGEBYSCORE", key, "0", String(cutoff)],
        ["ZADD", key, String(now), member],
        ["ZCARD", key],
        ["PEXPIRE", key, String(windowMs)],
      ]);

      if (results === null) {
        // Store unreachable. Fail OPEN rather than locking every user out of
        // a free tool because Redis blipped.
        return { count: 0, limited: false, retryAfterMs: 0 };
      }

      const count = typeof results[2] === "number" ? results[2] : 0;
      return {
        count,
        limited: count > maxRequests,
        retryAfterMs: count > maxRequests ? windowMs : 0,
      };
    }

    const hits = (memoryWindows.get(key) ?? []).filter(
      (timestamp) => timestamp > cutoff,
    );
    hits.push(now);
    memoryWindows.set(key, hits);

    // Opportunistic cleanup so idle keys do not accumulate.
    if (memoryWindows.size > MEMORY_MAX_ENTRIES) {
      for (const [existingKey, timestamps] of memoryWindows) {
        if (timestamps.every((timestamp) => timestamp <= cutoff)) {
          memoryWindows.delete(existingKey);
        }
      }
    }

    return {
      count: hits.length,
      limited: hits.length > maxRequests,
      retryAfterMs: hits.length > maxRequests ? hits[0] + windowMs - now : 0,
    };
  } catch {
    return { count: 0, limited: false, retryAfterMs: 0 };
  }
}
