// Server-side memory of a dispatched tool run.
//
// A backend-run tool is now two requests: one that starts the run and one (or
// twenty) that poll it. The start request is the only one that knows what
// question was asked — the URL, and the extra fields that go with it — and the
// cache key is built from exactly that. The poll request arrives later carrying
// nothing but a run id.
//
// WHY THE CLIENT IS NOT ASKED TO CARRY THE KEY
//
// The obvious shortcut is to have the browser post the URL back alongside the
// run id and rebuild the key from it. That hands a stranger the ability to
// store the review of one site under another site's cache key: start a run for
// their own page, poll it claiming a competitor's URL, and for the next 24
// hours everyone who checks the competitor is served a report about a page they
// never asked about. So the key is written here at start time, under the run
// id, and the poll can only read back what the start request itself decided.
//
// WHEN THE TICKET IS GONE
//
// This rides the same KV store as the result cache, so it has the same
// reachability: with Upstash configured both work, and without it neither does
// (the in-memory fallback is per-instance, and a poll rarely lands on the
// instance that started the run). A missing ticket therefore means the cache
// write is skipped for that run — never that the visitor loses their report.

import { kvGet, kvSet } from "./kv";

/**
 * How long a ticket outlives its start call.
 *
 * The slowest tools take about three minutes. Fifteen covers a visitor who
 * leaves the tab open, and expires long before the run id could be reused.
 */
const TICKET_TTL_SECONDS = 15 * 60;

/** What a start request knows and a poll request needs. */
export type RunTicket = {
  /** The tool slug that started the run. */
  slug: string;
  /** The cache key the finished result belongs under. */
  cacheKey: string;
  /**
   * The normalized URL the run was started for.
   *
   * Several tools cache a result under a second key derived from the URL the
   * run actually landed on after redirects, and need the requested URL to
   * compare against. Empty when the ticket predates this field.
   */
  cacheUrl: string;
};

/**
 * The KV key for one run's ticket.
 *
 * @param runId - The backend executionId.
 */
function ticketKey(runId: string): string {
  return `toolrun:${runId}`;
}

/**
 * Records what a dispatched run is for, so the poll that finishes it can cache
 * the result under the right key.
 *
 * Failures are swallowed: a run that cannot be remembered still returns its
 * report, it just is not cached.
 *
 * @param runId - The backend executionId.
 * @param slug - The tool slug that started the run.
 * @param cacheKey - The key the finished result belongs under.
 * @param cacheUrl - The normalized URL the run was started for.
 */
export async function rememberRun({
  runId,
  slug,
  cacheKey,
  cacheUrl,
}: {
  runId: string;
  slug: string;
  cacheKey: string;
  cacheUrl: string;
}): Promise<void> {
  try {
    const ticket: RunTicket = { slug, cacheKey, cacheUrl };
    await kvSet(ticketKey(runId), JSON.stringify(ticket), TICKET_TTL_SECONDS);
  } catch {
    // Intentionally ignored. See the module note.
  }
}

/**
 * Reads back what a run was for.
 *
 * Returns null when the ticket is missing, malformed, or was written by a
 * DIFFERENT tool. That last check is what stops one tool's poll endpoint from
 * writing into another tool's cache namespace when a caller pairs a real run id
 * with the wrong slug.
 *
 * @param runId - The backend executionId, as sent by the caller.
 * @param slug - The tool slug of the route serving this poll.
 */
export async function recallRun({
  runId,
  slug,
}: {
  runId: string;
  slug: string;
}): Promise<RunTicket | null> {
  try {
    if (typeof runId !== "string" || runId.trim().length === 0) return null;

    const raw = await kvGet(ticketKey(runId));
    if (raw === null) return null;

    const ticket = JSON.parse(raw) as RunTicket;
    if (
      ticket === null ||
      typeof ticket !== "object" ||
      typeof ticket.cacheKey !== "string" ||
      ticket.slug !== slug
    ) {
      return null;
    }

    return { ...ticket, cacheUrl: typeof ticket.cacheUrl === "string" ? ticket.cacheUrl : "" };
  } catch {
    return null;
  }
}
