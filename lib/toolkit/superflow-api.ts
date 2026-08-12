// Client for Superflow's public no-auth API.
//
// The check engine now lives in the product backend as the `ai-visibility`
// agent service, so both the free tool and the in-product agent run the same
// code. This module is how the marketing site reaches it.
//
// It targets the `runFreeTool` sub-event on `anonymoushandler`, which runs the
// engine INLINE rather than dispatching an agent execution. That matters: the
// agent execution pipeline costs two Cloud Task hops, two chances at an 8GiB
// cold start, and then client polling, none of which a single-page check with
// a human waiting can afford.
//
// Configure with:
//   SUPERFLOW_ANONYMOUS_API_URL   the callable endpoint, e.g.
//     https://<region>-<project>.cloudfunctions.net/anonymoushandler
//
// When it is unset the caller falls back to the in-repo engine, so local dev
// and any deploy that predates the backend release keep working.

import type { VisibilityReport } from "@/lib/tools/ai-visibility/types";

const ENDPOINT = process.env.SUPERFLOW_ANONYMOUS_API_URL ?? "";

/** Ceiling on the round trip. The engine's own budget is well under this. */
const TIMEOUT_MS = 35_000;

/** True when the backend endpoint is configured. */
export function isBackendConfigured(): boolean {
  return ENDPOINT.length > 0;
}

export type BackendRunResult =
  | { ok: true; report: VisibilityReport }
  | { ok: false; code: string; message: string };

/**
 * The report shape the backend returns. Close to the marketing shape but not
 * identical: it counts redirects rather than listing them, and it has no
 * screenshot because the inline path never launches a browser.
 */
type BackendReport = Omit<VisibilityReport, "redirects" | "screenshot" | "checkedAt"> & {
  redirectCount?: number;
  error?: string;
};

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
 * Runs a free tool through the Superflow backend.
 *
 * @param toolId - The tool to run, e.g. "ai-visibility".
 * @param url - The URL to check.
 * @param clientIp - Forwarded so the backend's per-IP budget sees the real
 *   caller rather than this server.
 */
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
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Firebase callables read the caller IP from the forwarded chain.
        ...(clientIp ? { "X-Forwarded-For": clientIp } : {}),
      },
      // Callable protocol: the payload is wrapped in `data`, and the response
      // comes back wrapped in `result`.
      body: JSON.stringify({
        data: { subEventType: "runFreeTool", toolId, url },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        code: "backend-error",
        message: "Something went wrong running the check. Try again in a moment.",
      };
    }

    const payload = (await response.json()) as {
      result?: {
        success?: boolean;
        data?: BackendReport;
        errorCode?: string;
        message?: string;
      };
    };

    const result = payload?.result;
    if (!result || result.success !== true || !result.data) {
      return {
        ok: false,
        code: result?.errorCode ?? "backend-error",
        message:
          result?.message ??
          "Something went wrong running the check. Try again in a moment.",
      };
    }

    return { ok: true, report: toVisibilityReport(result.data) };
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    return {
      ok: false,
      code: timedOut ? "timeout" : "backend-error",
      message: timedOut
        ? "The check took too long. Try again in a moment."
        : "Something went wrong running the check. Try again in a moment.",
    };
  }
}
