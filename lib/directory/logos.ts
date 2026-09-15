// Which image to paint in an agency's logo slot.
//
// THE PROBLEM THIS SOLVES
//
// Every record's `logoUrl` points at the SOURCE directory's avatar, not at
// the agency. Awwwards serves those at whatever size the studio uploaded,
// Semrush crops them square, and D&AD publishes none at all - so the grid
// rendered a row of 44px grey squares: source avatars that were never
// meant to be seen at that size, sitting next to blanks.
//
// Three fallbacks, in order, and each one is a real improvement over the
// next:
//
//   1. A logo WE fetched from the agency's own site at 128px and cached
//      under public/agency-logos/ (scripts/directory-import/fetch-agency-logos.mjs
//      writes both the file and ./data/logos.json). Served from our own
//      origin, so it cannot 404 when a source rotates its CDN paths, and
//      it is the agency's real mark rather than a directory's crop.
//   2. The source avatar, hotlinked as before.
//   3. A monogram tile - the agency's initials on a colour derived from
//      its slug. Not a placeholder graphic: it is stable per agency, so a
//      studio without a logo still looks like itself across the grid and
//      the profile page rather than like a broken image.
//
// The manifest is a committed file rather than a runtime fetch because
// these are build-time assets: the fetch script runs alongside the
// importers, and a missing entry degrades to (2) or (3) with no request
// made.

import logosData from "./data/logos.json";

/** Edge length the cached logos are fetched and stored at. Rendered
 *  smaller everywhere (44px on a card, 56px on a profile), so this is the
 *  2x/3x source rather than the display size. */
export const LOGO_SOURCE_SIZE = 128;

/** Where cached logos are served from. Deliberately NOT under /directory:
 *  that prefix is a route namespace, and a static file living inside it
 *  is one routing change away from being shadowed by a page. */
const LOGO_PUBLIC_PREFIX = "/agency-logos";

/** One cached logo, as recorded by the fetch script. */
interface CachedLogo {
  /** File name inside LOGO_PUBLIC_PREFIX, e.g. "locomotive.png". */
  file: string;
  /** Real pixel dimensions of the stored file, read from its header
   *  rather than assumed - a source that served a 48px icon when asked
   *  for 128 must not be described here as 128. */
  width: number;
  height: number;
  /** Where the image came from: "og-image", "apple-touch-icon", "icon".
   *  Kept so a bad-looking logo can be traced without a re-fetch. */
  from: string;
}

/** Shape of lib/directory/data/logos.json. */
interface LogoManifest {
  source: string;
  updatedAt: string | null;
  logos: Record<string, CachedLogo>;
}

/** Cached logos keyed by agency slug. */
const CACHED_LOGOS: Record<string, CachedLogo> = (() => {
  try {
    return (logosData as LogoManifest)?.logos ?? {};
  } catch {
    return {};
  }
})();

/** Minimum edge a cached logo needs for it to beat the source avatar.
 *  Below this we are serving our own thumbnail of a favicon, which is not
 *  better than what the source published - it is just ours. */
const MIN_USABLE_LOGO_EDGE = 48;

/** A resolved logo image. */
export interface ResolvedLogo {
  src: string;
  /** True when the file is served from our own origin, which is what lets
   *  next/image optimise it without a remotePatterns entry. */
  local: boolean;
}

/**
 * Resolves the logo image for an agency.
 *
 * @param slug - The agency's slug, the cache manifest's key.
 * @param sourceLogoUrl - The source directory's avatar URL, or null.
 * @param claimLogoUrl - A logo set on the claim overlay, which wins over
 *                        everything: it is either the agency's own choice
 *                        or a correction we made deliberately.
 * @returns The image to render, or null when only a monogram is possible.
 */
export function resolveAgencyLogo(
  slug: string | null | undefined,
  sourceLogoUrl: string | null | undefined,
  claimLogoUrl?: string | null,
): ResolvedLogo | null {
  try {
    const override = claimLogoUrl?.trim();
    if (override) return { src: override, local: override.startsWith("/") };

    const cached = slug ? CACHED_LOGOS[slug] : undefined;
    if (cached?.file && Math.min(cached.width, cached.height) >= MIN_USABLE_LOGO_EDGE) {
      return { src: `${LOGO_PUBLIC_PREFIX}/${cached.file}`, local: true };
    }

    const source = sourceLogoUrl?.trim();
    if (source) return { src: source, local: source.startsWith("/") };

    return null;
  } catch {
    return null;
  }
}

/** Characters dropped before initials are taken, so "Studio (Berlin)"
 *  and "&Walsh" yield letters rather than punctuation. */
const NON_INITIAL_CHARS = /[^\p{L}\p{N}\s]/gu;

/** Words that never contribute an initial. "The Working Party" reads as
 *  WP, not TW - the article is not part of how anyone says the name. */
const INITIAL_STOPWORDS = new Set(["the", "a", "an", "and", "of", "for", "de", "la", "le"]);

/**
 * Builds the initials shown on a monogram tile.
 *
 * One letter for a single-word name, two for anything longer. Three-letter
 * monograms were tried and read as an acronym the studio does not use.
 *
 * @param name - The agency's display name.
 * @returns One or two uppercase characters, or "?" when the name yields
 *          nothing (never an empty tile).
 */
export function agencyInitials(name: string | null | undefined): string {
  try {
    const words = (name ?? "")
      .replace(NON_INITIAL_CHARS, " ")
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0 && !INITIAL_STOPWORDS.has(word.toLowerCase()));

    if (words.length === 0) {
      const fallback = (name ?? "").replace(/\s/g, "").slice(0, 1).toUpperCase();
      return fallback || "?";
    }
    if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  } catch {
    return "?";
  }
}

/** How many hues the monogram palette is spread across. A prime-ish
 *  spacing keeps adjacent slugs from landing on the same colour. */
const MONOGRAM_HUE_STEPS = 360;

/**
 * Picks a stable hue for an agency's monogram tile.
 *
 * Derived from the slug, so the same agency gets the same colour on every
 * page and across deploys. A random or index-derived colour would make
 * the grid reshuffle its own palette every time the ranking changed.
 *
 * @param slug - The agency's slug.
 * @returns A hue in degrees, 0-359.
 */
export function monogramHue(slug: string | null | undefined): number {
  try {
    const value = slug ?? "";
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) % MONOGRAM_HUE_STEPS;
    }
    return Math.abs(hash) % MONOGRAM_HUE_STEPS;
  } catch {
    return 0;
  }
}
