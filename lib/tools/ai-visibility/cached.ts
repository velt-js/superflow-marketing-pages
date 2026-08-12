// Cache-only read path for the visibility report.
//
// Used by the tool page's `generateMetadata` and its server render so a
// shared link ("look at our score") paints the report and the right Open
// Graph card without re-running a 15 second check during SSR.
//
// A miss is normal and is not an error: the page falls back to its indexable
// landing metadata and the client re-runs the check on mount.

import { readCache, toolCacheKey } from "@/lib/toolkit/cache";
import { normalizeUrl } from "@/lib/toolkit/url";
import { REPORT_VERSION } from "./engine";
import type { VisibilityReport } from "./types";

const TOOL_SLUG = "ai-visibility-checker";

export type CachedReport = {
  report: VisibilityReport;
  ageSeconds: number;
};

/**
 * Reads a previously computed report for a URL. Never runs a check.
 *
 * @param rawUrl - The `?url=` value from the query string.
 * @returns The cached report, or null on a miss or a malformed URL.
 */
export async function readCachedReport(
  rawUrl: string | undefined,
): Promise<CachedReport | null> {
  try {
    if (!rawUrl || rawUrl.trim().length === 0) return null;

    const normalized = normalizeUrl(rawUrl);
    if (!normalized.ok) return null;

    const hit = await readCache<VisibilityReport>(
      toolCacheKey({
        tool: TOOL_SLUG,
        url: normalized.url,
        version: REPORT_VERSION,
      }),
      REPORT_VERSION,
    );

    if (!hit) return null;
    return { report: hit.data, ageSeconds: hit.ageSeconds };
  } catch {
    return null;
  }
}
