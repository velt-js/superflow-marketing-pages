// The browser half of the free-tools run contract.
//
// Every backend-run tool endpoint answers a start request with either the
// finished result or a pending handle, and this is what turns that into the
// single promise the tool components already expect:
//
//   const payload = await runToolRequest<Payload>({ endpoint, body });
//
// WHY THE BROWSER DOES THE WAITING
//
// The runs are slow — a page load, sometimes a headless render, usually an LLM
// call — and a Vercel route may run for 60 seconds. Waiting server-side capped
// every tool at that ceiling and broke the ones past it outright: the persona
// reviews (116-153s) and the full page screenshot (72s) answered "the check
// took too long" every time, while the backend was returning a perfectly good
// report nobody was left to collect. A browser tab has no such ceiling.
//
// The endpoint contract this drives is described in lib/toolkit/deferred-run.ts.

/** Sent on every request so the endpoint answers with a handle, not a wait. */
const DEFER = { defer: true } as const;

/**
 * How long to wait for a result before giving up.
 *
 * Sized for the slowest tool on the site — the persona reviews, measured at
 * 116 to 153 seconds — with room for a cold backend on top. It exists only so
 * a spinner cannot run forever.
 */
const DEFAULT_CEILING_MS = 4 * 60 * 1000;

/** Bounds on the cadence the endpoint asks for, so a bad value stays sane. */
const MIN_POLL_MS = 2_000;
const MAX_POLL_MS = 10_000;

/** Past this, polls widen: the answer is not seconds away. */
const SLOW_POLL_AFTER_MS = 45_000;
const SLOW_POLL_MS = 5_000;

/**
 * Consecutive poll failures ridden out before a run is called dead.
 *
 * The backend answers `not-found` for a genuinely unknown run AND for any
 * transient failure to read a real one — it collapses the two deliberately, so
 * the endpoint cannot be used to enumerate which runs exist. That makes a
 * single `not-found` weak evidence that a run is gone, and abandoning a two
 * minute run on it would throw away a report that is still coming.
 */
const TRANSIENT_FAILURE_TOLERANCE = 2;

/** Failure codes that may be a blip rather than a verdict. */
const TRANSIENT_CODES = new Set(["not-found", "backend-error", "timeout"]);

/** Thrown when a run never produced an answer. Carries copy fit to render. */
export class ToolRunError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ToolRunError";
    this.code = code;
  }
}

/** The pending envelope, the one shape this module consumes itself. */
type PendingPayload = {
  status?: string;
  runId?: string;
  pollIntervalSeconds?: number;
};

/** Resolves after `ms` milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The run handle on a response, or null when the response is a final answer.
 *
 * @param payload - A parsed response body.
 */
function pendingHandle(
  payload: unknown,
): { runId: string; pollIntervalSeconds: number } | null {
  try {
    if (typeof payload !== "object" || payload === null) return null;
    const body = payload as PendingPayload;
    if (body.status !== "pending" || typeof body.runId !== "string") return null;
    if (body.runId.length === 0) return null;
    return {
      runId: body.runId,
      pollIntervalSeconds:
        typeof body.pollIntervalSeconds === "number" ? body.pollIntervalSeconds : 2,
    };
  } catch {
    return null;
  }
}

/**
 * The failure code on a response, whichever envelope the tool uses.
 *
 * The suite has two: `{ ok: false, code }` on the report-style endpoints, and
 * `{ error, errorCode }` on the ones whose UI reads `.error`. Both are final
 * answers to the component; this only reads them to decide whether a failure
 * arriving MID-POLL is worth riding out.
 *
 * @param payload - A parsed response body.
 */
function failureCode(payload: unknown): string | null {
  try {
    if (typeof payload !== "object" || payload === null) return null;
    const body = payload as {
      ok?: unknown;
      code?: unknown;
      error?: unknown;
      errorCode?: unknown;
    };

    const failed = body.ok === false || typeof body.error === "string";
    if (!failed) return null;

    if (typeof body.code === "string") return body.code;
    if (typeof body.errorCode === "string") return body.errorCode;
    return "unknown";
  } catch {
    return null;
  }
}

/**
 * Runs one tool and resolves with its final payload, whatever shape that tool
 * uses. Pending responses are consumed here and never reach the caller.
 *
 * @param endpoint - The tool's own endpoint, e.g. "/api/tools/llms-txt-generator".
 * @param body - The request body: the URL, plus whatever else the tool takes.
 * @param onWait - Called on each poll with the seconds waited so far, for a
 *   status line that can say something different at ten seconds and at ninety.
 * @param ceilingMs - How long to wait before giving up.
 * @throws {ToolRunError} When the run never answered.
 */
export async function runToolRequest<T>({
  endpoint,
  body,
  onWait,
  ceilingMs = DEFAULT_CEILING_MS,
}: {
  endpoint: string;
  body: Record<string, unknown>;
  onWait?: (waitedSeconds: number) => void;
  ceilingMs?: number;
}): Promise<T> {
  const startedAt = Date.now();

  const post = async (payload: Record<string, unknown>): Promise<unknown> => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, ...DEFER }),
    });
    return (await response.json()) as unknown;
  };

  const started = await post(body);
  let handle = pendingHandle(started);
  if (!handle) return started as T;

  let intervalMs = Math.min(
    MAX_POLL_MS,
    Math.max(MIN_POLL_MS, handle.pollIntervalSeconds * 1000),
  );
  let consecutiveFailures = 0;

  while (Date.now() - startedAt < ceilingMs) {
    await sleep(intervalMs);
    onWait?.(Math.round((Date.now() - startedAt) / 1000));

    let polled: unknown;
    try {
      polled = await post({ runId: handle.runId });
    } catch {
      // A dropped poll is not a dropped run: it is executing on the backend
      // either way, so ride it out.
      consecutiveFailures += 1;
      if (consecutiveFailures > TRANSIENT_FAILURE_TOLERANCE) {
        throw new ToolRunError(
          "Could not reach the check. Try again in a moment.",
          "network",
        );
      }
      continue;
    }

    const code = failureCode(polled);
    if (code !== null && TRANSIENT_CODES.has(code)) {
      consecutiveFailures += 1;
      if (consecutiveFailures <= TRANSIENT_FAILURE_TOLERANCE) continue;
      return polled as T;
    }

    consecutiveFailures = 0;

    const next = pendingHandle(polled);
    if (!next) return polled as T;

    handle = next;
    // The endpoint's cadence is the floor, and the wait so far can only widen
    // it. Runs last minutes and the backend caps status reads per IP per
    // minute, so holding a two second cadence for a whole run would sit on
    // that cap and throttle a visitor out of their own result.
    const floor =
      Date.now() - startedAt > SLOW_POLL_AFTER_MS ? SLOW_POLL_MS : MIN_POLL_MS;
    intervalMs = Math.min(
      MAX_POLL_MS,
      Math.max(floor, next.pollIntervalSeconds * 1000),
    );
  }

  throw new ToolRunError(
    "This is taking longer than usual. Try again in a moment.",
    "timeout",
  );
}
