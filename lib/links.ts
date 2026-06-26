// Helpers for normalizing CMS-authored links.
//
// Sanity's link schema allows relative URLs (`allowRelative: true`), so editors
// can store internal targets without a leading slash (e.g. "checklist",
// "integrations/asana"). When such a value is rendered straight into an
// `<a href>` / `<Link href>`, the browser treats it as RELATIVE to the current
// route, compounding paths like
// `/alternative/.../checklist/integrations/comparisons/...`.
// `toInternalHref` guarantees internal targets resolve from the site root.

/** Matches absolute http(s) URLs (also covers protocol like "HTTPS://"). */
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

/** Prefixes that must never be turned into root-absolute paths. */
const NON_NAVIGABLE_PREFIXES = ["#", "mailto:", "tel:"] as const;

/** Leading character that marks an href as already root-absolute. */
const ROOT_PREFIX = "/";

/**
 * Normalizes a possibly-relative internal href into a root-absolute path.
 * Leaves anchors, mailto:, tel:, and absolute http(s) URLs untouched.
 * Internal paths missing a leading slash get one prepended, preventing
 * relative links from compounding against the current route.
 *
 * @param href - The raw href value, typically sourced from Sanity/CMS.
 * @returns The normalized href, or `undefined` when `href` is empty/falsy.
 */
export function toInternalHref(href?: string | null): string | undefined {
  try {
    if (!href) return undefined;

    const trimmed = href.trim();
    if (trimmed.length === 0) return href;

    if (ABSOLUTE_URL_PATTERN.test(trimmed)) return href;

    const isNonNavigable = NON_NAVIGABLE_PREFIXES.some((prefix) =>
      trimmed.startsWith(prefix),
    );
    if (isNonNavigable) return href;

    if (trimmed.startsWith(ROOT_PREFIX)) return href;

    return `${ROOT_PREFIX}${trimmed}`;
  } catch {
    // Defensive: never let link normalization throw at render time.
    return href ?? undefined;
  }
}

/**
 * Reports whether an href points to an external http(s) destination. Useful for
 * deciding `target="_blank"` / `rel="noopener"` based on the ORIGINAL value,
 * independent of internal-href normalization.
 *
 * @param href - The raw href value to inspect.
 * @returns `true` when the value is an absolute http(s) URL.
 */
export function isExternalHref(href?: string | null): boolean {
  try {
    if (!href) return false;
    return ABSOLUTE_URL_PATTERN.test(href.trim());
  } catch {
    return false;
  }
}
