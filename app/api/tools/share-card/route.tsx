// Open Graph share card for tool results.
//
// GET /api/tools/share-card?domain=example.com&score=72&grade=B&tool=...
//
// Rendered with `next/og`, which the repo already depends on through Next
// itself (see scripts/og-image/generate-og.mjs), so this adds no package.
//
// Everything is drawn from query parameters and nothing is fetched, so a card
// renders in a few milliseconds and a crafted URL cannot make this endpoint
// do work on someone else's behalf.

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const WIDTH = 1200;
const HEIGHT = 630;

/** Same thresholds the report uses, duplicated because this runs standalone. */
function colorForScore(score: number): string {
  if (score >= 90) return "#1a8f5f";
  if (score >= 75) return "#4a9d3f";
  if (score >= 60) return "#c08a00";
  if (score >= 40) return "#d4661f";
  return "#c8362f";
}

/**
 * Clamps and sanitises a query parameter so a crafted URL cannot inject
 * unbounded text into the card.
 *
 * @param value - The raw parameter.
 * @param maxLength - Maximum characters to keep.
 */
function clean(value: string | null, maxLength: number): string {
  try {
    return (value ?? "")
      // Strip control characters only, so a crafted value cannot inject
      // newlines or terminators into the rendered card.
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .trim()
      .slice(0, maxLength);
  } catch {
    return "";
  }
}

export function GET(request: NextRequest): Response {
  try {
    const params = request.nextUrl.searchParams;

    const domain = clean(params.get("domain"), 48) || "your site";
    const rawScore = Number(params.get("score"));
    const score = Number.isFinite(rawScore)
      ? Math.max(0, Math.min(100, Math.round(rawScore)))
      : 0;
    const grade = clean(params.get("grade"), 1).toUpperCase() || "F";
    const accent = colorForScore(score);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#ffffff",
            padding: "72px",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                fontSize: 26,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#8a8a90",
                display: "flex",
              }}
            >
              AI Visibility Score
            </div>
            <div
              style={{
                fontSize: 60,
                fontWeight: 700,
                color: "#1e1e1f",
                display: "flex",
              }}
            >
              {domain}
            </div>
          </div>

          <div
            style={{ display: "flex", alignItems: "flex-end", gap: "28px" }}
          >
            <div
              style={{
                fontSize: 220,
                fontWeight: 700,
                lineHeight: 1,
                color: accent,
                display: "flex",
              }}
            >
              {score}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingBottom: "26px",
                gap: "10px",
              }}
            >
              <div
                style={{ fontSize: 38, color: "#8a8a90", display: "flex" }}
              >
                out of 100
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "70px",
                  height: "70px",
                  borderRadius: "18px",
                  background: accent,
                  color: "#ffffff",
                  fontSize: 44,
                  fontWeight: 700,
                }}
              >
                {grade}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "2px solid #ececee",
              paddingTop: "28px",
            }}
          >
            <div style={{ fontSize: 30, color: "#5b5b60", display: "flex" }}>
              Can ChatGPT, Claude, and Perplexity read this site?
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 600,
                color: "#1e1e1f",
                display: "flex",
              }}
            >
              usesuperflow.ai/tools
            </div>
          </div>
        </div>
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        headers: {
          // Cards are pure functions of the query string, so they cache hard.
          "Cache-Control": "public, max-age=3600, s-maxage=86400, immutable",
        },
      },
    );
  } catch {
    // A broken card must never break the page that references it.
    return new Response("Could not render the card.", { status: 500 });
  }
}
