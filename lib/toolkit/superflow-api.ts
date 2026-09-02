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
// The free tools shipped to the production backend on 2026-08-18, so the
// production callable is the built-in default and nothing has to be configured
// for the site to talk to it.
//
// Override it with:
//   SUPERFLOW_ANONYMOUS_API_URL   the callable endpoint, e.g.
//     https://<region>-<project>.cloudfunctions.net/anonymoushandler
//
//   Point it at staging to try a backend change before it is released.
//   Set it to `local` to unconfigure the backend entirely, which sends the
//   callers back to the in-repo engine — the only way left to exercise that
//   path now that the default is a live endpoint.

import type {
  CategoryId,
  CheckId,
  CheckStatus,
  Effort,
  Finding,
  FindingDetail,
  VisibilityReport,
} from "@/lib/tools/ai-visibility/types";

/**
 * The production callable. Free tools are live here, so this is what a
 * visitor reaches unless the environment names something else.
 */
const PROD_ENDPOINT =
  "https://us-central1-snippyly-sdk-prod.cloudfunctions.net/anonymoushandler";

/**
 * The staging callable. Where an agent lands first, before it is released.
 */
const STAGING_ENDPOINT =
  "https://us-central1-snipply-sdk-staging.cloudfunctions.net/anonymoushandler";

/**
 * Tools whose backend agent is live on STAGING but not yet released to prod.
 *
 * A tool in this set talks to staging from every environment, including the
 * production site, because staging is the only place its agent exists — the
 * alternative is a tool that 500s for every visitor.
 *
 * REMOVE A TOOL FROM THIS SET THE MOMENT ITS AGENT SHIPS TO PROD. Left behind,
 * it silently keeps production traffic pointed at a staging backend that is
 * redeployed constantly, has no uptime expectation, and shares its budget with
 * whatever else is being tested that afternoon.
 *
 * Empty as of 2026-09-02: the five persona reviews and the Lookalike Test
 * shipped to prod, and each was verified against the production callable
 * before being taken out — a real start/poll round trip per tool that came
 * back terminal with a summary and findings.
 *
 * Ids are the free-tool ids, which are also the backend agent ids.
 */
const TOOLS_ON_STAGING: ReadonlySet<string> = new Set<string>([]);

/** The sentinel that turns the backend off and restores the in-repo engine. */
const LOCAL_ENGINE_SENTINEL = "local";

const CONFIGURED_ENDPOINT = (process.env.SUPERFLOW_ANONYMOUS_API_URL ?? "").trim();

const ENDPOINT =
  CONFIGURED_ENDPOINT === LOCAL_ENGINE_SENTINEL
    ? ""
    : CONFIGURED_ENDPOINT || PROD_ENDPOINT;

/**
 * The callable one tool should talk to.
 *
 * An explicit `SUPERFLOW_ANONYMOUS_API_URL` wins for EVERY tool: it exists so a
 * developer or a CI run can pin the whole site at one backend, and a per-tool
 * exception that quietly ignored it would defeat that.
 *
 * @param toolId - The free-tool id about to be dispatched.
 */
function endpointForTool(toolId: string): string {
  if (CONFIGURED_ENDPOINT.length > 0) return ENDPOINT;
  if (TOOLS_ON_STAGING.has(toolId)) return STAGING_ENDPOINT;
  return ENDPOINT;
}

/** True when the named tool is pinned to staging. Exported for the UI notice. */
export function isToolOnStagingBackend(toolId: string): boolean {
  return CONFIGURED_ENDPOINT.length === 0 && TOOLS_ON_STAGING.has(toolId);
}

/**
 * Ceiling on the whole start-and-poll round trip.
 *
 * The engines' own budget is 30 seconds, so a run still going well past that
 * has failed server-side. What the old 45 second ceiling did not allow for is
 * everything around the run: the callable's cold start, the dispatch onto the
 * agent pipeline, and the first poll interval. On a cold backend that overhead
 * pushed honest runs past the line, and a visitor who would have had their
 * report in 50 seconds got "The check took too long" instead — then a retry
 * seconds later answered in seven, because the second call found a warm
 * backend.
 *
 * 55 seconds covers that cold start while staying inside the 60 second
 * `maxDuration` the routes declare, so the function never dies mid-wait and
 * turns a slow answer into a platform error page.
 */
const OVERALL_TIMEOUT_MS = 55_000;

/** Per-request ceiling on the start call. Generous, to survive a cold start. */
const START_TIMEOUT_MS = 25_000;

