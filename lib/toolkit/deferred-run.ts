// Running a backend tool without a serverless duration ceiling.
//
// THE PROBLEM THIS SOLVES
//
// Every free tool that runs in the product backend used to be one request: the
// route dispatched the run and waited for the report inside it. A Vercel route
// can run for 60 seconds. Measured against the production callable on
// 2026-09-02, the runs take:
//
//   social-preview 28s · json-ld-validator 29s · ai-visibility 34s
//   json-ld-generator 37s · markdown-for-agents 46s · alt-text-generator 52s
//   llms-txt-generator 57s · full-page-screenshot 72s
//   persona reviews 116-153s · lookalike-test 146s
//
// So the shape was already broken for the slowest tools, and one slow
// afternoon away from breaking for the rest. The failure is invisible from the
// server: the backend finishes the run and writes a perfectly good report,
// which nobody is left waiting to collect.
//
// THE SHAPE
//
// A run is dispatched once and read many times, and the caller decides how
// long it is willing to hold a request open:
//
//   POST { url }              wait in-request (up to WAIT_BUDGET_MS), then
//                             answer with the report if it arrived, or with a
//                             pending handle if it did not
//   POST { url, defer: true } answer immediately with a pending handle
//   POST { runId }            read that run once (or wait on it, same rule)
//
// The browser sends `defer: true` and polls, so nothing it waits for is
// bounded by a serverless limit. An MCP client or a direct API caller sends
// neither and mostly still gets its answer in one call, exactly as before.
//
// The `{ url }` default is what keeps this backwards compatible: a caller that
// knows nothing about `runId` sees no change for any tool that finishes inside
// the budget.

import {
  isPendingRun,
  pollToolRun,
  startToolRun,
  type BackendRunSuccess,
} from "./superflow-api";
import { recallRun, rememberRun } from "./run-ticket";

/**
 * How long a request will hold itself open waiting for a run, when the caller
 * did not ask to defer.
 *
 * Under the 60 second `maxDuration` the routes declare, with room for the
 * dispatch that precedes it and the response that follows. This is a courtesy
 * to one-call callers, NOT the thing that makes a tool work — that is the
 * polling, which has no ceiling.
 */
export const WAIT_BUDGET_MS = 45_000;

/** Cadence for the in-request wait. The backend suggests its own; this bounds it. */
const MIN_POLL_MS = 1_500;
const MAX_POLL_MS = 8_000;

/** What a run was for. Recovered from the ticket on the polling path. */
export type DeferredContext = {
  /** The cache key the finished result belongs under. */
  cacheKey: string;
  /** The normalized URL the run was started for. */
  cacheUrl: string;
};

/**
 * The three ways a run can leave this module.
 *
 * `context` is null when the ticket could not be read — the result is still
 * returned, it just is not cached. See lib/toolkit/run-ticket.ts.
 */
export type DeferredOutcome =
  | { kind: "result"; result: BackendRunSuccess; context: DeferredContext | null }
  | { kind: "failed"; code: string; message: string }
  | { kind: "pending"; runId: string; pollIntervalSeconds: number };

/** The body a route sends for a run that has not finished yet. */
export type PendingBody = {
  ok: true;
  status: "pending";
  runId: string;
  pollIntervalSeconds: number;
  /**
   * Written for an agent reading the raw JSON, since a browser never shows it.
   * A caller that does not poll would otherwise have to infer what to do from
   * two unfamiliar fields.
   */
  message: string;
};

/**
 * The pending envelope, identical across every tool.
 *
 * @param outcome - The pending outcome to describe.
 */
export function pendingBody(outcome: {
  runId: string;
  pollIntervalSeconds: number;
}): PendingBody {
  return {
    ok: true,
    status: "pending",
    runId: outcome.runId,
    pollIntervalSeconds: outcome.pollIntervalSeconds,
    message: `Still running. Post { "runId": "${outcome.runId}" } to this same endpoint in about ${outcome.pollIntervalSeconds} seconds to collect the result.`,
  };
}

/**
 * How long this request should wait before answering with a handle.
 *
 * @param payload - The parsed request body.
 */
export function waitBudgetFor(payload: unknown): number {
  try {
    const body = payload as { defer?: unknown } | null;
    return body?.defer === true ? 0 : WAIT_BUDGET_MS;
  } catch {
    return WAIT_BUDGET_MS;
  }
}

/**
 * Reads a caller-supplied run id off a request body.
 *
 * Returns "" when there is none, which is what tells a route to start a run
 * rather than resume one. A run id is a Firestore auto-id (20 characters), so
 * anything appreciably longer is not one and is refused before it reaches the
 * store or the backend.
 *
 * @param payload - The parsed request body.
 */
export function runIdFrom(payload: unknown): string {
  try {
    const body = payload as { runId?: unknown } | null;
    const runId = typeof body?.runId === "string" ? body.runId.trim() : "";
    return runId.length > 0 && runId.length <= 128 ? runId : "";
  } catch {
    return "";
  }
}

