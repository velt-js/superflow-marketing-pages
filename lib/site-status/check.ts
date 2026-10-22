import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import {
  isPrivateIPv4,
  isPrivateIPv6,
  type StatusTarget,
} from "./target";

/** Outcome of one live check against a website. */
export interface SiteStatusResult {
  /** "up" when the site answered with an HTTP status below 500. */
  status: "up" | "down";
  /** Why the site counts as down. Absent when the site is up. */
  reason?: "timeout" | "dns" | "connection" | "server-error" | "blocked";
  /** HTTP status code received, when any response arrived. */
  httpStatus?: number;
  /** Time from request start to response headers, in milliseconds. */
  responseTimeMs: number;
  /** The URL that was actually requested (after the https/http fallback). */
  requestedUrl: string;
  /** The URL the final response came from, after redirects. */
  finalUrl?: string;
  /** ISO timestamp of when the check ran. */
  checkedAt: string;
}

const LOG_PREFIX = "[SiteStatus]";
const REQUEST_TIMEOUT_MS = 10_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; SuperflowStatusChecker/1.0; +https://usesuperflow.com/tool/status)";

/**
 * Check whether a website is reachable. Tries https first and falls back to
 * http when the https connection itself fails (not on a timeout, and not on
 * an HTTP error response). The response body is never read.
 *
 * @param target - A parsed, validated target from {@link parseStatusTarget}.
 */
export async function checkSiteStatus(
  target: StatusTarget
): Promise<SiteStatusResult> {
  const checkedAt = new Date().toISOString();
  const httpsUrl = `https://${target.host}${target.path}`;
  try {
    if (!(await resolvesToPublicAddress(target.host))) {
      return {
        status: "down",
        reason: "blocked",
        responseTimeMs: 0,
        requestedUrl: httpsUrl,
        checkedAt,
      };
    }

    const httpsAttempt = await attempt(httpsUrl);
    if (httpsAttempt.kind !== "connection") {
      // A response, a timeout, or a DNS failure is final: http would not
      // fare better.
      return toResult(httpsAttempt, httpsUrl, checkedAt);
    }

    const httpUrl = `http://${target.host}${target.path}`;
    const httpAttempt = await attempt(httpUrl);
    if (httpAttempt.kind === "connection") {
      // Both schemes refused: report the https attempt, which is the one
      // a visitor's browser would make first.
      return toResult(httpsAttempt, httpsUrl, checkedAt);
    }
    return toResult(httpAttempt, httpUrl, checkedAt);
  } catch (error) {
    console.error(`${LOG_PREFIX} Unexpected failure checking ${target.label}:`, error);
    return {
      status: "down",
      reason: "connection",
      responseTimeMs: 0,
      requestedUrl: httpsUrl,
      checkedAt,
    };
  }
}

type Attempt =
  | { kind: "response"; httpStatus: number; finalUrl: string; elapsedMs: number }
  | { kind: "timeout"; elapsedMs: number }
  | { kind: "dns"; elapsedMs: number }
  | { kind: "connection"; elapsedMs: number };

const DNS_ERROR_CODES = new Set(["ENOTFOUND", "EAI_AGAIN", "EAI_NONAME", "EAI_FAIL"]);

async function attempt(url: string): Promise<Attempt> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const started = performance.now();
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
    });
    const elapsedMs = Math.round(performance.now() - started);
    // Headers are enough; drop the body so large pages cost nothing.
    void response.body?.cancel().catch(() => undefined);
    return {
      kind: "response",
      httpStatus: response.status,
      finalUrl: response.url || url,
      elapsedMs,
    };
  } catch (error) {
    const elapsedMs = Math.round(performance.now() - started);
    if (controller.signal.aborted) {
      return { kind: "timeout", elapsedMs };
    }
    const code = describeError(error);
    console.error(`${LOG_PREFIX} Request to ${url} failed:`, code);
    return { kind: DNS_ERROR_CODES.has(code) ? "dns" : "connection", elapsedMs };
  } finally {
    clearTimeout(timer);
  }
}

function toResult(
  attemptResult: Attempt,
  requestedUrl: string,
  checkedAt: string
): SiteStatusResult {
  try {
    if (attemptResult.kind === "response") {
      const isUp = attemptResult.httpStatus < 500;
      return {
        status: isUp ? "up" : "down",
        ...(isUp ? {} : { reason: "server-error" as const }),
        httpStatus: attemptResult.httpStatus,
        responseTimeMs: attemptResult.elapsedMs,
        requestedUrl,
        finalUrl: attemptResult.finalUrl,
        checkedAt,
      };
    }
    return {
      status: "down",
      reason: attemptResult.kind,
      responseTimeMs: attemptResult.elapsedMs,
      requestedUrl,
      checkedAt,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} Failed to build result:`, error);
    return {
      status: "down",
      reason: "connection",
      responseTimeMs: 0,
      requestedUrl,
      checkedAt,
    };
  }
}

/**
 * Resolve the host and refuse to fetch anything that lands on a private,
 * loopback, or link-local address. This page runs the request from our
 * server, so without this guard a visitor could probe internal services.
 * A host that does not resolve at all is treated as public here and then
 * fails as "dns" inside fetch, which is the message visitors expect.
 *
 * @param host - Hostname with optional port.
 */
async function resolvesToPublicAddress(host: string): Promise<boolean> {
  try {
    const hostname = host.replace(/:\d+$/, "");
    const addresses = isIP(hostname)
      ? [{ address: hostname, family: isIP(hostname) }]
      : await lookup(hostname, { all: true });
    return addresses.every(({ address, family }) =>
      family === 6
        ? !isPrivateIPv6(address)
        : !isPrivateIPv4(address.split(".").map(Number))
    );
  } catch (error) {
    console.error(`${LOG_PREFIX} DNS lookup failed for ${host}:`, describeError(error));
    return true;
  }
}

function describeError(error: unknown): string {
  try {
    if (error instanceof Error) {
      const cause = (error as Error & { cause?: { code?: string; message?: string } }).cause;
      return cause?.code ?? cause?.message ?? error.message;
    }
    return String(error);
  } catch {
    return "unknown error";
  }
}

/**
 * Visitor-facing explanation of why a site counts as down.
 *
 * @param result - A check result.
 */
export function describeDownReason(result: SiteStatusResult): string {
  try {
    switch (result.reason) {
      case "timeout":
        return `No response within ${REQUEST_TIMEOUT_MS / 1000} seconds.`;
      case "server-error":
        return `The server answered with HTTP ${result.httpStatus}.`;
      case "blocked":
        return "That address points to a private network, so it cannot be checked from here.";
      case "dns":
        return "The domain name could not be resolved.";
      case "connection":
      default:
        return "The connection could not be established. The server refused it or closed it before answering.";
    }
  } catch {
    return "The site did not respond.";
  }
}
