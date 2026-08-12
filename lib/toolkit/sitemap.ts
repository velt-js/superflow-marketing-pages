// Sitemap discovery and validation.
//
// Used by T1 check A4 (does a sitemap exist and is it valid XML) and, later,
// by T2's page discovery, which prefers a sitemap over crawling.

import { fetchUrl } from "./fetcher";
import { SUPERFLOW_USER_AGENT } from "./bots";
import { originOf } from "./url";

export type SitemapEntry = {
  loc: string;
  lastmod: string | null;
  priority: number | null;
};

export type SitemapResult = {
  /** The URL we found a sitemap at, or null when none was reachable. */
  url: string | null;
  found: boolean;
  /** True when the document parsed as a sitemap or sitemap index. */
  validXml: boolean;
  /** True when the document is a `<sitemapindex>` rather than a `<urlset>`. */
  isIndex: boolean;
  entries: SitemapEntry[];
  /** Child sitemap URLs when this is an index. */
  childSitemaps: string[];
  /** Where we looked, in order, for the UI to explain what it tried. */
  attempted: string[];
};

/**
 * Pulls the text content of the first matching tag out of an XML fragment.
 *
 * @param xml - The fragment.
 * @param tag - The tag name.
 */
function tagText(xml: string, tag: string): string | null {
  try {
    const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}\\s*>`, "i").exec(
      xml,
    );
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

/**
 * Parses a sitemap or sitemap index document.
 *
 * @param xml - The raw document.
 * @param limit - Maximum entries to collect.
 */
export function parseSitemap(
  xml: string,
  limit = 5000,
): { validXml: boolean; isIndex: boolean; entries: SitemapEntry[]; childSitemaps: string[] } {
  try {
    const source = xml ?? "";
    const isIndex = /<sitemapindex\b/i.test(source);
    const isUrlset = /<urlset\b/i.test(source);

    if (!isIndex && !isUrlset) {
      return { validXml: false, isIndex: false, entries: [], childSitemaps: [] };
    }

    if (isIndex) {
      const childSitemaps: string[] = [];
      const pattern = /<sitemap\b[^>]*>([\s\S]*?)<\/sitemap\s*>/gi;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(source)) !== null && childSitemaps.length < limit) {
        const loc = tagText(match[1], "loc");
        if (loc) childSitemaps.push(loc);
      }
      return { validXml: true, isIndex: true, entries: [], childSitemaps };
    }

    const entries: SitemapEntry[] = [];
    const pattern = /<url\b[^>]*>([\s\S]*?)<\/url\s*>/gi;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(source)) !== null && entries.length < limit) {
      const loc = tagText(match[1], "loc");
      if (!loc) continue;
      const priorityRaw = tagText(match[1], "priority");
      const priority = priorityRaw === null ? null : Number(priorityRaw);
      entries.push({
        loc,
        lastmod: tagText(match[1], "lastmod"),
        priority: Number.isFinite(priority) ? priority : null,
      });
    }

    return { validXml: true, isIndex: false, entries, childSitemaps: [] };
  } catch {
    return { validXml: false, isIndex: false, entries: [], childSitemaps: [] };
  }
}

/**
 * Finds a site's sitemap, preferring any URL declared in robots.txt and
 * falling back to the conventional root locations.
 *
 * @param params - The site and any sitemap URLs robots.txt declared.
 */
export async function discoverSitemap(params: {
  siteUrl: string;
  robotsSitemaps?: string[];
}): Promise<SitemapResult> {
  const origin = originOf(params.siteUrl);
  const candidates = [
    ...(params.robotsSitemaps ?? []),
    `${origin}sitemap.xml`,
    `${origin}sitemap_index.xml`,
  ];

  // Dedupe while preserving order: robots.txt entries are the most
  // authoritative and should be tried first.
  const attempted: string[] = [];
  const seen = new Set<string>();

  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    attempted.push(candidate);

    try {
      const result = await fetchUrl({
        url: candidate,
        userAgent: SUPERFLOW_USER_AGENT,
        maxBytes: 5 * 1024 * 1024,
        timeoutMs: 8000,
      });

      if (!result.ok || result.status !== 200) continue;

      const parsed = parseSitemap(result.body);
      if (!parsed.validXml) {
        // A 200 that is not XML is worth reporting: the host is serving the
        // site shell at this path, which is its own finding.
        return {
          url: candidate,
          found: true,
          validXml: false,
          isIndex: false,
          entries: [],
          childSitemaps: [],
          attempted,
        };
      }

      return {
        url: candidate,
        found: true,
        validXml: true,
        isIndex: parsed.isIndex,
        entries: parsed.entries,
        childSitemaps: parsed.childSitemaps,
        attempted,
      };
    } catch {
      // Try the next candidate.
    }
  }

  return {
    url: null,
    found: false,
    validXml: false,
    isIndex: false,
    entries: [],
    childSitemaps: [],
    attempted,
  };
}
