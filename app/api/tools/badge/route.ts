// The embeddable badge.
//
// GET /api/tools/badge?tool=ai-visibility-checker&url=example.com&theme=light
//
// A site owner whose result passed pastes a snippet (see `badgeEmbedHtml`) and
// gets a small SVG on their own site linking back to the live result.
//
// WHY THE SCORE IS NOT IN THE QUERY STRING
//
// Because then it would not be a badge, it would be a sticker anybody can
// write. This endpoint takes only the tool and the URL, reads the CURRENT
// cached run for that URL, and draws whatever that run actually says. Editing
// the snippet cannot change the number, and a site whose result regresses gets
// the neutral badge back on its own within the cache window.
//
// It also means the badge never certifies a bad result: the earned badge is
// drawn only when the run produced one (see `ShareBadge` in
// lib/tools/share/types.ts, which is null for any result with failures), and
// everything else falls back to a plain "Checked by Superflow" mark that
// claims nothing.
//
// WHY SVG AND NOT AN IMAGE RESPONSE
//
// This is fetched by every visitor to every site that embeds it, so it has to
// be cheap: a few hundred bytes of text built by string concatenation, no
// renderer, no font loading, no layout engine. It is also the only format that
// stays crisp at whatever size somebody's CSS decides the badge should be.
//
// NEVER RUNS A CHECK
//
// A cache miss draws the neutral badge. Running the engine here would let one
// embed on one busy site turn into an unbounded stream of engine runs, which
// is the same reason `readSharedResult` is a cache-only read path.

import type { NextRequest } from "next/server";
import { readSharedResult } from "@/lib/tools/share/read";
import { BADGE_HEIGHT, BADGE_WIDTH } from "@/lib/tools/share/links";
import type { ShareBadge } from "@/lib/tools/share/types";

export const runtime = "nodejs";

/** Never cache the handler itself. The response carries its own directives. */
export const dynamic = "force-dynamic";

/** Longest URL this endpoint will look up. */
const MAX_URL_LENGTH = 2048;

/** The fonts a badge may use: whatever the embedding site already has. */
const FONT_STACK =
  "system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

type Theme = "light" | "dark";

/** Per-theme colours. Dark exists for sites with a dark footer. */
const THEMES: Record<
  Theme,
  { surface: string; border: string; ink: string; muted: string }
> = {
  light: {
    surface: "#ffffff",
    border: "#e4e4e7",
    ink: "#1e1e1f",
    muted: "#8a8a90",
  },
  dark: {
    surface: "#17171a",
    border: "#2c2c31",
    ink: "#f4f4f5",
    muted: "#9a9aa2",
  },
};

/** Accent per badge tone. Matches the report view's bands. */
const ACCENT: Record<ShareBadge["tone"], string> = {
  good: "#1a8f5f",
  warn: "#c08a00",
};

/** The accent for a badge with no verdict to report. */
const NEUTRAL_ACCENT = "#4b5cf5";

/**
 * Escapes text for an XML text node or attribute.
 *
 * Badge text is derived from a checked page's own content in some tools, so it
 * is never trusted into markup unescaped.
 *
 * @param value - The raw text.
 * @param maxLength - Characters to keep, so a long value cannot overflow the
 *   fixed-width badge.
 */
function escapeXml(value: string, maxLength = 40): string {
  try {
    return value
      .slice(0, maxLength)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  } catch {
    return "";
  }
}

/**
 * Builds the badge SVG.
 *
 * @param params - The two lines of copy, the accent, and the theme.
 */
function badgeSvg(params: {
  headline: string;
  byline: string;
  accent: string;
  theme: Theme;
  earned: boolean;
}): string {
  const { headline, byline, accent, earned } = params;
  const palette = THEMES[params.theme];

  // The mark: a filled disc with a tick for an earned badge, an outlined disc
  // for the neutral one. The difference is deliberate and visible at a glance,
  // so the two badges can never be mistaken for each other.
  const mark = earned
    ? `<circle cx="14" cy="14" r="11" fill="${accent}" />
      <path d="M9 14.4l3.2 3.1L19.2 10.6" fill="none" stroke="${palette.surface}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`
    : `<circle cx="14" cy="14" r="10.5" fill="none" stroke="${accent}" stroke-width="2.2" />
      <circle cx="14" cy="14" r="3.4" fill="${accent}" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${BADGE_WIDTH}" height="${BADGE_HEIGHT}" viewBox="0 0 ${BADGE_WIDTH} ${BADGE_HEIGHT}" role="img" aria-label="${escapeXml(`${headline}. ${byline}`, 90)}">
  <rect x="0.75" y="0.75" width="${BADGE_WIDTH - 1.5}" height="${BADGE_HEIGHT - 1.5}" rx="9.25" fill="${palette.surface}" stroke="${palette.border}" stroke-width="1.5" />
  <g transform="translate(14 10)">
    ${mark}
  </g>
  <text x="52" y="21" font-family="${FONT_STACK}" font-size="13" font-weight="600" fill="${palette.ink}">${escapeXml(headline, 30)}</text>
  <text x="52" y="36" font-family="${FONT_STACK}" font-size="10.5" fill="${palette.muted}">${escapeXml(byline, 34)}</text>
</svg>`;
}

/**
 * Returns an SVG response.
 *
 * @param svg - The document.
 * @param maxAgeSeconds - Browser cache lifetime.
 * @param sMaxAgeSeconds - Shared cache lifetime.
 */
function svgResponse(
  svg: string,
  maxAgeSeconds: number,
  sMaxAgeSeconds: number,
): Response {
  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Short enough that a re-run shows up on the embedding site the same
      // day, long enough that a busy site's traffic never reaches KV.
      "Cache-Control": `public, max-age=${maxAgeSeconds}, s-maxage=${sMaxAgeSeconds}, stale-while-revalidate=86400`,
      // The badge is an asset for other people's sites, so it must be fetchable
      // from them. It exposes nothing a visitor to this endpoint cannot see.
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "noindex",
    },
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const params = request.nextUrl.searchParams;
    const theme: Theme = params.get("theme") === "dark" ? "dark" : "light";
    const slug = (params.get("tool") ?? "").slice(0, 60);
    const rawUrl = (params.get("url") ?? "").slice(0, MAX_URL_LENGTH);

    const shared =
      slug.length > 0 && rawUrl.length > 0
        ? await readSharedResult(slug, rawUrl)
        : null;
    const badge = shared?.snapshot.badge ?? null;

    if (!badge) {
      // No cached run, or a run that did not earn a badge. The neutral mark
      // claims nothing: it says a check happened here, and links to it.
      return svgResponse(
        badgeSvg({
          headline: "Checked by Superflow",
          byline: "Free site checks, no login",
          accent: NEUTRAL_ACCENT,
          theme,
          earned: false,
        }),
        // Short, so the earned badge appears soon after the owner re-runs the
        // check and fixes whatever was failing.
        300,
        900,
      );
    }

    return svgResponse(
      badgeSvg({
        headline: `${badge.label} ${badge.value}`,
        byline: "Checked by Superflow",
        accent: ACCENT[badge.tone],
        theme,
        earned: true,
      }),
      300,
      1800,
    );
  } catch {
    // A badge that cannot be built is still an image request on somebody
    // else's page, so it answers with the neutral mark rather than a 500 that
    // would render as a broken image in their footer.
    return svgResponse(
      badgeSvg({
        headline: "Checked by Superflow",
        byline: "Free site checks, no login",
        accent: NEUTRAL_ACCENT,
        theme: "light",
        earned: false,
      }),
      60,
      60,
    );
  }
}
