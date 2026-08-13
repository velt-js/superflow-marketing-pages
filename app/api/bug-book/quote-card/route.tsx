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
import {
  CARD_BRAND,
  CARD_FORMATS,
  CARD_GROUND,
  CARD_TRUST,
  CARD_URL,
  CARD_VIBE_GRADIENTS,
  resolveCardFormat,
} from "@/lib/bug-book-cards";

export const runtime = "nodejs";

/**
 * Speaker and site now both often begin "Client", which rendered as
 * "Client · Client site". When the site already leads with the speaker's
 * word, the site alone says it.
 */
function buildAttribution(speaker?: string, site?: string): string {
  if (!speaker) return site ?? "";
  if (!site) return speaker;
  const firstWord = site.split(/[\s·]/)[0]?.toLowerCase().replace(/'s$/, "");
  return firstWord === speaker.toLowerCase() ? site : `${speaker} · ${site}`;
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

    const { width, height } =
      CARD_FORMATS[resolveCardFormat(params.get("format"))];
    const attribution = buildAttribution(
      entry.pullQuoteSpeaker,
      entry.siteDescriptor,
    );
    const gradient =
      CARD_VIBE_GRADIENTS[entry.vibe ?? ""] ?? CARD_VIBE_GRADIENTS.story;
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
            backgroundColor: CARD_GROUND,
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
            {attribution ? (
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
                {attribution}
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
                {CARD_BRAND}
              </div>
              <div
                style={{
                  display: "flex",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: Math.round(width * 0.022),
                }}
              >
                {CARD_TRUST}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                color: "rgba(255,255,255,0.5)",
                fontSize: Math.round(width * 0.022),
              }}
            >
              {CARD_URL}
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
