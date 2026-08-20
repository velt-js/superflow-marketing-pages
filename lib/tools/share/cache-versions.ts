// The KV result version every tool caches under, in one place.
//
// WHY THIS FILE EXISTS
//
// Each tool's API route caches its result under `toolCacheKey({tool, url,
// version})`, and a read with the wrong version is a miss. Until now each
// route owned its own `const RESULT_VERSION = 1`, which was fine while the
// route was the only reader.
//
// It is no longer the only reader. `./read.ts` reads the same entries from
// `generateMetadata` to build a shared result's Open Graph card, and the badge
// endpoint reads them to draw a live badge. If a route bumps its version and
// those readers do not, nothing errors: cards silently stop carrying the
// result and badges silently stop appearing, on every tool page, with no
// failing test and no log line. That is the worst class of bug this codebase
// can ship, so the number lives here and the route imports it.
//
// BUMPING A VERSION
//
// Bump the entry here when a tool's cached shape changes. Old entries are then
// ignored everywhere at once, which is the point.

import { REPORT_VERSION as VISIBILITY_REPORT_VERSION } from "@/lib/tools/ai-visibility/types";
import { REPORT_VERSION as SOCIAL_PREVIEW_REPORT_VERSION } from "@/lib/tools/social-preview/report";

/**
 * Persona reviews and the Lookalike Test share one runner and one version.
 * Re-exported by `lib/tools/persona-review/run.ts` under its historic name.
 */
export const PERSONA_CACHE_VERSION = 1;

/**
 * The version each tool's cache entries carry, keyed by registry slug.
 *
 * The two engines whose report shape is declared in a types module read their
 * version from there rather than restating it, because those modules are also
 * what the shape's readers import: one number, one place, no chance of a
 * mismatch between the type and the key.
 */
export const TOOL_CACHE_VERSION: Readonly<Record<string, number>> = {
  // The robots.txt checker deliberately shares the visibility checker's cache
  // entries: it is the access-scoped view of the same run, so it must never
  // pay for a second run of work already done.
  "ai-visibility-checker": VISIBILITY_REPORT_VERSION,
  "robots-txt-ai-checker": VISIBILITY_REPORT_VERSION,
  "social-preview-checker": SOCIAL_PREVIEW_REPORT_VERSION,
  "json-ld-validator": 1,
  "json-ld-generator": 1,
  "llms-txt-generator": 1,
  "markdown-for-agents": 1,
  "alt-text-generator": 1,
  "full-page-screenshot": 1,
  "tech-stack-detector": 1,
  "review-like-paul-graham": PERSONA_CACHE_VERSION,
  "review-like-steve-jobs": PERSONA_CACHE_VERSION,
  "review-like-peter-thiel": PERSONA_CACHE_VERSION,
  "review-like-elon-musk": PERSONA_CACHE_VERSION,
  "review-like-travis-kalanick": PERSONA_CACHE_VERSION,
  "lookalike-test": PERSONA_CACHE_VERSION,
};

/**
 * The cache version for a tool.
 *
 * @param slug - The registry slug.
 * @returns The version, or 1 for a tool that has no entry. A tool missing from
 *   the table has no cached results to read either, so the fallback only ever
 *   produces a miss rather than a wrong read.
 */
export function cacheVersionFor(slug: string): number {
  try {
    return TOOL_CACHE_VERSION[slug] ?? 1;
  } catch {
    return 1;
  }
}

/**
 * The cache key a tool's run is stored under.
 *
 * The visibility engine's own slug owns the entry for both tools that read it,
 * which is why this maps the robots.txt slug onto it rather than keying on the
 * caller's page.
 *
 * @param slug - The registry slug of the tool being read.
 */
export function cacheToolFor(slug: string): string {
  return slug === "robots-txt-ai-checker" ? "ai-visibility-checker" : slug;
}
