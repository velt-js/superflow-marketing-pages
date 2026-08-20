// Cache-only read path for shared results. Server side only.
//
// Given a tool slug and the `?url=` off a shared link, this returns the
// snapshot for that run, or null. It NEVER runs a check: `generateMetadata`
// and the badge endpoint are both called on the critical path of a page load,
// and a 15 second engine run in either would be a self-inflicted outage the
// first time somebody posted a link somewhere busy.
//
// A miss is normal and is not an error. The tool page falls back to its
// indexable landing metadata and the client re-runs the check on mount; the
// badge endpoint draws its neutral variant. Both are correct outcomes, and
// both are what happens naturally once a result ages past its cache.
//
// WHY THIS IS A SWITCH AND NOT A REGISTRY OF READERS
//
// Every arm needs a different cached type and a different builder, so a table
// of `(slug) => reader` would be the same switch with an indirection in front
// of it and a cast at the bottom. The switch keeps each tool's cached shape
// visible next to the builder that consumes it, which is the thing a reader of
// this file actually wants to check.

import { readCache, toolCacheKey } from "@/lib/toolkit/cache";
import { normalizeUrl } from "@/lib/toolkit/url";
import type { DetectionResult } from "@/lib/toolkit/detect";
import type { VisibilityReport } from "@/lib/tools/ai-visibility/types";
import type { SocialPreviewReport } from "@/lib/tools/social-preview/report";
import type {
  LlmsTxtReport,
  MarkdownForAgentsReport,
} from "@/lib/tools/free-tools/reports";
import type {
  JsonLdGeneratorReport,
  JsonLdValidatorReport,
} from "@/lib/tools/json-ld/types";
import type { PersonaReviewPayload } from "@/lib/tools/persona-review/types";
import { cacheToolFor, cacheVersionFor } from "./cache-versions";
import {
  accessSnapshot,
  altTextSnapshot,
  jsonLdGeneratorSnapshot,
  jsonLdValidatorSnapshot,
  llmsTxtSnapshot,
  markdownForAgentsSnapshot,
  personaReviewSnapshot,
  screenshotSnapshot,
  socialPreviewSnapshot,
  techStackSnapshot,
  visibilitySnapshot,
} from "./build";
import type { ShareSnapshot } from "./types";

/** The five persona reviews. The Lookalike Test is deliberately not here. */
const PERSONA_SLUGS = new Set([
  "review-like-paul-graham",
  "review-like-steve-jobs",
  "review-like-peter-thiel",
  "review-like-elon-musk",
  "review-like-travis-kalanick",
]);

/** What the JSON-LD Validator route stores. */
type CachedValidator = { report: JsonLdValidatorReport };

/** What the JSON-LD Generator route stores. */
type CachedGenerator = { report: JsonLdGeneratorReport };

/** What the Alt Text Generator route stores, narrowed to what we read. */
type CachedAltText = {
  url: string;
  requestedUrl: string;
  counts: {
    found: number;
    analyzed: number;
    missingAlt: number;
    skipped: number;
  };
};

/** What the Full Page Screenshot route stores, narrowed to what we read. */
type CachedScreenshot = {
  url: string;
  requestedUrl: string;
  width?: number;
  height?: number;
  bytes?: number;
  deviceType?: string;
};

/** What the Tech Stack Detector route stores. */
type CachedTechStack = DetectionResult & { url: string; requestedUrl: string };

export type SharedResult = {
  snapshot: ShareSnapshot;
  /** Whole seconds since the run. Rendered as "checked 3 hours ago". */
  ageSeconds: number;
};

/**
 * Reads one tool's cached run for one URL and reduces it to a snapshot.
 *
 * @param slug - The registry slug of the tool page being rendered.
 * @param rawUrl - The `?url=` value, exactly as it arrived.
 * @returns The snapshot and its age, or null on a miss, a malformed URL, or a
 *   tool that has no server-readable result.
 */
