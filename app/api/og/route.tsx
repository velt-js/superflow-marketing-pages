// Runtime social-card renderer.
//
// Static marketing pages ship committed PNGs (see `app/_seo/og-images.ts`).
// CMS-backed pages cannot: their titles live in Sanity and change without a
// deploy, so a committed file would either go stale or 404 for new documents.
// This route renders the same Figma template on demand from the doc's title,
// using the shared modules in `lib/og/` so the two paths cannot drift.
//
// Build the URL with `ogCardUrl()` from `lib/og/card-url` rather than
// hand-writing the query string.

import { ImageResponse } from "next/og";
import {
  MAX_TITLE_LENGTH,
  OG_CARD_TITLE_PARAM,
} from "@/lib/og/card-url";
import { createCard } from "@/lib/og/card.mjs";
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from "@/lib/og/constants.mjs";
import { getBoldFontData, loadFonts } from "@/lib/og/fonts.mjs";

// Reads only its own query string, so it can be cached hard at the edge.
export const runtime = "nodejs";

/** A year, in seconds - cards only change when their title does. */
const CACHE_MAX_AGE_SECONDS = 31_536_000;

/**
 * Render a social card for the `title` query parameter.
 *
 * @param {Request} request - Incoming request.
 * @returns {Promise<Response>} PNG response, or 400 when `title` is missing.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const rawTitle = searchParams.get(OG_CARD_TITLE_PARAM)?.trim();

    if (!rawTitle) {
      return new Response(`Missing required "${OG_CARD_TITLE_PARAM}" parameter`, {
        status: 400,
      });
    }

    // Bound the work an arbitrary caller can ask for. The fitter would shrink
    // a runaway title to the floor size anyway; this keeps the URL sane and
    // the render cheap.
    const title = rawTitle.slice(0, MAX_TITLE_LENGTH);

    const fonts = await loadFonts();
    const { element } = createCard({ title, boldFontData: getBoldFontData(fonts) });

    const image = new ImageResponse(element, {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      fonts,
    });

    // ImageResponse sets its own short cache header; social scrapers refetch
    // rarely and the output is a pure function of the title, so override it.
    const headers = new Headers(image.headers);
    headers.set(
      "cache-control",
      `public, immutable, no-transform, max-age=${CACHE_MAX_AGE_SECONDS}`,
    );

    return new Response(image.body, { status: image.status, headers });
  } catch (error) {
    // A broken card must never take a page's metadata down with it - the
    // caller falls back to the site-wide image when this 500s.
    console.error("[og] card render failed:", error);
    return new Response("Could not render the card", { status: 500 });
  }
}
