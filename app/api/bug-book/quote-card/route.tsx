// Shareable quote cards for the Bug Book.
//
// GET /api/bug-book/quote-card?slug=crap-i-built-it&format=portrait
//
// Renders one entry's pull-quote as a social-ready image in the same
// visual language as the cards on /bug-book: near-black ground, a
// purple-red wash keyed to the entry's vibe, the quote large, the
// speaker underneath. Every card carries the anonymisation line, because
// out of context on a feed that promise has to travel with the quote.
//
// Rendered with `next/og`, already a dependency via Next itself, so this
// adds no packages.

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { getBugBookEntryBySlug } from "@/sanity/lib/queries";

export const runtime = "nodejs";

/** Social crops worth having. Square is the safe default. */
const FORMATS = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1200, height: 630 },
} as const;

type FormatName = keyof typeof FORMATS;

const DEFAULT_FORMAT: FormatName = "square";

/** Same washes the site cards use, so a post and the page match. */
const VIBE_GRADIENTS: Record<string, string> = {
  rage:
    "radial-gradient(120% 120% at 15% 10%, #7b1330 0%, transparent 55%), radial-gradient(120% 130% at 95% 95%, #b8341c 0%, transparent 60%)",
  sass:
    "radial-gradient(120% 120% at 12% 12%, #5b1a7a 0%, transparent 55%), radial-gradient(130% 130% at 95% 90%, #c02a6d 0%, transparent 62%)",
  comedy:
    "radial-gradient(120% 120% at 15% 8%, #3b2296 0%, transparent 55%), radial-gradient(130% 130% at 92% 95%, #9333ea 0%, transparent 60%)",
  story:
    "radial-gradient(120% 120% at 10% 12%, #2f1b6b 0%, transparent 58%), radial-gradient(130% 130% at 96% 92%, #7a1f5c 0%, transparent 60%)",
};

const FOOTER_TRUST = "Names removed. Screenshots redacted.";
const FOOTER_BRAND = "The Superflow Bug Book";
const FOOTER_URL = "usesuperflow.ai/bug-book";

/** Resolves the requested crop, falling back rather than erroring. */
function resolveFormat(value: string | null): FormatName {
  return value && value in FORMATS ? (value as FormatName) : DEFAULT_FORMAT;
}

/**
 * Quote size for a given crop. Longer quotes step down so the card never
 * overflows - the same trade the cards on the site make, scaled up.
 */
function quoteFontSize(length: number, width: number, height: number): number {
  const base =
    length <= 40 ? 92 : length <= 80 ? 74 : length <= 140 ? 58 : 46;
  // Narrow-but-tall crops get a touch more room; landscape gets less.
  const scale = height >= width * 1.5 ? 1.08 : height < width ? 0.72 : 1;
  return Math.round(base * scale);
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const params = request.nextUrl.searchParams;
    const slug = (params.get("slug") ?? "").trim().slice(0, 120);
    if (!slug) {
      return new Response("Pass ?slug=<bug-book-slug>.", { status: 400 });
    }

    const entry = await getBugBookEntryBySlug(slug);
    if (!entry?.pullQuote) {
      return new Response("No quote card for that slug.", { status: 404 });
    }

    const { width, height } = FORMATS[resolveFormat(params.get("format"))];
    const gradient = VIBE_GRADIENTS[entry.vibe ?? ""] ?? VIBE_GRADIENTS.story;
    const pad = Math.round(width * 0.09);
    const fontSize = quoteFontSize(entry.pullQuote.length, width, height);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#131017",
            backgroundImage: gradient,
            padding: `${pad}px`,
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: Math.round(width * 0.075),
              fontWeight: 700,
              color: "rgba(255,255,255,0.38)",
              lineHeight: 1,
            }}
          >
            &ldquo;
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: Math.round(pad * 0.42),
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#ffffff",
                fontSize,
                fontWeight: 600,
                lineHeight: 1.24,
                letterSpacing: -1.5,
              }}
            >
              {entry.pullQuote}
            </div>
            {entry.pullQuoteSpeaker ? (
              <div
                style={{
                  display: "flex",
                  color: "rgba(255,255,255,0.62)",
                  // Floor it: on a long quote the proportional size
                  // would drop below legibility on a phone feed.
                  fontSize: Math.max(
                    Math.round(fontSize * 0.32),
                    Math.round(width * 0.026),
                  ),
                  fontWeight: 600,
                }}
              >
                {entry.pullQuoteSpeaker}
                {entry.siteDescriptor ? ` · ${entry.siteDescriptor}` : ""}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
              borderTop: "1px solid rgba(255,255,255,0.16)",
              paddingTop: Math.round(pad * 0.5),
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: "#ffffff",
                  fontSize: Math.round(width * 0.028),
                  fontWeight: 700,
                }}
              >
                {FOOTER_BRAND}
              </div>
              <div
                style={{
                  display: "flex",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: Math.round(width * 0.022),
                }}
              >
                {FOOTER_TRUST}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                color: "rgba(255,255,255,0.5)",
                fontSize: Math.round(width * 0.022),
              }}
            >
              {FOOTER_URL}
            </div>
          </div>
        </div>
      ),
      {
        width,
        height,
        headers: {
          // Cards change only when the CMS entry does, so cache them hard
          // at the edge and revalidate hourly.
          "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
      },
    );
  } catch {
    // A broken card must never break whatever referenced it.
    return new Response("Could not render the quote card.", { status: 500 });
  }
}
