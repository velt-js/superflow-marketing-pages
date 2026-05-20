// Library page hero — mirrors homepage Hero's TitleBlock typography
// (components/home/Hero.tsx:72) so library pages feel like one coherent
// site. Rendered at 1440 design-width inside a ScaleWrapper.
//
// Pass `decorated` to opt in to the homepage Hero's pixel-grid background,
// radial vignette, and Sean/Emma cursor name-tags. Per-library detail
// pages keep the simpler purple-glow treatment by default.

import Image from "next/image";

import type { CtaLink } from "./types";

export type PageHeroProps = {
  eyebrow?: { label: string; dotColor?: string };
  heading: string;
  subheading?: string;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  /** When true, render the homepage-style pixel-grid background, dark
   *  vignette, and Sean/Emma cursor name-tags overlaying the title. */
  decorated?: boolean;
};

// Cursor name-tags lifted from components/home/Hero.tsx:16-70. Decorative
// only — hidden below lg where the title block doesn't have horizontal
// room for them.
function CursorSean() {
  return (
    <div
      className="hidden lg:flex absolute flex-col items-end pointer-events-none"
      style={{ top: 235, left: "calc(50% - 472px)" }}
      aria-hidden="true"
    >
      <div
        className="relative"
        style={{ width: 20, height: 20, transform: "scaleY(-1) rotate(180deg)" }}
      >
        <Image src="/images/home/cursor-pointer-teal.svg" alt="" width={20} height={20} />
      </div>
      <div style={{ paddingRight: 20 }}>
        <div
          className="flex items-start font-urbanist font-bold"
          style={{
            background: "#8bf2e1",
            borderRadius: 22.5,
            padding: "2.5px 10px",
            color: "#000",
            fontSize: 13.75,
            letterSpacing: "0.01em",
            boxShadow: "0px 1.25px 5px 0px rgba(0,0,0,0.16)",
            lineHeight: 1.545,
          }}
        >
          Sean
        </div>
      </div>
    </div>
  );
}

function CursorEmma() {
  return (
    <div
      className="hidden lg:flex absolute flex-col items-start pointer-events-none"
      style={{ top: 324, left: "calc(50% + 380px)" }}
      aria-hidden="true"
    >
      <div className="relative" style={{ width: 20, height: 20 }}>
        <Image src="/images/home/cursor-pointer-pink.svg" alt="" width={20} height={20} />
      </div>
      <div style={{ paddingLeft: 20 }}>
        <div
          className="flex items-start font-urbanist font-bold"
          style={{
            background: "#ff74f6",
            borderRadius: 18,
            padding: "2.5px 10px",
            color: "#020202",
            fontSize: 13.75,
            letterSpacing: "0.01em",
            boxShadow: "0px 1.25px 5px 0px rgba(0,0,0,0.16)",
            lineHeight: 1.545,
          }}
        >
          Emma
        </div>
      </div>
    </div>
  );
}

export function PageHero({
  eyebrow,
  heading,
  subheading,
  primaryCta,
  secondaryCta,
  decorated = false,
}: PageHeroProps) {
  return (
    <section
      className="relative w-full bg-black overflow-hidden pt-24 pb-16 lg:pt-[140px] lg:pb-[100px]"
    >
      {decorated ? (
        <>
          {/* Pixel-grid GIF — hidden below md (crowds the title on phones). */}
          <div
            className="hidden md:block absolute overflow-hidden"
            style={{
              top: 0,
              left: 0,
              width: "100%",
              height: 534,
              backgroundImage: "url('/images/home/grid-animation.gif')",
              backgroundRepeat: "repeat-x",
              backgroundSize: "1440px 740px",
              backgroundPosition: "top center",
            }}
          />
          <div
            aria-hidden="true"
            className="hidden md:block absolute"
            style={{
              top: 0,
              left: 0,
              width: "100%",
              height: 534,
              background:
                "radial-gradient(ellipse 100% 534px at 50% 0%, rgba(0,0,0,0.7) 0%, #000 100%)",
            }}
          />
          <CursorSean />
          <CursorEmma />
        </>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 900px 420px at 50% 0%, rgba(98,93,245,0.22) 0%, transparent 70%)",
          }}
        />
      )}

      <div className="container-page relative flex flex-col items-center gap-8 lg:gap-10 max-w-[851px]">
        <div className="flex flex-col items-center gap-5 w-full">
          {eyebrow && (
            <span
              className="inline-flex items-center font-urbanist font-semibold text-white"
              style={{
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid rgba(98,93,245,0.4)",
                background: "rgba(98,93,245,0.12)",
                fontSize: 14,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              <span
                aria-hidden
                className="inline-block"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: eyebrow.dotColor ?? "#86efac",
                }}
              />
              {eyebrow.label}
            </span>
          )}

          <h1
            className="font-urbanist font-bold text-white text-center"
            style={{
              fontSize: "clamp(36px, 5vw, 72px)",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}
          >
            {heading}
          </h1>

          {subheading && (
            <p
              className="font-urbanist font-medium text-center max-w-[651px]"
              style={{
                fontSize: "clamp(16px, 1.7vw, 24px)",
                lineHeight: 1.3,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {subheading}
            </p>
          )}
        </div>

        {(primaryCta?.label || secondaryCta?.label) && (
          <div className="flex items-start gap-3 flex-wrap justify-center">
            {secondaryCta?.label && secondaryCta.href && (
              <a
                href={secondaryCta.href}
                target={secondaryCta.newTab ? "_blank" : undefined}
                rel={secondaryCta.newTab ? "noopener" : undefined}
                className="flex items-center justify-center gap-2 rounded-lg font-urbanist font-bold text-white"
                style={{
                  minWidth: 150,
                  padding: "12px 16px",
                  border: "1.002px solid #625df5",
                  fontSize: 16,
                  letterSpacing: "-0.03em",
                }}
              >
                {secondaryCta.leadingIcon}
                {secondaryCta.label}
              </a>
            )}
            {primaryCta?.label && primaryCta.href && (
              <a
                href={primaryCta.href}
                target={primaryCta.newTab ? "_blank" : undefined}
                rel={primaryCta.newTab ? "noopener" : undefined}
                className="flex items-center justify-center gap-2 rounded-lg font-urbanist font-bold text-white"
                style={{
                  minWidth: 150,
                  padding: "12px 16px",
                  background: "#625df5",
                  fontSize: 16,
                  letterSpacing: "-0.03em",
                }}
              >
                {primaryCta.leadingIcon}
                {primaryCta.label}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