/** Per-request ceiling on each poll. Polls are cheap reads. */
const POLL_TIMEOUT_MS = 10_000;

/** Poll cadence when the backend does not provide one. */
const DEFAULT_POLL_INTERVAL_SECONDS = 2;

/**
 * Cadence to fall back to after the backend throttles a poll. Wide enough to
 * drop under its per-IP status budget on the next tick rather than spending
 * the whole run bouncing off it.
 */
const THROTTLED_POLL_INTERVAL_SECONDS = 6;

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
  "redirects" | "screenshot" | "checkedAt" | "findings"
> & {
  redirectCount?: number;
  error?: string;
  /**
   * The full per-check payload, with `detail` intact. Present since the
   * 2026-08-13 backend release; absent on anything older and on a cached
   * report written before it, which is why the reader falls back rather than
   * requiring it.
   */
  checks?: unknown[];
};

/**
 * One finding as the backend puts it on the envelope.
 *
 * The product backend strips the findings contract off the stored report so it
 * is not persisted twice, then reattaches this flattened form beside it. It is
 * lossy on purpose: `why` and `fix` arrive pre-joined in `description`, passing
 * checks are dropped, and the structured `detail` payloads (the per-crawler
 * table above all) do not survive at all.
 */
type BackendFinding = {
  title?: unknown;
  description?: unknown;
  severity?: unknown;
  /** `ai-visibility-<check id>`, e.g. `ai-visibility-s3`. */
  issueType?: unknown;
};

/** Every status the report view knows how to render. */
const KNOWN_STATUSES = new Set<string>(["pass", "warn", "fail", "unknown"]);

/** Every effort label the finding card knows how to render. */
const KNOWN_EFFORTS = new Set<string>(["minutes", "hour", "project"]);

/**
 * Rebuilds findings from the report's `checks` array.
 *
 * `checks` is the backend's full per-check payload: every check including the
 * passes, `why` and `fix` still separate, and the structured `detail` intact —
 * the per-crawler bot table above all, which is the entire substance of the
 * robots.txt tool. It rides on the report rather than the envelope precisely so
 * it survives `ReportResultTransformer`'s findings strip.
 *
 * Fields are validated rather than cast. A check whose id, category or status
 * the UI does not know is dropped instead of rendered as a blank row, and an
 * unrecognised `detail.kind` is discarded while the finding itself is kept.
 *
 * @param raw - The report's `checks` array, straight off the wire.
 * @returns Findings the report view can render.
 */
function fromBackendChecks(raw: unknown[]): Finding[] {
  try {
    const findings: Finding[] = [];

    for (const entry of raw) {
      if (typeof entry !== "object" || entry === null) continue;
      const check = entry as Record<string, unknown>;

      const id = typeof check.id === "string" ? check.id : "";
      const category = CATEGORY_BY_PREFIX[id.charAt(0)];
      const status = typeof check.status === "string" ? check.status : "";

      if (!id || !category || !KNOWN_STATUSES.has(status)) continue;

      const effort = typeof check.effort === "string" ? check.effort : "";
      const detail = toFindingDetail(check.detail);

      findings.push({
        id: id as CheckId,
        category,
        status: status as CheckStatus,
        title: typeof check.title === "string" ? check.title : id,
        why: typeof check.why === "string" ? check.why : "",
        fix: typeof check.fix === "string" ? check.fix : "",
        ...(typeof check.fixSnippet === "string" ? { fixSnippet: check.fixSnippet } : {}),
        ...(typeof check.platformFix === "string" ? { platformFix: check.platformFix } : {}),
        ...(KNOWN_EFFORTS.has(effort) ? { effort: effort as Effort } : {}),
        ...(typeof check.points === "number" ? { points: check.points } : {}),
        ...(typeof check.maxPoints === "number" ? { maxPoints: check.maxPoints } : {}),
        ...(detail ? { detail } : {}),
      });
    }

    return findings;
  } catch {
    return [];
  }
}

/**
 * Passes a `detail` payload through, translating the one shape that differs.
 *
 * Seven of the engine's eight detail kinds are already byte-compatible with the
 * UI's union. `llms-txt` is not: the backend sends `{ found, failedRules }`
 * while the UI's variant expects a full `LlmsTxtValidation`, whose `rules` the
 * card dereferences directly. Passing it through untranslated would throw on
 * `detail.validation.rules` — the same crash this whole area just recovered
 * from — so it is remapped onto its own variant instead.
 *
 * @param detail - The `detail` field of one check.
 * @returns A renderable detail, or undefined when the kind is unknown.
 */
