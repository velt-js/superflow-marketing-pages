// Cover card for the Bug Book collection page.
//
// GET /api/bug-book/cover-card?format=landscape
//
// The per-entry cards lead with somebody's words; the hub has no single
// quote to feature, so this one is typographic - the credential, the
// title, and the promise. Renders no CMS data at all, so it is fast and
// cannot break when content rotates.

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import {
  CARD_COVER_GRADIENT,
  CARD_FORMATS,
  CARD_GROUND,
  CARD_TRUST,
  CARD_URL,
  resolveCardFormat,
} from "@/lib/bug-book-cards";

export const runtime = "nodejs";

const KICKER = "MINED FROM 550K REVIEW THREADS";
const TITLE = "The Bug Book";
const SUBHEAD =
  "Bugs, typos, and rage clicks caught on real client sites - by humans in review, and by our AI agents.";

export function GET(request: NextRequest): Response {
  try {
    const { width, height } =
      CARD_FORMATS[resolveCardFormat(request.nextUrl.searchParams.get("format"))];
    const pad = Math.round(width * 0.075);
    // Wide crops get a smaller title so the subhead still fits under it.
    const titleSize = Math.round(width * (height < width ? 0.105 : 0.135));

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
            backgroundImage: CARD_COVER_GRADIENT,
            padding: `${pad}px`,
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.6)",
              fontSize: Math.round(width * 0.021),
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            {KICKER}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: Math.round(pad * 0.34),
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#ffffff",
                fontSize: titleSize,
                fontWeight: 700,
                lineHeight: 1.02,
                letterSpacing: -3,
              }}
            >
              {TITLE}
            </div>
            <div
              style={{
                display: "flex",
                color: "rgba(255,255,255,0.72)",
                fontSize: Math.round(width * 0.029),
                lineHeight: 1.35,
                maxWidth: Math.round(width * 0.78),
              }}
            >
              {SUBHEAD}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
              borderTop: "1px solid rgba(255,255,255,0.16)",
              paddingTop: Math.round(pad * 0.5),
              color: "rgba(255,255,255,0.5)",
              fontSize: Math.round(width * 0.022),
            }}
          >
            <div style={{ display: "flex" }}>{CARD_TRUST}</div>
            <div style={{ display: "flex" }}>{CARD_URL}</div>
          </div>
        </div>
      ),
      {
        width,
        height,
        headers: {
          // Nothing here comes from the CMS, so it can cache indefinitely.
          "Cache-Control": "public, max-age=86400, s-maxage=604800",
        },
      },
    );
  } catch {
    return new Response("Could not render the cover card.", { status: 500 });
  }
}
