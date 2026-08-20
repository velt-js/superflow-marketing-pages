// Open Graph card for a shared tool result.
//
// GET /api/tools/share-card?v=score&t=ai-visibility-checker&h=example.com&s=72...
//
// The whole snapshot arrives in the query string (see `shareCardUrl` and
// `decodeCardParams` in lib/tools/share/links.ts), so a card is a pure
// function of its URL: nothing is looked up, a render takes a few
// milliseconds, and a crafted URL cannot make this endpoint do work against
// somebody else's site.
//
// THREE LAYOUTS, BECAUSE THIRTEEN TOOLS DO NOT REPORT THE SAME KIND OF THING
//
//   score    a 0 to 100 result. The number IS the finding, so it is the card.
//   metrics  an artefact or a stack. No verdict exists, so the card shows the
//            three facts worth knowing and does not invent a grade.
//   preview  the Social Preview Checker. Its result is a picture of how a link
//            renders, so the card draws that picture. This is the only card on
//            the site that is its own evidence: what somebody sees in the
//            unfurl is the thing being reported on.
//
// THE ONE REMOTE FETCH
//
// The preview layout embeds the checked page's own og:image, which is by
// definition a URL a stranger controls. It goes through the same SSRF guard as
// every other user-supplied URL in the toolkit, is capped in both time and
// bytes, and is restricted to the raster formats the renderer can decode. Any
// failure draws the card without the picture rather than failing the card,
// because a broken image in somebody's timeline is the one outcome worth
// engineering around.

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { resolveUserUrl } from "@/lib/toolkit/url";
import { findTool } from "@/lib/tools/registry";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  decodeCardParams,
  type DecodedCard,
} from "@/lib/tools/share/links";
import type { ShareTone } from "@/lib/tools/share/types";

export const runtime = "nodejs";

/** How long the remote og:image fetch may take before the card gives up. */
const IMAGE_TIMEOUT_MS = 3000;

/** Byte ceiling on that image. Above this the card draws the placeholder. */
const IMAGE_MAX_BYTES = 4 * 1024 * 1024;

/**
 * Formats the renderer can actually decode.
 *
 * WebP, AVIF, and SVG are excluded deliberately. The renderer's support for
 * them ranges from partial to absent, and a card that throws mid-stream cannot
 * be recovered from: the platform has already been handed a 200 and gets a
 * broken image. A placeholder that says an image exists is worse-looking and
 * strictly more truthful.
 */
const EMBEDDABLE_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
]);

/** The site's palette, restated here because this file renders standalone. */
const INK = "#1e1e1f";
const MUTED = "#8a8a90";
const BODY = "#5b5b60";
const RULE = "#ececee";
const SURFACE = "#f7f7f8";

/** Accent per tone. `colorForScore` in the report view uses the same bands. */
const TONE_COLOR: Record<ShareTone, string> = {
  good: "#1a8f5f",
  warn: "#c08a00",
  bad: "#c8362f",
  neutral: "#5b5b60",
};

/**
 * The accent for a card.
 *
 * A scored card colours by the score itself rather than by the tone, so the
 * five bands the report view uses survive onto the card.
 *
 * @param card - The decoded card request.
 */
function accentFor(card: DecodedCard): string {
  try {
    if (typeof card.score === "number") {
      if (card.score >= 90) return "#1a8f5f";
      if (card.score >= 75) return "#4a9d3f";
      if (card.score >= 60) return "#c08a00";
      if (card.score >= 40) return "#d4661f";
      return "#c8362f";
    }
    return TONE_COLOR[card.tone];
  } catch {
    return TONE_COLOR.neutral;
  }
}

/**
 * Fetches a remote image and returns it as a data URI.
 *
 * @param rawUrl - The og:image URL from the checked page.
 * @returns A `data:` URI the renderer can draw, or null when the image cannot
 *   be fetched, is too large, or is in a format the renderer cannot decode.
 */
