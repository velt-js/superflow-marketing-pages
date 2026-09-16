// Shared metadata builder. Every page that exports its own `metadata` or
// `generateMetadata` should call this so openGraph and twitter blocks stay
// in sync with title/description and every page emits a canonical, og:type,
// og:image, twitter:image, and robots directive without each route having
// to repeat the boilerplate.
//
// Inner-page metadata in Next.js REPLACES (not merges) the parent's
// openGraph / twitter blocks, so partial overrides at the page level drop
// og:image and twitter:image silently. This helper guarantees the full set.

import type { Metadata } from "next";
import { SITE_URL } from "./schema";

const SITE_NAME = "Superflow";
const DEFAULT_OG_IMAGE = "/opengraph-image.png";

/**
 * Site style bans em dashes in rendered copy. Meta titles/descriptions
 * can arrive from Sanity with them, so normalize here instead of
 * trusting every content author: any em dash (with or without
 * surrounding spaces) becomes a spaced hyphen.
 */
export function stripEmDashes(value: string): string {
  try {
    return value.replace(/\s*—\s*/g, " - ");
  } catch {
    return value;
  }
}

export type BuildPageMetadataInput = {
  /** Page title without site suffix. The site name is appended automatically. */
  title: string;
  /** Meta description. Aim for 140–160 characters. */
  description: string;
  /** Path under SITE_URL, with leading slash (e.g. "/pricing"). Use "/" for the homepage. */
  path: string;
  /**
   * Path or absolute URL for the page-specific OG image. Defaults to the
   * site-wide `/opengraph-image.png`. Relative paths resolve against
   * `metadataBase` (set in app/layout.tsx).
   */
  ogImage?: string;
  /** Override the og/twitter title. Defaults to `${title} | ${SITE_NAME}`. */
  socialTitle?: string;
  /**
   * Skip the "| Superflow" suffix the helper otherwise appends — the
   * provided `title` is used verbatim for the browser tab, og:title, and
   * twitter:title. Use this when the title already includes the brand
   * (e.g. "Superflow Alternatives") so the rendered tab title doesn't read
   * "Superflow Alternatives | Superflow".
   */
  noBrandSuffix?: boolean;
  /** Set true on /thank-you, success pages, etc. */
  noindex?: boolean;
};

/**
 * Builds the path of a page's Markdown copy.
 *
 * The suffix goes on the PATHNAME, never on the end of the whole string:
 * `proxy.ts` decides what to serve from the pathname's suffix, so
 * `/directory?category=seo.md` is a request for `/directory` and comes back
 * as HTML - an advertised copy that is not a copy. A page with a query in
 * its canonical (the directory list, filtered or paged) is the case that
 * found this.
 *
 * @param path - The page's path, with or without a query string.
 * @returns The path of its Markdown copy.
 */
function markdownPath(path: string): string {
  try {
    const queryIndex = path.indexOf("?");
    const pathname = queryIndex === -1 ? path : path.slice(0, queryIndex);
    const query = queryIndex === -1 ? "" : path.slice(queryIndex);
    // The homepage has no slug to suffix.
    const base = pathname === "/" || pathname === "" ? "/index" : pathname;
    return `${base}.md${query}`;
  } catch {
    return path;
  }
}

/**
 * Build a complete Next.js Metadata object for a page.
 *
 * @param input - Page metadata inputs.
 * @returns Metadata with canonical, openGraph, twitter, and robots set.
 */
export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  try {
    const {
      path,
      ogImage = DEFAULT_OG_IMAGE,
      noBrandSuffix = false,
      noindex = false,
    } = input;
    const title = stripEmDashes(input.title);
    const description = stripEmDashes(input.description);
    const socialTitle = input.socialTitle
      ? stripEmDashes(input.socialTitle)
      : undefined;

    // Strip any pre-existing " | Superflow" or " — Superflow" suffix before
    // building the social title — Sanity metaTitle values arrive with either
    // form attached. Without this normalization og/twitter titles render
    // "Foo | Superflow | Superflow" or "Foo — Superflow | Superflow".
    const SUFFIX_RE = /\s*[—|]\s*Superflow\s*$/i;
    const bareTitle = title.replace(SUFFIX_RE, "");
    const social =
      socialTitle ?? (noBrandSuffix ? bareTitle : `${bareTitle} | ${SITE_NAME}`);
    const absoluteUrl = `${SITE_URL}${path === "/" ? "" : path}`;

    // Skip the title template (set in app/layout.tsx) when the caller has
    // already included the "| Superflow" suffix, or has opted out via
    // `noBrandSuffix` — using `absolute` bypasses the template so the page
    // title in the browser tab stays exactly as authored.
    const titleNode =
      noBrandSuffix || SUFFIX_RE.test(title) ? { absolute: title } : title;

    return {
      title: titleNode,
      description,
      alternates: {
        canonical: path,
        // Every page publishes a Markdown copy at its own path plus `.md`
        // (the homepage at /index.md, which has no slug to suffix). Advertising
        // it here is what lets an agent find the copy without guessing the
        // convention - the same job the `Link` response header does for a
        // client that only reads headers. Served by proxy.ts -> app/api/md.
        types: {
          "text/markdown": markdownPath(path),
        },
      },
      openGraph: {
        type: "website",
        url: absoluteUrl,
        siteName: SITE_NAME,
        title: social,
        description,
        locale: "en_US",
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: social,
        description,
        images: [ogImage],
      },
      robots: noindex
        ? { index: false, follow: true }
        : {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              "max-image-preview": "large",
              "max-snippet": -1,
              "max-video-preview": -1,
            },
          },
    };
  } catch {
    return {
      title: input.title,
      description: input.description,
    };
  }
}