/**
 * Polls a run until it settles or the budget runs out. Always polls at least
 * once, so a zero budget means exactly one read.
 *
 * @param toolId - The backend tool id.
 * @param runId - The run handle.
 * @param clientIp - Forwarded for the backend's per-IP poll budget.
 * @param waitMs - How long to keep waiting after the first read.
 */
async function waitForRun({
  toolId,
  runId,
  clientIp,
  waitMs,
}: {
  toolId: string;
  runId: string;
  clientIp?: string;
  waitMs: number;
}): Promise<
  | { kind: "result"; result: BackendRunSuccess }
  | { kind: "failed"; code: string; message: string }
  | { kind: "pending"; runId: string; pollIntervalSeconds: number }
> {
  const deadline = Date.now() + Math.max(0, waitMs);

  for (;;) {
    const polled = await pollToolRun({ toolId, runId, clientIp });

    if (!isPendingRun(polled)) {
      return polled.ok
        ? { kind: "result", result: polled }
        : { kind: "failed", code: polled.code, message: polled.message };
    }

    const intervalMs = Math.min(
      MAX_POLL_MS,
      Math.max(MIN_POLL_MS, polled.pollIntervalSeconds * 1000),
    );

    // Only sleep when there is enough budget left to poll again afterwards.
    // Sleeping into the deadline would spend the caller's patience on a wait
    // whose answer nobody reads.
    if (Date.now() + intervalMs >= deadline) {
      return {
        kind: "pending",
        runId,
        pollIntervalSeconds: polled.pollIntervalSeconds,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

/**
 * Dispatches a run, records what it was for, and waits on it for as long as
 * the caller asked.
 *
 * Call this AFTER the cache read and the rate limiter: a run that reaches here
 * is one this caller has paid for.
 *
 * @param toolId - The backend tool id, which is also the agent id.
 * @param slug - The public tool slug, which owns the cache namespace.
 * @param url - The URL to run against, unvalidated; the backend is the authority.
 * @param clientIp - Forwarded so the backend's budgets see the visitor.
 * @param extra - Extra start fields, for the tools that take more than a URL.
 * @param cacheKey - Where the finished result belongs.
 * @param cacheUrl - The normalized URL, for a route that caches under a second key.
 * @param waitMs - From `waitBudgetFor`.
 */
export async function beginRun({
  toolId,
  slug,
  url,
  clientIp,
  extra,
  cacheKey,
  cacheUrl,
  waitMs,
}: {
  toolId: string;
  slug: string;
  url: string;
  clientIp?: string;
  extra?: Record<string, unknown>;
  cacheKey: string;
  cacheUrl: string;
  waitMs: number;
}): Promise<DeferredOutcome> {
  try {
    const started = await startToolRun({
      toolId,
      url,
      clientIp,
      ...(extra && Object.keys(extra).length > 0 ? { extra } : {}),
    });

    if (!started.ok) {
      return { kind: "failed", code: started.code, message: started.message };
    }

    // What this run answers is decided HERE and nowhere else, so a later poll
    // reads it back rather than trusting the caller to restate it.
    const context: DeferredContext = { cacheKey, cacheUrl };
    await rememberRun({ runId: started.runId, slug, cacheKey, cacheUrl });

    if (waitMs <= 0) {
      return {
        kind: "pending",
        runId: started.runId,
        pollIntervalSeconds: started.pollIntervalSeconds,
      };
    }

    const settled = await waitForRun({
      toolId,
      runId: started.runId,
      clientIp,
      waitMs,
    });

    return settled.kind === "result" ? { ...settled, context } : settled;
  } catch {
    return {
      kind: "failed",
      code: "internal",
      message: "Something went wrong running the check. Try again in a moment.",
    };
  }
}

/**
 * Reads a run that was already dispatched and budgeted.
 *
 * Costs the caller nothing: no cache read, no rate limiter, no second
 * dispatch. That is what lets a browser poll every two seconds for three
 * minutes without spending a visitor's hourly allowance on their own report.
 *
 * @param toolId - The backend tool id.
 * @param slug - The public tool slug; a ticket written by a DIFFERENT tool is
 *   ignored, so one tool's endpoint cannot write into another's cache.
 * @param runId - The handle from `beginRun`.
 * @param clientIp - Forwarded for the backend's per-IP poll budget.
 * @param waitMs - From `waitBudgetFor`. Zero means a single read.
 */
export async function resumeRun({
  toolId,
  slug,
  runId,
  clientIp,
  waitMs,
}: {
  toolId: string;
  slug: string;
  runId: string;
  clientIp?: string;
  waitMs: number;
}): Promise<DeferredOutcome> {
  try {
    const settled = await waitForRun({ toolId, runId, clientIp, waitMs });
    if (settled.kind !== "result") return settled;

    const ticket = await recallRun({ runId, slug });
    return {
      kind: "result",
      result: settled.result,
      context: ticket
        ? { cacheKey: ticket.cacheKey, cacheUrl: ticket.cacheUrl }
        : null,
    };
  } catch {
    return {
      kind: "failed",
      code: "internal",
      message: "Something went wrong running the check. Try again in a moment.",
    };
  }
}
