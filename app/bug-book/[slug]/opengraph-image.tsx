// Template-generated OG image per Bug Book entry: category accent +
// severity chip + headline + Bug Book branding. Rendered with `next/og`
// at request time (cached by the framework alongside the page).

import { ImageResponse } from "next/og";
import { getBugBookEntryBySlug } from "@/sanity/lib/queries";
import { categoryColor, severityColor } from "@/lib/bug-book";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Superflow Bug Book";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getBugBookEntryBySlug(slug);

  // Sassy entries lead with the quote - it is the shareable part.
  const isSassy = entry?.vibe === "sass" && Boolean(entry?.pullQuote);
  const headline = entry?.headline ?? "The Bug Book";
  const primaryText = isSassy ? `“${entry?.pullQuote}”` : headline;
  const category = entry?.category ?? "UI/UX";
  const severity = entry?.severity ?? "Mild";
  const sourceLabel =
    entry?.source === "agent" ? "✦ Caught by Superflow Agent" : "Caught in review";
  const { accent } = categoryColor(category);
  const sev = severityColor(severity);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#101116",
          padding: "64px 72px",
          position: "relative",
        }}
      >
        {/* Category accent edge */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 14,
            background: accent,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 22px",
              borderRadius: 9999,
              background: accent,
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {category}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 22px",
              borderRadius: 9999,
              background: sev.tint,
              color: sev.accent,
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 9999,
                background: sev.accent,
                display: "flex",
              }}
            />
            {severity}
          </div>
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.6)",
              fontSize: 24,
            }}
          >
            {isSassy ? "\u{1F60F} Sassy" : sourceLabel}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 1020,
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: primaryText.length > 90 ? 46 : 54,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: -1,
              fontStyle: isSassy ? "italic" : "normal",
            }}
          >
            {primaryText}
          </div>
          {isSassy ? (
            <div
              style={{
                display: "flex",
                color: "rgba(255,255,255,0.55)",
                fontSize: 26,
                lineHeight: 1.3,
              }}
            >
              {headline.length > 110 ? `${headline.slice(0, 107)}...` : headline}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.85)",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            The Superflow Bug Book
          </div>
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.5)",
              fontSize: 24,
            }}
          >
            usesuperflow.com/bug-book
          </div>
        </div>
      </div>
    ),
    size,
  );
}