export async function readSharedResult(
  slug: string,
  rawUrl: string | undefined,
): Promise<SharedResult | null> {
  try {
    if (!rawUrl || rawUrl.trim().length === 0) return null;

    const normalized = normalizeUrl(rawUrl);
    if (!normalized.ok) return null;

    const key = toolCacheKey({
      tool: cacheToolFor(slug),
      url: normalized.url,
      version: cacheVersionFor(slug),
    });

    switch (slug) {
      case "ai-visibility-checker": {
        const hit = await readCache<VisibilityReport>(key, cacheVersionFor(slug));
        if (!hit) return null;
        return {
          snapshot: visibilitySnapshot(hit.data),
          ageSeconds: hit.ageSeconds,
        };
      }

      case "robots-txt-ai-checker": {
        const hit = await readCache<VisibilityReport>(key, cacheVersionFor(slug));
        if (!hit) return null;
        return { snapshot: accessSnapshot(hit.data), ageSeconds: hit.ageSeconds };
      }

      case "social-preview-checker": {
        const hit = await readCache<SocialPreviewReport>(
          key,
          cacheVersionFor(slug),
        );
        if (!hit) return null;
        return {
          snapshot: socialPreviewSnapshot(hit.data),
          ageSeconds: hit.ageSeconds,
        };
      }

      case "json-ld-validator": {
        const hit = await readCache<CachedValidator>(key, cacheVersionFor(slug));
        if (!hit?.data?.report) return null;
        return {
          snapshot: jsonLdValidatorSnapshot(hit.data.report),
          ageSeconds: hit.ageSeconds,
        };
      }

      case "json-ld-generator": {
        const hit = await readCache<CachedGenerator>(key, cacheVersionFor(slug));
        if (!hit?.data?.report) return null;
        return {
          snapshot: jsonLdGeneratorSnapshot(hit.data.report),
          ageSeconds: hit.ageSeconds,
        };
      }

      case "llms-txt-generator": {
        const hit = await readCache<LlmsTxtReport>(key, cacheVersionFor(slug));
        if (!hit) return null;
        return { snapshot: llmsTxtSnapshot(hit.data), ageSeconds: hit.ageSeconds };
      }

      case "markdown-for-agents": {
        const hit = await readCache<MarkdownForAgentsReport>(
          key,
          cacheVersionFor(slug),
        );
        if (!hit) return null;
        return {
          snapshot: markdownForAgentsSnapshot(hit.data),
          ageSeconds: hit.ageSeconds,
        };
      }

      case "alt-text-generator": {
        const hit = await readCache<CachedAltText>(key, cacheVersionFor(slug));
        if (!hit?.data?.counts) return null;
        return {
          snapshot: altTextSnapshot(hit.data),
          ageSeconds: hit.ageSeconds,
        };
      }

      case "full-page-screenshot": {
        const hit = await readCache<CachedScreenshot>(key, cacheVersionFor(slug));
        if (!hit) return null;
        return {
          snapshot: screenshotSnapshot(hit.data),
          ageSeconds: hit.ageSeconds,
        };
      }

      case "tech-stack-detector": {
        const hit = await readCache<CachedTechStack>(key, cacheVersionFor(slug));
        if (!hit) return null;
        return {
          snapshot: techStackSnapshot(hit.data),
          ageSeconds: hit.ageSeconds,
        };
      }

      default: {
        // The five persona reviews cache under their own slug keyed on the URL
        // alone, so they read like any other tool.
        //
        // The Lookalike Test does not, and is not handled here on purpose: its
        // cache key includes the benchmark pack and the comparison sites, so a
        // read that knew only the URL would be a guaranteed miss on most runs
        // and a wrong result on the rest. Its share card is built in the
        // browser, where those values are known.
        if (!PERSONA_SLUGS.has(slug)) return null;

        const hit = await readCache<PersonaReviewPayload>(
          key,
          cacheVersionFor(slug),
        );
        if (!hit?.data?.summary) return null;
        return {
          snapshot: personaReviewSnapshot(slug, hit.data, normalized.url),
          ageSeconds: hit.ageSeconds,
        };
      }
    }
  } catch {
    // Every caller treats null as "no shared result", which is exactly the
    // right behaviour for a cache read that failed.
    return null;
  }
}