async function loadImage(rawUrl: string): Promise<string | null> {
  try {
    if (rawUrl.length === 0) return null;

    // The same guard every user-supplied URL in the toolkit passes through:
    // scheme, shape, and a DNS check that the host is publicly routable.
    const resolved = await resolveUserUrl(rawUrl);
    if (!resolved.ok) return null;

    const response = await fetch(resolved.url, {
      signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS),
      redirect: "follow",
      cache: "no-store",
      headers: { Accept: "image/png,image/jpeg,image/gif" },
    });

    if (!response.ok) return null;

    const contentType = (response.headers.get("content-type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (!EMBEDDABLE_IMAGE_TYPES.has(contentType)) return null;

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > IMAGE_MAX_BYTES) {
      return null;
    }

    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch {
    // Timeout, DNS failure, a host that refuses us, a body that is not an
    // image. None of them are worth the card.
    return null;
  }
}

/**
 * The eyebrow text: the name of the tool that produced the result.
 *
 * Read from the registry rather than passed in the query string, so a card
 * cannot be addressed with a tool name that is not a real tool.
 *
 * @param card - The decoded card request.
 */
function toolLabel(card: DecodedCard): string {
  try {
    return findTool(card.slug)?.name ?? "Superflow free tools";
  } catch {
    return "Superflow free tools";
  }
}

/** The eyebrow above every card: which tool produced this. */
function Eyebrow({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 26,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: MUTED,
      }}
    >
      {children}
    </div>
  );
}

/** The rule and byline that close every card. */
function Footer({ line }: { line: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        borderTop: `2px solid ${RULE}`,
        paddingTop: 22,
      }}
    >
      <div style={{ display: "flex", fontSize: 25, color: BODY }}>{line}</div>
      <div
        style={{
          display: "flex",
          fontSize: 25,
          fontWeight: 600,
          color: INK,
        }}
      >
        usesuperflow.ai/tools
      </div>
    </div>
  );
}

/**
 * One metric, drawn as a tile.
 *
 * @param props - The metric, its accent, and whether the caller needs the
 *   shorter form. `compact` exists because the scored layout spends most of its
 *   height on the number and has one row left for three tiles.
 */
function MetricTile({
  label,
  value,
  accent,
  compact = false,
}: {
  label: string;
  value: string;
  accent: string;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 4 : 8,
        flex: 1,
        background: SURFACE,
        borderRadius: compact ? 16 : 20,
        padding: compact ? "18px 22px" : "28px 30px",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: compact ? 34 : 44,
          fontWeight: 700,
          color: accent,
        }}
      >
        {value}
      </div>
      <div
        style={{ display: "flex", fontSize: compact ? 20 : 24, color: MUTED }}
      >
        {label}
      </div>
    </div>
  );
}

/**
 * The column every variant's rows live in.
 *
 * A variant cannot return a fragment: the renderer wraps a fragment in a flex
 * box of its own that defaults to a row, which lays the rows of a card out
 * side by side. One explicit column box, with the rows spread down it, is what
 * makes the layout the code says it is.
 *
 * @param props - The variant's rows.
 */
function CardBody({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flex: 1,
        gap: 20,
      }}
    >
      {children}
    </div>
  );
}

