import { defineType, defineField } from "sanity";

// Editor-facing nudge. We keep `allowRelative: true` because existing content
// relies on relative values, but a bare relative path (no leading "/") makes
// the browser resolve the link against the CURRENT route, compounding URLs like
// `/alternative/.../checklist/integrations/...`. The runtime `toInternalHref`
// helper repairs this on render; this warning steers editors toward authoring
// root-absolute internal links in the first place. It is a `.warning()` (not an
// error) so already-saved relative docs don't become invalid.
export const RELATIVE_LINK_WARNING =
  'Internal links should start with "/" (e.g. "/integrations/asana") so they resolve from the site root instead of compounding onto the current page path.';

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const SAFE_PREFIXES = ["/", "#", "mailto:", "tel:"];

/**
 * Flags relative internal hrefs that are missing a leading slash.
 *
 * @param value - The authored href value.
 * @returns `true` when acceptable, otherwise a warning message string.
 */
export function warnOnRelativeInternalHref(value?: string): true | string {
  try {
    if (!value) return true;

    const trimmed = value.trim();
    if (trimmed.length === 0) return true;

    if (ABSOLUTE_URL_PATTERN.test(trimmed)) return true;
    if (SAFE_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) return true;

    return RELATIVE_LINK_WARNING;
  } catch {
    // Never block authoring if validation itself throws.
    return true;
  }
}

// Inline body link annotation. Type's `name` MUST be "link" to match
// `_type: "link"` produced by MainTouch's blog migrations + by the
// Portable Text editor's built-in link button. Export name
// `linkAnnotation` keeps the module readable.
export const linkAnnotation = defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "href",
      title: "URL",
      type: "url",
      validation: (rule) => [
        rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
        rule.custom(warnOnRelativeInternalHref).warning(),
      ],
    }),
  ],
});
