// Headless render adapter.
//
// WHY THIS IS AN ADAPTER AND NOT A PLAYWRIGHT CALL
//
// Rendering is the one capability the marketing site cannot do in-process.
// Bundling Chromium into the Next.js app on Vercel means a ~50MB function, a
// multi-second cold start on the site's most performance-sensitive pages, and
// a dependency the rest of the site pays for. That is a decision for Rakesh
// (open question #2 in the brief), not one to make by installing a package.
//
// So: this module speaks to a render service over HTTP, and every consumer is
// written to degrade cleanly when no service is configured. Check R1 reports
// "could not verify" instead of a fabricated number, and the report still
// renders. Configure it and R1 starts returning real measurements with no
// code change.
//
// THE CONTRACT A RENDER SERVICE MUST IMPLEMENT
//
//   POST {TOOLKIT_RENDER_URL}
//   Authorization: Bearer {TOOLKIT_RENDER_TOKEN}   (when the token is set)
//   Content-Type: application/json
//
//   Request:  { url, viewportWidth, fullPage, waitMs, deviceScaleFactor,
//               screenshot, userAgent }
//   Response: { html, text?, screenshot?, finalUrl?, status? }
//
//     html       serialized DOM after the page settled (required)
//     text       visible text; we derive it from `html` when omitted
//     screenshot base64 PNG WITHOUT a data: prefix (only when requested)
//     finalUrl   post-redirect URL
//     status     HTTP status the renderer saw
//
// The service is responsible for its own SSRF guard. Callers here have
// already run `resolveUserUrl`, but a render service reachable by anything
// else must not trust that.
//
// Existing options worth evaluating for the backing service, in the sibling
// Firebase repo: `functions/src/shared/tools/screenshot/screenshot.service.ts`
// (Puppeteer plus Stagehand, already handles popup dismissal and lazy-load
// scrolling) and the `screenshot` built-in agent. Both currently require an
// apiKey, a workspace, and a billing check, so neither is callable from a
// no-login public tool without a dedicated public entry point.

import { extractVisibleText } from "./html";
import { BROWSER_USER_AGENT } from "./bots";

const RENDER_URL = process.env.TOOLKIT_RENDER_URL ?? "";
const RENDER_TOKEN = process.env.TOOLKIT_RENDER_TOKEN ?? "";

/** Ceiling on a render request. Renders are slow; this is not a fetch. */
const RENDER_TIMEOUT_MS = 30_000;

export type RenderRequest = {
  url: string;
  /** CSS pixels. Defaults to a desktop viewport. */
  viewportWidth?: number;
  /** Capture the full scroll height rather than just the viewport. */
  fullPage?: boolean;
  /** Extra settle time after load, in milliseconds. */
  waitMs?: number;
  /** 2 for retina output. */
  deviceScaleFactor?: number;
  /** Ask for a screenshot as well as the DOM. Costs time; off by default. */
  screenshot?: boolean;
  userAgent?: string;
};

export type RenderFailureReason =
  | "not-configured"
  | "timeout"
  | "error"
  | "bad-response";

export type RenderResult =
  | {
      ok: true;
      /** Serialized DOM after the page settled. */
      html: string;
      /** Visible text of the rendered DOM. */
      text: string;
      /** Base64 PNG, without a data: prefix. Present only when requested. */
      screenshot: string | null;
      finalUrl: string;
      status: number | null;
      durationMs: number;
    }
  | {
      ok: false;
      reason: RenderFailureReason;
      /** Copy the UI can show. Never blank. */
      message: string;
      durationMs: number;
    };

/**
 * True when a render service is configured. Consumers use this to decide
 * between a measured check and a heuristic one.
 */
export function isRenderConfigured(): boolean {
  return RENDER_URL.length > 0;
}

/**
 * Renders a URL in a real browser and returns the settled DOM.
 *
 * Never throws. When no service is configured the result is
 * `{ ok: false, reason: "not-configured" }`, which callers are expected to
 * handle as a first-class outcome rather than an error.
 *
 * @param request - What to render.
 */
export async function renderPage(
  request: RenderRequest,
): Promise<RenderResult> {
  const startedAt = Date.now();

  if (!isRenderConfigured()) {
    return {
      ok: false,
      reason: "not-configured",
      message:
        "Rendering is not enabled on this deployment, so checks that need a real browser were skipped.",
      durationMs: 0,
    };
  }

  try {
    const response = await fetch(RENDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(RENDER_TOKEN ? { Authorization: `Bearer ${RENDER_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        url: request.url,
        viewportWidth: request.viewportWidth ?? 1440,
        fullPage: request.fullPage ?? false,
        waitMs: request.waitMs ?? 1500,
        deviceScaleFactor: request.deviceScaleFactor ?? 1,
        screenshot: request.screenshot ?? false,
        userAgent: request.userAgent ?? BROWSER_USER_AGENT,
      }),
      signal: AbortSignal.timeout(RENDER_TIMEOUT_MS),
      cache: "no-store",
    });

    const durationMs = Date.now() - startedAt;

    if (!response.ok) {
      return {
        ok: false,
        reason: "error",
        message: `The render service returned ${response.status}.`,
        durationMs,
      };
    }

    const payload = (await response.json()) as {
      html?: unknown;
      text?: unknown;
      screenshot?: unknown;
      finalUrl?: unknown;
      status?: unknown;
    };

    if (typeof payload?.html !== "string") {
      return {
        ok: false,
        reason: "bad-response",
        message: "The render service did not return a document.",
        durationMs,
      };
    }

    return {
      ok: true,
      html: payload.html,
      text:
        typeof payload.text === "string" && payload.text.length > 0
          ? payload.text
          : extractVisibleText(payload.html),
      screenshot:
        typeof payload.screenshot === "string" ? payload.screenshot : null,
      finalUrl:
        typeof payload.finalUrl === "string" ? payload.finalUrl : request.url,
      status: typeof payload.status === "number" ? payload.status : null,
      durationMs,
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    return {
      ok: false,
      reason: timedOut ? "timeout" : "error",
      message: timedOut
        ? "The page took too long to render, so checks that need a real browser were skipped."
        : "We could not render the page, so checks that need a real browser were skipped.",
      durationMs,
    };
  }
}