/** The scored layout: the number is the result. */
function ScoreCard({ card, accent }: { card: DecodedCard; accent: string }) {
  const score = typeof card.score === "number" ? card.score : 0;

  return (
    <CardBody>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Eyebrow>{toolLabel(card)}</Eyebrow>
        <div
          style={{
            display: "flex",
            fontSize: 58,
            fontWeight: 700,
            color: INK,
          }}
        >
          {card.hostname || "your site"}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
        <div
          style={{
            display: "flex",
            fontSize: 150,
            fontWeight: 700,
            lineHeight: 1,
            color: accent,
          }}
        >
          {score}
        </div>
        {/* Beside the number, not under it: stacked, this block made the card
            tall enough to push the metric tiles through the footer rule. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            paddingBottom: 20,
          }}
        >
          <div style={{ display: "flex", fontSize: 32, color: MUTED }}>
            out of 100
          </div>
          {card.grade ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 58,
                height: 58,
                borderRadius: 16,
                background: accent,
                color: "#ffffff",
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              {card.grade}
            </div>
          ) : null}
        </div>
      </div>

      {card.metrics.length > 0 ? (
        <div style={{ display: "flex", gap: 16 }}>
          {card.metrics.map((metric) => (
            <MetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              accent={INK}
              compact
            />
          ))}
        </div>
      ) : null}
    </CardBody>
  );
}

/** The artefact layout: a headline and up to three facts. */
function MetricsCard({ card, accent }: { card: DecodedCard; accent: string }) {
  return (
    <CardBody>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Eyebrow>{toolLabel(card)}</Eyebrow>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.1,
            color: INK,
          }}
        >
          {card.headline || card.hostname}
        </div>
      </div>

      {card.metrics.length > 0 ? (
        <div style={{ display: "flex", gap: 20 }}>
          {card.metrics.map((metric) => (
            <MetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              accent={accent}
            />
          ))}
        </div>
      ) : null}
    </CardBody>
  );
}

/**
 * The Social Preview Checker's layout: the page's own social card, drawn the
 * way a platform draws it, beside the verdict.
 *
 * Every size in here is fixed rather than intrinsic. The mock card is the only
 * element on any of these cards whose content length is set by somebody else's
 * page, so if it were allowed to grow with its text it would push the footer
 * off a 630 pixel canvas on any site with a long title.
 *
 * @param props - The decoded card, the accent, and the fetched image if there
 *   was one that could be drawn.
 */
function PreviewCard({
  card,
  accent,
  imageData,
}: {
  card: DecodedCard;
  accent: string;
  imageData: string | null;
}) {
  const preview = card.preview;

  return (
    <CardBody>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Eyebrow>{toolLabel(card)}</Eyebrow>
        <div
          style={{
            display: "flex",
            fontSize: 40,
            fontWeight: 700,
            color: INK,
          }}
        >
          {card.headline || `How ${card.hostname} looks when you share it`}
        </div>
      </div>

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        {/* The mock card. Border and radius are a platform-neutral rendering:
            every platform draws its own chrome, and picking one would make the
            card wrong everywhere else. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 560,
            borderRadius: 16,
            border: `1px solid ${RULE}`,
            overflow: "hidden",
            background: "#ffffff",
          }}
        >
          {imageData ? (
            <img
              src={imageData}
              alt=""
              width={560}
              height={176}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 560,
                height: 176,
                background: SURFACE,
                color: MUTED,
                fontSize: 24,
              }}
            >
              {preview?.imageUrl ? "Image set" : "No image"}
            </div>
          )}

          {/* Fixed height and clipped, which is also what every platform does
              with a title too long for its card. Letting it grow instead would
              push the footer off the canvas on any site with a long title. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              height: 116,
              overflow: "hidden",
              padding: "16px 20px 20px 20px",
            }}
          >
            {/* `flexShrink: 0` on all three is load-bearing. Inside a
                fixed-height column the renderer otherwise shrinks a two-line
                title below the height its own text needs, and the second line
                draws straight through the description under it. Keeping their
                natural heights and clipping the block is what produces the
                truncation a real platform card shows. */}
            <div
              style={{
                display: "flex",
                flexShrink: 0,
                fontSize: 17,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              {preview?.attribution || card.hostname}
            </div>
            <div
              style={{
                display: "flex",
                flexShrink: 0,
                fontSize: 25,
                lineHeight: 1.25,
                fontWeight: 600,
                color: INK,
              }}
            >
              {preview?.title || "No title tag"}
            </div>
            <div
              style={{
                display: "flex",
                flexShrink: 0,
                fontSize: 19,
                lineHeight: 1.35,
                color: BODY,
              }}
            >
              {preview?.description || "No description tag"}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flex: 1,
          }}
        >
          {card.metrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                background: SURFACE,
                borderRadius: 14,
                padding: "14px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 32,
                  fontWeight: 700,
                  color: accent,
                }}
              >
                {metric.value}
              </div>
              <div style={{ display: "flex", fontSize: 18, color: MUTED }}>
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardBody>
  );
}

/** The byline under the rule, per layout. */
function footerLine(card: DecodedCard): string {
  switch (card.variant) {
    case "preview":
      return "Six platforms, tag by tag";
    case "metrics":
      return "Free tool. No login, no email.";
    default:
      return "Can ChatGPT, Claude, and Perplexity read this site?";
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const card = decodeCardParams(request.nextUrl.searchParams);
    const accent = accentFor(card);

    // Only the preview layout has a picture to fetch, and only when the page
    // actually declared one.
    const imageData =
      card.variant === "preview" && card.preview?.imageUrl
        ? await loadImage(card.preview.imageUrl)
        : null;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#ffffff",
            padding: 56,
            gap: 20,
            fontFamily: "sans-serif",
          }}
        >
          {card.variant === "preview" ? (
            <PreviewCard card={card} accent={accent} imageData={imageData} />
          ) : card.variant === "metrics" ? (
            <MetricsCard card={card} accent={accent} />
          ) : (
            <ScoreCard card={card} accent={accent} />
          )}

          <Footer line={footerLine(card)} />
        </div>
      ),
      {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        headers: {
          // Cards are pure functions of the query string, so they cache hard.
          // The platforms fetch a card once when a link is pasted and then
          // serve their own copy, so a long edge TTL costs nothing in
          // freshness and saves the render on every re-share of the same run.
          "Cache-Control": "public, max-age=3600, s-maxage=86400, immutable",
        },
      },
    );
  } catch {
    // A broken card must never break the page that references it.
    return new Response("Could not render the card.", { status: 500 });
  }
}
