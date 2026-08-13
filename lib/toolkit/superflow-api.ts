// Client for Superflow's public no-auth free-tools API.
//
// The check engines live in the product backend as agent services, so the
// free tools and the in-product agents run the same code. This module is how
// the marketing site reaches them.
//
// The contract is start/poll on the `anonymoushandler` callable:
//
//   1. `startFreeToolRun` validates the URL, applies the per-IP budget, and
//      dispatches the run. It answers immediately with an `executionId` and
//      the cadence to poll at (`pollIntervalSeconds`).
//   2. `getFreeToolRun` reads the run. Non-terminal polls carry only a
//      status; the terminal poll carries the report (`data`), plus
//      `findings` and `totalFindings`.
//
// The older `runFreeTool` sub-event, which ran the engine inline within the
// callable request, has been REMOVED from the backend. Runs now ride the
// agent execution pipeline, so a single request cannot wait for the answer;
// this client hides the polling behind the same one-call promise the callers
// already use.
//
// Configure with:
//   SUPERFLOW_ANONYMOUS_API_URL   the callable endpoint, e.g.
//     https://<region>-<project>.cloudfunctions.net/anonymoushandler
//
// When it is unset the caller falls back to the in-repo engine, so local dev
// and any deploy that predates the backend release keep working.

import type { VisibilityReport } from "@/lib/tools/ai-visibility/types";

const ENDPOINT = process.env.SUPERFLOW_ANONYMOUS_API_URL ?? "";

/**
 * Ceiling on the whole start-and-poll round trip. The engines' own budget is
 * 30 seconds, so anything still running at 45 has already failed server-side
 * and will never produce a report worth waiting for.
 */
const OVERALL_TIMEOUT_MS = 45_000;

/** Per-request ceiling on the start call. Generous, to survive a cold start. */
const START_TIMEOUT_MS = 20_000;

/** Per-request ceiling on each poll. Polls are cheap reads. */
const POLL_TIMEOUT_MS = 10_000;

/** Poll cadence when the backend does not provide one. */
const DEFAULT_POLL_INTERVAL_SECONDS = 2;

/** Bounds on the backend-provided cadence, so a bad value stays sane. */
const MIN_POLL_INTERVAL_MS = 1_000;
const MAX_POLL_INTERVAL_MS = 10_000;

/** Fallback copy for failures the backend did not phrase itself. */
const TRY_AGAIN_MESSAGE =
  "Something went wrong running the check. Try again in a moment.";
const TIMEOUT_MESSAGE = "The check took too long. Try again in a moment.";

/** True when the backend endpoint is configured. */
export function isBackendConfigured(): boolean {
  return ENDPOINT.length > 0;
}

export type BackendRunFailure = {
  ok: false;
  /** The backend's own errorCode when it produced one, e.g. "invalid-url". */
  code: string;
  /** User-ready copy, safe to render as-is. */
  message: string;
};

export type BackendRunSuccess = {
  ok: true;
  /**
   * The report mapped onto the shape the UI renders. Populated for
   * `ai-visibility`; null for every other tool id, whose reports this module
   * passes through untouched in `data`.
   */
  report: VisibilityReport | null;
  /** The terminal report exactly as the backend returned it. */
  data: unknown;
  /** Structured findings from the run, passed through untouched. */
  findings: unknown[];
  totalFindings: number;
};

export type BackendRunResult = BackendRunSuccess | BackendRunFailure;

/** The `ai-visibility` overload resolves with the mapped report present. */
export type BackendVisibilityRunResult =
  | (BackendRunSuccess & { report: VisibilityReport })
  | BackendRunFailure;

/**
 * The report shape the backend returns for `ai-visibility`. Close to the
 * marketing shape but not identical: it counts redirects rather than listing
 * them, and it has no screenshot because the backend engine never launches a
 * browser for the free tool.
 */
type BackendReport = Omit<
  VisibilityReport,
  "redirects" | "screenshot" | "checkedAt"
> & {
  redirectCount?: number;
  error?: string;
};

