"use client";

// WebsiteFirstCard — interactive slot-0 FeatureCard for /website-review.
// Renders one of 3 full-card SVG variants (Review Elements / Report Bugs /
// Review Copy) and swaps between them when the user clicks the
// corresponding tab. The pill row is part of the SVG; we overlay
// transparent click regions positioned over it.

import { useState } from "react";
import Image from "next/image";

const TAB_SVGS = [
  "/images/sections/feature-cards/review-pixels-website-1.svg",
  "/images/sections/feature-cards/review-pixels-website-2.svg",
  "/images/sections/feature-cards/review-pixels-website-3.svg",
] as const;

const TAB_LABELS = ["Review Elements", "Report Bugs", "Review Copy"] as const;

export type WebsiteFirstCardProps = {
  // Props retained for backwards-compat with ReviewPageBody / CMS schema;
  // text lives inside the SVG so these are ignored visually.
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
};

export default function WebsiteFirstCard(_props: WebsiteFirstCardProps = {}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative w-full max-w-[1436px] mx-auto">
      <Image
        src={TAB_SVGS[activeIndex]}
        alt=""
        width={1436}
        height={820}
        className="w-full h-auto"
        priority
      />
      {/* Tab pill row overlay — covers the pills baked into the SVG so
          clicks switch the displayed variant. Positioned as a percentage
          of the 1436×820 card so it scales with the responsive image. */}
      <div
        className="absolute"
        style={{
          top: `${(355.76 / 820) * 100}%`,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <div className="flex items-center gap-1">
          {TAB_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => setActiveIndex(i)}
              className="cursor-pointer"
              style={{
                width: 140,
                height: 42,
                background: "transparent",
                border: 0,
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