function toFindingDetail(detail: unknown): FindingDetail | undefined {
  try {
    if (typeof detail !== "object" || detail === null) return undefined;
    const value = detail as Record<string, unknown>;

    if (value.kind === "llms-txt") {
      const failedRules = Array.isArray(value.failedRules) ? value.failedRules : [];
      return {
        kind: "llms-txt-summary",
        found: value.found === true,
        failedRules: failedRules.filter(
          (rule): rule is { title: string; detail: string } =>
            typeof rule === "object" &&
            rule !== null &&
            typeof (rule as { title?: unknown }).title === "string" &&
            typeof (rule as { detail?: unknown }).detail === "string",
        ),
      };
    }

    // The remaining kinds match the UI union as-is. Anything unrecognised is
    // dropped rather than handed to a switch that has no arm for it.
    const passThrough = new Set([
      "bot-table",
      "firewall",
      "js-dependency",
      "headings",
      "schema",
      "answer-shape",
      "meta",
    ]);
    if (typeof value.kind === "string" && passThrough.has(value.kind)) {
      return value as unknown as FindingDetail;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/** Check-id prefix to scoring category. Mirrors the backend's own ids. */
const CATEGORY_BY_PREFIX: Record<string, CategoryId> = {
  A: "access",
  R: "readability",
  S: "structure",
  I: "identity",
};

/** The backend maps fail to high and warn to medium; this is the inverse. */
const STATUS_BY_SEVERITY: Record<string, CheckStatus> = {
  critical: "fail",
  high: "fail",
  medium: "warn",
  low: "warn",
  info: "warn",
};

/**
 * Rebuilds renderable findings from the envelope's flattened array.
 *
 * Only fields the payload actually carries are set. Scoring and triage fields
 * are left undefined rather than invented: this report tells people whether AI
 * can read their site, and a fabricated effort estimate or point score would be
 * indistinguishable from a measured one.
 *
 * @param raw - The envelope's `findings` array, straight off the wire.
 * @returns Findings the report view can render, skipping unrecognisable rows.
 */
function toVisibilityFindings(raw: unknown[]): Finding[] {
  try {
    const findings: Finding[] = [];

    for (const entry of raw) {
      if (typeof entry !== "object" || entry === null) continue;
      const item = entry as BackendFinding;

      const issueType =
        typeof item.issueType === "string" ? item.issueType : "";
      const id = issueType.replace(/^ai-visibility-/, "").toUpperCase();
      const category = CATEGORY_BY_PREFIX[id.charAt(0)];

      // No id means no category and no stable React key, and a finding we
      // cannot place under a heading is not renderable here.
      if (id.length === 0 || !category) continue;

      const severity =
        typeof item.severity === "string" ? item.severity : "medium";

      findings.push({
        id: id as CheckId,
        category,
        status: STATUS_BY_SEVERITY[severity] ?? "warn",
        title: typeof item.title === "string" ? item.title : id,
        // `description` is why and fix already joined, so it belongs in `why`.
        // Leaving `fix` empty is what tells the card not to open onto a
        // duplicate of the sentence the reader just read.
        why: typeof item.description === "string" ? item.description : "",
        fix: "",
      });
    }

    return findings;
  } catch {
    // A malformed findings array must not cost the reader their scores.
    return [];
  }
}

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
 * @param findings - The envelope's findings, which the backend deliberately
 *   removed from the report before sending it.
 */
function toVisibilityReport(
  backend: BackendReport,
  findings: unknown[],
): VisibilityReport {
  return {
    ...backend,
    // Reattach what the backend split off. Without this the report satisfies
    // its TypeScript type and still has no `findings` at runtime, which is
    // exactly the shape that crashed the report view in production.
    //
    // `checks` is preferred when the backend sends it: it carries the passes,
    // the separate why/fix, the effort and points, and the structured detail
    // the envelope's flattened findings throw away. The envelope remains the
    // fallback for older deploys and for reports cached before that release.
    findings: Array.isArray(backend.checks) && backend.checks.length > 0
      ? fromBackendChecks(backend.checks)
      : toVisibilityFindings(findings),
    categories: backend.categories ?? [],
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
  endpoint,
}: {
  data: Record<string, unknown>;
  timeoutMs: number;
  clientIp?: string;
  /** Which callable to talk to. Resolved once per run by the caller. */
  endpoint: string;
}): Promise<CallOutcome> {
  try {
    const response = await fetch(endpoint, {
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
 * What one poll response means: the run is settled, or it is still in flight.
 *
 * `backoffSeconds` is set when the backend told us to slow down rather than
 * that anything went wrong, so a caller can widen its cadence instead of
 * treating a throttled poll as a dead run.
 */
type PollSettlement =
  | { done: true; result: BackendRunResult }
  | { done: false; backoffSeconds?: number };

/**
 * Settles one poll response.
 *
 * Shared by the in-request runner and the deferred poll endpoint, so a run
 * reaches the same verdict however the caller chose to wait for it.
 *
 * A `rate-limited` poll is NOT a failed run. The backend caps status polls per
 * IP per minute, and a visitor with two tabs open can trip that while both runs
 * are executing perfectly well; answering "something went wrong" there throws
 * away a report that is about to arrive. It comes back as still-in-flight with
 * a backoff instead.
 *
 * @param toolId - The tool being run; selects the report mapping.
 * @param poll - One `getFreeToolRun` result envelope.
 */
function settlePoll({
  toolId,
  poll,
}: {
  toolId: string;
  poll: CallableResult;
}): PollSettlement {
  if (poll.success !== true) {
    if (poll.errorCode === "rate-limited") {
      return { done: false, backoffSeconds: THROTTLED_POLL_INTERVAL_SECONDS };
    }
    if (poll.errorCode === "not-found") {
      // The run vanished mid-poll. That is our problem, not the visitor's:
      // "start a new one" copy would blame their (valid, already accepted)
      // input, so map it to the generic try-again.
      return {
        done: true,
        result: { ok: false, code: "not-found", message: TRY_AGAIN_MESSAGE },
      };
    }
    // Terminal run failures (unreachable, internal) arrive here with
    // user-ready copy. Pass them through.
    return {
      done: true,
      result: {
        ok: false,
        code: poll.errorCode ?? "backend-error",
        message: poll.message ?? TRY_AGAIN_MESSAGE,
      },
    };
  }

  if (poll.terminal !== true) return { done: false };

  // ── Terminal: hand the report to the caller ──────────────────────────
  const findings = Array.isArray(poll.findings) ? poll.findings : [];
  const totalFindings =
    typeof poll.totalFindings === "number" ? poll.totalFindings : findings.length;

  if (toolId === "ai-visibility") {
    if (typeof poll.data !== "object" || poll.data === null) {
      // Terminal with no report should not happen; refuse to render a
      // fabricated one.
      return {
        done: true,
        result: { ok: false, code: "backend-error", message: TRY_AGAIN_MESSAGE },
      };
    }
    return {
      done: true,
      result: {
        ok: true,
        report: toVisibilityReport(poll.data as BackendReport, findings),
        data: poll.data,
        findings,
        totalFindings,
      },
    };
  }

  return {
    done: true,
    result: {
      ok: true,
      report: null,
      data: poll.data ?? null,
      findings,
      totalFindings,
    },
  };
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
  extra?: Record<string, unknown>;
}): Promise<BackendVisibilityRunResult>;
export async function runToolViaBackend(params: {
  toolId: string;
  url: string;
  clientIp?: string;
  extra?: Record<string, unknown>;
}): Promise<BackendRunResult>;
export async function runToolViaBackend({
  toolId,
  url,
  clientIp,
  extra,
}: {
  toolId: string;
  url: string;
  clientIp?: string;
  /**
   * Extra start fields, for the tools that take more than a URL (the Lookalike
   * Test's benchmark). Spread into the start payload and nothing else, so a
   * tool that sends none dispatches a byte-identical request. The backend
   * validates them; passing them through unchecked here would put the guard in
   * two places that can disagree.
   */
  extra?: Record<string, unknown>;
}): Promise<BackendRunResult> {
  try {
    const deadline = Date.now() + OVERALL_TIMEOUT_MS;

    // Resolved ONCE, before the start call, and reused for every poll. An
    // executionId only exists in the environment that minted it, so a run
    // started on staging and polled on prod would answer `not-found` forever —
    // a tool that appears to hang rather than fail.
    const endpoint = endpointForTool(toolId);

    // ── Start the run ────────────────────────────────────────────────────
    const started = await callAnonymousHandler({
      data: { subEventType: "startFreeToolRun", toolId, url, ...(extra ?? {}) },
      timeoutMs: Math.min(START_TIMEOUT_MS, deadline - Date.now()),
      clientIp,
      endpoint,
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
        endpoint,
      });

      // A dropped poll is not a dropped run: the run is still executing
      // server-side, so ride out transient transport failures and try again
      // on the next tick. The ceiling bounds how long this can go on.
      if (!polled.ok) {
        continue;
      }

      const settlement = settlePoll({ toolId, poll: polled.result });
      if (settlement.done) return settlement.result;
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

/**
 * A run that has been dispatched and is still executing.
 *
 * `runId` is the backend executionId. It is a Firestore auto-id, so it is not
 * guessable, and the backend refuses to read one that was not started by the
 * free-tools surface — which is what makes it safe to hand to a browser.
 */
export type BackendRunPending = {
  ok: true;
  pending: true;
  runId: string;
  /** How long the caller should wait before polling again. */
  pollIntervalSeconds: number;
};

export type BackendDeferredResult = BackendRunResult | BackendRunPending;

/** True when a deferred result is still executing. */
export function isPendingRun(
  result: BackendDeferredResult,
): result is BackendRunPending {
  return result.ok === true && (result as BackendRunPending).pending === true;
}

/**
 * Dispatches a run and returns its handle WITHOUT waiting for the answer.
 *
 * This is the half of the contract that survives a serverless duration limit.
 * `runToolViaBackend` waits for the report inside one request, which only works
 * while the run finishes inside the platform's `maxDuration` — the persona
 * reviews and the Lookalike Test take two to three minutes, so for them that
 * wait can only ever end in a timeout. Starting here and polling from the
 * browser moves the waiting to the one place with no such ceiling.
 *
 * @param toolId - The tool to run, e.g. "review-like-paul-graham".
 * @param url - The URL to check, unvalidated; the backend is the authority.
 * @param clientIp - Forwarded so the backend's per-IP budget sees the real
 *   caller rather than this server.
 * @param extra - Extra start fields, for the tools that take more than a URL.
 */
export async function startToolRun({
  toolId,
  url,
  clientIp,
  extra,
}: {
  toolId: string;
  url: string;
  clientIp?: string;
  extra?: Record<string, unknown>;
}): Promise<BackendRunPending | BackendRunFailure> {
  try {
    const started = await callAnonymousHandler({
      data: { subEventType: "startFreeToolRun", toolId, url, ...(extra ?? {}) },
      timeoutMs: START_TIMEOUT_MS,
      clientIp,
      endpoint: endpointForTool(toolId),
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

    return {
      ok: true,
      pending: true,
      runId: executionId,
      pollIntervalSeconds: Math.round(pollIntervalMs(start.pollIntervalSeconds) / 1000),
    };
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

/**
 * Reads a dispatched run ONCE. Never sleeps, so the request it serves returns
 * immediately whether or not the run has finished.
 *
 * A transport failure comes back as still-pending rather than as an error: the
 * run is executing on the backend regardless of whether this particular read
 * reached it, and the caller's own ceiling is what bounds the wait.
 *
 * @param toolId - The tool the run belongs to; selects both the endpoint and
 *   the report mapping, so it must match the one `startToolRun` was given.
 * @param runId - The handle from `startToolRun`.
 * @param clientIp - Forwarded for the backend's per-IP poll budget.
 */
export async function pollToolRun({
  toolId,
  runId,
  clientIp,
}: {
  toolId: string;
  runId: string;
  clientIp?: string;
}): Promise<BackendDeferredResult> {
  const stillRunning = (pollIntervalSeconds: number): BackendRunPending => ({
    ok: true,
    pending: true,
    runId,
    pollIntervalSeconds,
  });

  try {
    if (typeof runId !== "string" || runId.trim().length === 0) {
      return { ok: false, code: "bad-request", message: TRY_AGAIN_MESSAGE };
    }

    const polled = await callAnonymousHandler({
      data: { subEventType: "getFreeToolRun", executionId: runId },
      timeoutMs: POLL_TIMEOUT_MS,
      clientIp,
      endpoint: endpointForTool(toolId),
    });

    // A dropped poll is not a dropped run.
    if (!polled.ok) return stillRunning(DEFAULT_POLL_INTERVAL_SECONDS);

    const settlement = settlePoll({ toolId, poll: polled.result });
    if (settlement.done) return settlement.result;

    return stillRunning(
      settlement.backoffSeconds ?? DEFAULT_POLL_INTERVAL_SECONDS,
    );
  } catch {
    return stillRunning(DEFAULT_POLL_INTERVAL_SECONDS);
  }
}
