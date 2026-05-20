// ReviewHero — per-feature hero for /<feature>-review pages.
// Visual reference: Figma node 18:2741 (Superflow Marketing 2026).
// Visual treatment ported from /superflow-marketing-pages/components/home/Hero.tsx.
//
// Per-page (Sanity-driven): headlineLine1, subheading, persona pills, CTAs,
// hero media. Line 2 of the H1 ("Impossibly Fast") is fixed and uses the
// Superflow rainbow gradient utility.

import Image from "next/image";

import {
  CursorBadge,
  DesignerCursor,
  DeveloperCursor,
  PhotographerCursor,
} from "@/components/shared/CursorBadge";

type CtaLink = {
  label?: string;
  href?: string;
  newTab?: boolean;
};

export type ReviewHeroPersona = {
  label: string;
  color: string;
};

export type ReviewHeroProps = {
  headlineLine1: string;
  /** Fixed second line. Renders with the rainbow gradient. */
  headlineLine2?: string;
  subheading?: string;
  personaLeft?: ReviewHeroPersona;
  personaRight?: ReviewHeroPersona;
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
  heroMediaSrc?: string | null;
  heroMediaAlt?: string;
};

// Map a label to its cursor glyph. Falls back to the side default
// (Developer for left, Designer for right) inside CursorBadge.
function cursorFor(label: string) {
  const k = label.toLowerCase();
  if (k.startsWith("photo")) return <PhotographerCursor />;
  if (k.startsWith("design")) return <DesignerCursor />;
  if (k.startsWith("dev")) return <DeveloperCursor />;
  return undefined;
}

export function ReviewHero({
  headlineLine1,
  headlineLine2 = "Impossibly Fast",
  subheading = "Get approved with fewer rounds of reviews. Get back to creating.",
  personaLeft,
  personaRight,
  primaryCta,
  secondaryCta,
  heroMediaSrc,
  heroMediaAlt = "Product preview",
}: ReviewHeroProps) {
  const primary = primaryCta ?? { label: "Try Demo", href: "/demo" };
  const secondary = secondaryCta ?? {
    label: "Upload Now For Free",
    href: "/book-demo",
  };

  return (
    <section className="relative w-full overflow-hidden bg-black pt-[120px] pb-[60px] lg:pt-[160px] lg:pb-[80px]">
      <div className="container-page relative flex flex-col items-center gap-[40px] lg:gap-[52px]">
        <div className="relative flex flex-col items-center gap-[24px]">
          <div className="relative flex flex-col items-center gap-[10px]">
            <h1
              className="text-center text-white font-semibold tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(40px, 7vw, 80px)",
                lineHeight: "1.3em",
              }}
            >
              {headlineLine1}
            </h1>
            <h1
              className="text-gradient-superflow text-center font-semibold tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(40px, 7vw, 80px)",
                lineHeight: "1.3em",
              }}
            >
              {headlineLine2}
            </h1>
          </div>

          {personaLeft ? (
            <CursorBadge
              label={personaLeft.label}
              color={personaLeft.color}
              side="left"
              cursor={cursorFor(personaLeft.label)}
              style={{ left: "-160px", top: "calc(50% + 12px)" }}
            />
          ) : null}
          {personaRight ? (
            <CursorBadge
              label={personaRight.label}
              color={personaRight.color}
              side="right"
              cursor={cursorFor(personaRight.label)}
              // CursorBadge bakes a 48px pill-offset asymmetry into its
              // left/right variants (left pill: -32, right pill: -80).
              // Compensate so personas are visually equidistant from the H1.
              style={{ right: "-112px", top: "calc(50% + 12px)" }}
            />
          ) : null}

          <p
            className="text-center text-white max-w-[720px]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(18px, 2vw, 24px)",
              lineHeight: "1.2",
              letterSpacing: "-0.03em",
            }}
          >
            {subheading}
          </p>

          <div className="flex items-center gap-[17px]">
            {primary?.label ? (
              <a
                href={primary.href ?? "#"}
                target={primary.newTab ? "_blank" : undefined}
                rel={primary.newTab ? "noopener" : undefined}
                className="flex items-center justify-center rounded-[32px] bg-white/[0.08] px-6 py-3 text-white transition-colors hover:bg-white/[0.14]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 18,
                  fontWeight: 500,
                  lineHeight: "1.5em",
                }}
              >
                {primary.label}
              </a>
            ) : null}
            {secondary?.label ? (
              <a
                href={secondary.href ?? "#"}
                target={secondary.newTab ? "_blank" : undefined}
                rel={secondary.newTab ? "noopener" : undefined}
                className="flex items-center justify-center rounded-[32px] bg-white px-6 py-3 text-black transition-colors hover:bg-white/90"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 18,
                  fontWeight: 500,
                  lineHeight: "1.5em",
                }}
              >
                {secondary.label}
              </a>
            ) : null}
          </div>
        </div>

        {heroMediaSrc ? (
          <div className="w-full max-w-[1200px]">
            <Image
              src={heroMediaSrc}
              alt={heroMediaAlt}
              width={1200}
              height={654}
              priority
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="w-full h-auto block rounded-[20px]"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
