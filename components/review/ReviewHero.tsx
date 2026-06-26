// ReviewHero — per-feature hero for /<feature>-review pages.
// Visual reference: Figma node 18:2741 (Superflow Marketing 2026).
// Visual treatment ported from /superflow-marketing-pages/components/home/Hero.tsx.
//
// Per-page (Sanity-driven): headlineLine1, subheading, persona pills, CTAs,
// hero media. Line 2 of the H1 ("Impossibly Fast") is fixed and uses the
// Superflow rainbow gradient utility.

import Image from "next/image";

import { toInternalHref } from "@/lib/links";

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
  /** Optional MP4 hero. When provided, replaces the static `heroMediaSrc` Image with an autoplaying, looping, muted video. */
  heroVideoSrc?: string | null;
};

export function ReviewHero({
  headlineLine1,
  headlineLine2 = "Impossibly Fast",
  subheading = "Get approved with fewer rounds of reviews. Get back to creating.",
  primaryCta,
  secondaryCta,
  heroMediaSrc,
  heroMediaAlt = "Product preview",
  heroVideoSrc,
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
          <div className="relative flex flex-col items-center gap-[0px]">
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

          <div className="flex flex-col sm:flex-row items-center gap-[12px] sm:gap-[17px] w-full sm:w-auto">
            {primary?.label ? (
              <a
                href={toInternalHref(primary.href) ?? "#"}
                target={primary.newTab ? "_blank" : undefined}
                rel={primary.newTab ? "noopener" : undefined}
                className="flex items-center justify-center rounded-[32px] bg-white/[0.08] px-6 py-3 text-white transition-colors hover:bg-white/[0.14] whitespace-nowrap w-full sm:w-auto"
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
                href={toInternalHref(secondary.href) ?? "#"}
                target={secondary.newTab ? "_blank" : undefined}
                rel={secondary.newTab ? "noopener" : undefined}
                className="flex items-center justify-center rounded-[32px] bg-white px-6 py-3 text-black transition-colors hover:bg-white/90 whitespace-nowrap w-full sm:w-auto"
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

        {heroVideoSrc ? (
          <div className="w-full max-w-[1200px]">
            <video
              src={heroVideoSrc}
              autoPlay
              loop
              muted
              playsInline
              poster={heroMediaSrc ?? undefined}
              aria-label={heroMediaAlt}
              className="w-full h-auto block rounded-[20px]"
            />
          </div>
        ) : heroMediaSrc ? (
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
