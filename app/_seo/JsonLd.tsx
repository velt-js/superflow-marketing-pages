// Server-rendered JSON-LD helper.
//
// Renders a <script type="application/ld+json"> tag with the supplied
// schema.org payload. The `_seo` parent folder uses the `_` prefix so
// Next.js excludes it from the route tree (per the Next.js file-system
// routing rules).
//
// Usage:
//   import { JsonLd } from "@/app/_seo/JsonLd";
//   <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", ... }} />
//
// We escape `<` so a malicious string in the payload can't break out of
// the script tag (defence-in-depth — schema payloads on this site are
// authored, but Sanity-driven fields like blog titles still flow through).

/**
 * Serialise a JSON-LD payload into a string safe to inline inside a
 * `<script type="application/ld+json">` tag. Replaces `<` with the
 * unicode escape `<` so payloads containing `</script>` cannot
 * close the surrounding tag.
 *
 * @param data - Plain object representing a schema.org graph node.
 * @returns Stringified JSON with HTML-sensitive characters escaped.
 */
function serialiseJsonLd(data: Record<string, unknown>): string {
  try {
    return JSON.stringify(data).replace(/</g, "\\u003c");
  } catch {
    // Defensive fallback — JSON.stringify can throw on circular refs.
    // Returning an empty object keeps the script tag valid JSON-LD.
    return "{}";
  }
}

/**
 * Inline JSON-LD structured-data block. Render this anywhere inside a
 * server component (typically near the bottom of the page tree, but
 * placement is not significant to crawlers).
 *
 * @param props - Component props.
 * @param props.data - Schema.org graph node to serialise.
 * @param props.id - Optional `id` attribute so duplicate detection /
 *                   debugging is easier in the rendered HTML.
 */
export function JsonLd({
  data,
  id,
}: {
  data: Record<string, unknown>;
  id?: string;
}) {
  // Serialisation is wrapped in try/catch inside `serialiseJsonLd`, so
  // rendering itself can never throw at component-construction time.
  // (React swallows render errors via error boundaries, so wrapping
  // JSX in try/catch here would be ineffective anyway.)
  const html = serialiseJsonLd(data);
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