/**
 * One callable response's `result` payload. Start, poll, and failure fields
 * are merged into one loose shape because the protocol multiplexes them; the
 * reader checks the discriminants (`success`, `terminal`) before trusting
 * any of it.
 */
type CallableResult = {
  success?: boolean;
  errorCode?: string;
  message?: string;
  executionId?: string;
  toolId?: string;
  url?: string;
  pollIntervalSeconds?: number;
  terminal?: boolean;
  status?: string;
  data?: unknown;
  findings?: unknown[];
  totalFindings?: number;
};

type CallOutcome =
  | { ok: true; result: CallableResult }
  | { ok: false; timedOut: boolean };

/**
 * Maps the backend report onto the shape the UI already renders.
 *
 * Kept as an explicit adapter rather than changing either side: the backend
 * shape is an outbound contract shared with the in-product agent, and the UI
 * shape is what the components consume. A mapping function is the seam.
 *
 * @param backend - The report as the backend returned it.
 */
function toVisibilityReport(backend: BackendReport): VisibilityReport {
  return {
    ...backend,
    // The backend reports how many hops it followed; the UI only renders a
    // count, so synthesize placeholder entries rather than widening the
    // backend contract for a detail nobody displays.
    redirects: Array.from({ length: backend.redirectCount ?? 0 }, () => ({
      from: backend.requestedUrl,
      to: backend.finalUrl,
      status: 301,
    })),
    screenshot: null,
    checkedAt: Date.now(),
  };
}

/**
 * Sends one callable-protocol request and unwraps the `result` envelope.
 *
 * Transport failures (network, HTTP error, malformed body) come back as
 * `{ ok: false }` rather than throwing, so the poll loop can decide whether
 * a failure is fatal or worth retrying on the next tick.
 *
 * @param params - The `data` payload, the per-request timeout, and the
 *   caller IP to forward.
 */
async function callAnonymousHandler({
  data,
  timeoutMs,
  clientIp,
}: {
  data: Record<string, unknown>;
  timeoutMs: number;
  clientIp?: string;
}): Promise<CallOutcome> {
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Firebase callables read the caller IP from the forwarded chain,
        // so the backend's per-IP budget sees the visitor, not this server.
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      },
      // Callable protocol: the payload is wrapped in `data`, and the
      // response comes back wrapped in `result`.
      body: JSON.stringify({ data }),
      signal: AbortSignal.timeout(Math.max(1, timeoutMs)),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, timedOut: false };
    }

    const payload = (await response.json()) as { result?: CallableResult };
    if (!payload?.result || typeof payload.result !== "object") {
      return { ok: false, timedOut: false };
    }

    return { ok: true, result: payload.result };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    return { ok: false, timedOut };
  }
}

/**
 * The poll cadence in milliseconds, from the start response.
 *
 * @param seconds - Whatever the backend sent for `pollIntervalSeconds`.
 */
function pollIntervalMs(seconds: unknown): number {
  const raw =
    typeof seconds === "number" && Number.isFinite(seconds) && seconds > 0
      ? seconds
      : DEFAULT_POLL_INTERVAL_SECONDS;
  return Math.min(
    MAX_POLL_INTERVAL_MS,
    Math.max(MIN_POLL_INTERVAL_MS, Math.round(raw * 1000)),
  );
}

/** Resolves after `ms` milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs a free tool through the Superflow backend: one start call, then a
 * poll every `pollIntervalSeconds` until the run reaches a terminal state,
 * all inside a single 45 second ceiling.
 *
 * Failure copy is the backend's own wherever it produced some, because its
 * messages are written for end users. The exceptions: a run that vanishes
 * mid-poll (`not-found`) reads as a generic try-again to the visitor, since
 * "we lost your run" is not something they can act on differently, and
 * transport-level failures use this module's own generic copy.
 *
 * @param toolId - The tool to run, e.g. "ai-visibility".
 * @param url - The URL to check.
 * @param clientIp - Forwarded so the backend's per-IP budget sees the real
 *   caller rather than this server.
 */
