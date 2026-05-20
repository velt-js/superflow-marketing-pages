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

const SITE_NAME = "Velt";
const DEFAULT_OG_IMAGE = "/opengraph-image.png";

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
  /** Set true on /thank-you, success pages, etc. */
  noindex?: boolean;
};

/**
 * Build a complete Next.js Metadata object for a page.
 *
 * @param input - Page metadata inputs.
 * @returns Metadata with canonical, openGraph, twitter, and robots set.
 */
export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  try {
    const {
      title,
      description,
      path,
      ogImage = DEFAULT_OG_IMAGE,
      socialTitle,
      noindex = false,
    } = input;

    // Strip any pre-existing " | Velt" or " — Velt" suffix before building
    // the social title — Sanity metaTitle values arrive with either form
    // attached. Without this normalization og/twitter titles render
    // "Foo | Velt | Velt" or "Foo — Velt | Velt".
    const SUFFIX_RE = /\s*[—|]\s*Velt\s*$/i;
    const bareTitle = title.replace(SUFFIX_RE, "");
    const social = socialTitle ?? `${bareTitle} | ${SITE_NAME}`;
    const absoluteUrl = `${SITE_URL}${path === "/" ? "" : path}`;

    // Skip the title template (set in app/layout.tsx) when the caller has
    // already included the "| Velt" suffix — using `absolute` bypasses the
    // template so the page title in the browser tab stays exactly as
    // authored.
    const titleNode = SUFFIX_RE.test(title) ? { absolute: title } : title;

    return {
      title: titleNode,
      description,
      alternates: {
        canonical: path,
      },
      openGraph: {
        type: "website",
        url: absoluteUrl,
        siteName: SITE_NAME,
        title: social,
        description,
        locale: "en_US",
        images: [{ url: ogImage }],
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
