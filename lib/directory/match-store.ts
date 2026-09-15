// Storing match requests, and capping how many one founder can send.
//
// Every request is saved before any email goes out. Two of the three
// numbers the directory is measured on come from this store (how many
// requests were submitted, and what share landed on at least two claimed
// agencies), so a request that was emailed but not recorded is a request
// that did not happen as far as anyone can tell.
//
// The cap is per founder email per day. Without one, a single afternoon
// of enthusiasm empties three agency inboxes per submission and the
// agencies stop opening the mail - which costs every other founder the
// thing the directory is for.

import { kvGet, kvSet, kvSlidingWindow } from "@/lib/toolkit/kv";
import type { MatchRequest } from "./types";

/** How many requests one founder may send per day. */
export const MATCH_REQUESTS_PER_DAY = 3;

/** The window that cap is measured over. */
const MATCH_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Key prefix for the per-founder window. */
const MATCH_RATE_KEY_PREFIX = "directory:match-rate:v1:";

/** Key prefix for a stored request. */
const MATCH_KEY_PREFIX = "directory:match:v1:";

/** Key holding the newest request ids, most recent first. */
const MATCH_INDEX_KEY = "directory:match-index:v1";

/** Retention on a stored request. A year: long enough to answer "how did
 *  the first 30 days go" with the records rather than from memory, and to
 *  see whether a founder who matched in March came back in September. */
const MATCH_TTL_SECONDS = 365 * 24 * 60 * 60;

/** How many ids the index keeps. The index exists to make the recent
 *  requests readable without scanning the keyspace, not to be an
 *  archive - the requests themselves outlive their place in it. */
const MATCH_INDEX_LIMIT = 500;

/** Whether a founder may send another request right now. */
export interface MatchQuota {
  allowed: boolean;
  /** How many of the day's allowance are used, this request included. */
  used: number;
  limit: number;
}

/**
 * Records an attempt against a founder's daily allowance.
 *
 * Keyed on the email rather than the IP: the thing being protected is
 * agency inboxes, and the same person on a phone and a laptop should
 * share one allowance. It is also trivially bypassed with a second
 * address, which is fine - this is a courtesy limit on enthusiasm, not a
 * defence against a determined abuser, and a real abuser is visible in
 * the Slack feed within minutes.
 *
 * Counts blocked attempts too, so hammering the form extends the wait
 * rather than resetting it.
 *
 * @param founderEmail - The address on the submission.
 * @returns Whether to accept this request.
 */
export async function checkMatchQuota(founderEmail: string): Promise<MatchQuota> {
  try {
    const key = `${MATCH_RATE_KEY_PREFIX}${founderEmail.trim().toLowerCase()}`;
    const window = await kvSlidingWindow({
      key,
      windowMs: MATCH_WINDOW_MS,
      maxRequests: MATCH_REQUESTS_PER_DAY,
    });
    return {
      allowed: !window.limited,
      used: window.count,
      limit: MATCH_REQUESTS_PER_DAY,
    };
  } catch {
    // Fail OPEN. A store blip must not stop a founder reaching three
    // agencies; the cost of one extra request is three emails.
    return { allowed: true, used: 0, limit: MATCH_REQUESTS_PER_DAY };
  }
}

/**
 * Generates an id for a request.
 *
 * Time-ordered prefix so the keyspace sorts chronologically, plus random
 * bytes so two submissions in the same millisecond cannot collide.
 *
 * @returns The id, e.g. "m-lz4k9x-8fa2c1".
 */
export function newMatchRequestId(): string {
  try {
    const time = Date.now().toString(36);
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const random = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `m-${time}-${random}`;
  } catch {
    return `m-${Date.now().toString(36)}`;
  }
}

/**
 * Stores a match request and adds it to the recent index.
 *
 * @param request - The request to store.
 * @returns True when the write landed. A false is logged by the caller
 *          and does NOT fail the submission: the founder's brief is
 *          already on its way to three agencies by then, and telling them
 *          it failed would be false.
 */
export async function saveMatchRequest(request: MatchRequest): Promise<boolean> {
  try {
    const stored = await kvSet(
      `${MATCH_KEY_PREFIX}${request.id}`,
      JSON.stringify(request),
      MATCH_TTL_SECONDS,
    );
    if (!stored) return false;

    const rawIndex = await kvGet(MATCH_INDEX_KEY);
    const index: string[] = rawIndex ? (JSON.parse(rawIndex) as string[]) : [];
    const next = [request.id, ...index.filter((id) => id !== request.id)].slice(
      0,
      MATCH_INDEX_LIMIT,
    );
    await kvSet(MATCH_INDEX_KEY, JSON.stringify(next), MATCH_TTL_SECONDS);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads one stored request.
 *
 * @param id - The request id.
 * @returns The request, or null.
 */
export async function getMatchRequest(id: string): Promise<MatchRequest | null> {
  try {
    const raw = await kvGet(`${MATCH_KEY_PREFIX}${id}`);
    return raw ? (JSON.parse(raw) as MatchRequest) : null;
  } catch {
    return null;
  }
}

/**
 * Reads the most recent requests.
 *
 * @param limit - How many to read.
 * @returns Requests, newest first. Ids in the index whose record has
 *          expired are skipped rather than returned as holes.
 */
export async function getRecentMatchRequests(limit = 50): Promise<MatchRequest[]> {
  try {
    const rawIndex = await kvGet(MATCH_INDEX_KEY);
    if (!rawIndex) return [];
    const ids = (JSON.parse(rawIndex) as string[]).slice(0, Math.max(1, limit));
    const records = await Promise.all(ids.map((id) => getMatchRequest(id)));
    return records.filter((record): record is MatchRequest => record !== null);
  } catch {
    return [];
  }
}
