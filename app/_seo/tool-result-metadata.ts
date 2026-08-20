// Metadata for a tool page, which is two pages wearing one route.
//
// THE LANDING PAGE AND THE SHARED RESULT
//
// `/tools/social-preview-checker` is a landing page: indexable, targeting the
// tool's keywords, carrying the site card. `/tools/social-preview-checker?url=
// stripe.com` is somebody's shared result: it must carry a card about stripe.com
// and it must NOT compete with the landing page in search. So a result gets
// its own title, its own Open Graph image, `noindex`, and a canonical pointing
// back at the bare page.
//
// WHAT THIS COSTS, STATED PLAINLY
//
// Reading `searchParams` in `generateMetadata` makes the route dynamic, so a
// tool page is server-rendered per request rather than served static. That is
// the price of a shared link unfurling with a real card, and it is worth it:
// the card is the distribution. The read itself is one KV GET with a 2.5
// second ceiling that fails closed to the landing metadata, so a slow or
// missing cache costs a page nothing but the miss.
//
// This is the same trade the AI Visibility Checker made when it shipped the
// first version of this pattern. This module is that page's `generateMetadata`
// generalised, so twelve tools share one implementation instead of twelve
// copies drifting apart.

import type { Metadata } from "next";
import { buildPageMetadata } from "./page-metadata";
import { shareCardUrl } from "@/lib/tools/share/links";
import { readSharedResult } from "@/lib/tools/share/read";

export type ToolPageMetadataInput = {
  /** Registry slug, e.g. "social-preview-checker". */
  slug: string;
  /** The page's own path, e.g. "/tools/social-preview-checker". */
  path: string;
  /** Landing page title, without the site suffix. */
  title: string;
  /** Landing page meta description. */
  description: string;
  /** The `?url=` off the request, when there is one. */
  rawUrl?: string;
};

/**
 * Builds the metadata for a tool page, result-aware.
 *
 * @param input - The tool's landing copy and the requested `?url=`.
 * @returns Result metadata when a cached run exists for that URL, and the
 *   landing metadata otherwise.
 */
export async function buildToolPageMetadata(
  input: ToolPageMetadataInput,
): Promise<Metadata> {
  const landing = () =>
    buildPageMetadata({
      title: input.title,
      description: input.description,
      path: input.path,
    });

  try {
    const shared = await readSharedResult(input.slug, input.rawUrl);
    if (!shared) return landing();

    const { snapshot } = shared;

    return {
      ...buildPageMetadata({
        title: snapshot.headline,
        description: snapshot.summary,
        path: input.path,
        ogImage: shareCardUrl(snapshot),
        // A result is a view of the tool page, not a document of its own. Left
        // indexable, every checked URL would spawn a near-duplicate competing
        // with the page we actually want ranked.
        noindex: true,
      }),
      alternates: { canonical: input.path },
    };
  } catch {
    return landing();
  }
}
