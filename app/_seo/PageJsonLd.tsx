// Shared per-page JSON-LD emitter. Renders the standard pair of schemas
// — WebPage and BreadcrumbList — that every marketing route should
// expose. Routes with additional structured data (FAQPage, Product,
// SoftwareApplication, etc.) compose this alongside a hand-rolled
// JsonLd block (see app/pricing/page.tsx for the canonical example).
//
// The Organization + WebSite schemas are emitted once site-wide from
// app/layout.tsx, so this component never duplicates them.

import { JsonLd } from "./JsonLd";
import {
  SITE_URL,
  buildBreadcrumbList,
  buildWebPageSchema,
} from "./schema";

export interface PageJsonLdProps {
  /** Display name for the page, used in the WebPage schema. Include the
   *  brand suffix (e.g. "Security and Privacy | Superflow") to match the
   *  rendered <title>. */
  name: string;
  /** Meta description — falls back to the WebPage having no description. */
  description?: string;
  /** Path under SITE_URL, with leading slash (e.g. "/pricing"). Use "/"
   *  for the homepage — the breadcrumb collapses to a single Home node. */
  path: string;
  /** Breadcrumb trail after Home. For nested pages, pass the intermediate
   *  parents in order, each with `name` and absolute `url`. The final
   *  entry's `url` is implicit (it's the current page). For pages with no
   *  parent (e.g. /security), pass a single-entry array with the page
   *  name and url. Omit for the homepage. */
  trail?: Array<{ name: string; url: string }>;
}

/**
 * Emit a `<script type="application/ld+json">` block per schema — one
 * WebPage and (when `trail` is provided) one BreadcrumbList. IDs are
 * derived from the path so duplicates are easy to spot in dev tools.
 *
 * @param props - Component props (see PageJsonLdProps).
 */
export function PageJsonLd({
  name,
  description,
  path,
  trail,
}: PageJsonLdProps) {
  try {
    const url = `${SITE_URL}${path === "/" ? "" : path}`;
    const slug = path === "/" ? "home" : path.replace(/^\/+|\/+$/g, "").replace(/\//g, "-");

    const breadcrumb =
      trail && trail.length > 0
        ? buildBreadcrumbList([{ name: "Home", url: SITE_URL }, ...trail])
        : undefined;

    const webpage = buildWebPageSchema({
      name,
      description,
      url,
      breadcrumb,
    });

    return (
      <>
        <JsonLd id={`ld-webpage-${slug}`} data={webpage} />
        {breadcrumb && (
          <JsonLd id={`ld-breadcrumb-${slug}`} data={breadcrumb} />
        )}
      </>
    );
  } catch {
    return null;
  }
}