export async function runToolViaBackend(params: {
  toolId: "ai-visibility";
  url: string;
  clientIp?: string;
}): Promise<BackendVisibilityRunResult>;
export async function runToolViaBackend(params: {
  toolId: string;
  url: string;
  clientIp?: string;
}): Promise<BackendRunResult>;
export async function runToolViaBackend({
  toolId,
  url,
  clientIp,
}: {
  toolId: string;
  url: string;
  clientIp?: string;
}): Promise<BackendRunResult> {
  try {
    const deadline = Date.now() + OVERALL_TIMEOUT_MS;

    // ── Start the run ────────────────────────────────────────────────────
    const started = await callAnonymousHandler({
      data: { subEventType: "startFreeToolRun", toolId, url },
      timeoutMs: Math.min(START_TIMEOUT_MS, deadline - Date.now()),
      clientIp,
    });

    if (!started.ok) {
      return {
        ok: false,
        code: started.timedOut ? "timeout" : "backend-error",
        message: started.timedOut ? TIMEOUT_MESSAGE : TRY_AGAIN_MESSAGE,
      };
    }

    const start = started.result;
    if (start.success !== true) {
      // The backend's own refusal: invalid-url, rate-limited,
      // budget-exhausted, internal. Its copy is user-ready, pass it through.
      return {
        ok: false,
        code: start.errorCode ?? "backend-error",
        message: start.message ?? TRY_AGAIN_MESSAGE,
      };
    }

    const executionId = start.executionId;
    if (typeof executionId !== "string" || executionId.length === 0) {
      return { ok: false, code: "backend-error", message: TRY_AGAIN_MESSAGE };
    }

    const intervalMs = pollIntervalMs(start.pollIntervalSeconds);

    // ── Poll until terminal or the ceiling ───────────────────────────────
    while (true) {
      const waitMs = Math.min(intervalMs, deadline - Date.now());
      if (waitMs <= 0) {
        break;
      }
      await sleep(waitMs);

      if (Date.now() >= deadline) {
        break;
      }

      const polled = await callAnonymousHandler({
        data: { subEventType: "getFreeToolRun", executionId },
        timeoutMs: Math.min(POLL_TIMEOUT_MS, deadline - Date.now()),
        clientIp,
      });

      // A dropped poll is not a dropped run: the run is still executing
      // server-side, so ride out transient transport failures and try again
      // on the next tick. The ceiling bounds how long this can go on.
      if (!polled.ok) {
        continue;
      }

      const poll = polled.result;

      if (poll.success !== true) {
        if (poll.errorCode === "not-found") {
          // The run vanished mid-poll. That is our problem, not the
          // visitor's: "start a new one" copy would blame their (valid,
          // already accepted) input, so map it to the generic try-again.
          return { ok: false, code: "not-found", message: TRY_AGAIN_MESSAGE };
        }
        // Terminal run failures (unreachable, internal) arrive here with
        // user-ready copy. Pass them through.
        return {
          ok: false,
          code: poll.errorCode ?? "backend-error",
          message: poll.message ?? TRY_AGAIN_MESSAGE,
        };
      }

      if (poll.terminal !== true) {
        continue;
      }

      // ── Terminal: hand the report to the caller ──────────────────────
      const findings = Array.isArray(poll.findings) ? poll.findings : [];
      const totalFindings =
        typeof poll.totalFindings === "number"
          ? poll.totalFindings
          : findings.length;

      if (toolId === "ai-visibility") {
        if (typeof poll.data !== "object" || poll.data === null) {
          // Terminal with no report should not happen; refuse to render a
          // fabricated one.
          return {
            ok: false,
            code: "backend-error",
            message: TRY_AGAIN_MESSAGE,
          };
        }
        return {
          ok: true,
          report: toVisibilityReport(poll.data as BackendReport),
          data: poll.data,
          findings,
          totalFindings,
        };
      }

      return {
        ok: true,
        report: null,
        data: poll.data ?? null,
        findings,
        totalFindings,
      };
    }

    return { ok: false, code: "timeout", message: TIMEOUT_MESSAGE };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    return {
      ok: false,
      code: timedOut ? "timeout" : "backend-error",
      message: timedOut ? TIMEOUT_MESSAGE : TRY_AGAIN_MESSAGE,
    };
  }
}
