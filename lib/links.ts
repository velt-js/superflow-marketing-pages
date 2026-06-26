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

/**
 * Matches protocol-relative URLs (e.g. "//evil.com"). These resolve to an
 * absolute off-site destination in the browser even though they begin with a
 * slash, so they must be treated as EXTERNAL — never as same-origin internal
 * paths.
 */
const PROTOCOL_RELATIVE_PATTERN = /^\/\//;

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
 * Decision for protocol-relative values ("//host/..."): they are left exactly
 * as-is (NOT slash-prepended), because they already point off-site. Prepending
 * a slash would turn them into a "/host" same-origin path, masking the external
 * destination. Pair this with `isExternalHref`, which classifies them as
 * external so callers attach `rel="noopener noreferrer"`.
 *
 * Input is trimmed before prefix/scheme detection (scheme matching is
 * case-insensitive) so stray whitespace can't bypass these checks.
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

    // Protocol-relative ("//host") is off-site: leave it untouched so it is
    // never mistaken for a "/host" same-origin path.
    if (PROTOCOL_RELATIVE_PATTERN.test(trimmed)) return href;

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
 * Reports whether an href points to an external destination, used to decide
 * `target="_blank"` / `rel="noopener noreferrer"` based on the ORIGINAL value,
 * independent of internal-href normalization.
 *
 * External means an absolute http(s) URL OR a protocol-relative URL
 * ("//host/..."), since both navigate off the current origin. Scheme detection
 * is case-insensitive and the value is trimmed first so whitespace can't hide
 * the prefix.
 *
 * @param href - The raw href value to inspect.
 * @returns `true` when the value resolves to an off-site destination.
 */
export function isExternalHref(href?: string | null): boolean {
  try {
    if (!href) return false;
    const trimmed = href.trim();
    return (
      ABSOLUTE_URL_PATTERN.test(trimmed) ||
      PROTOCOL_RELATIVE_PATTERN.test(trimmed)
    );
  } catch {
    return false;
  }
}
