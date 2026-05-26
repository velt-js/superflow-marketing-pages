import Image from "next/image";
import { LogoMarquee } from "@/components/home/LogoBar";
import type { UseCaseDoc } from "@/lib/use-case-types";
import { SIGNUP_URL } from "@/lib/use-case-types";

export default function UseCaseHero({ doc }: { doc: UseCaseDoc }) {
  const hero = doc.hero ?? {};
  const supportText = hero.action
    ? `Superflow helps 9,000+ marketing agencies, design, and software teams to ${hero.action}`
    : undefined;
  const ctaText = hero.heroCtaText || "Try Superflow for Free";

  return (
    <section className="relative w-full overflow-hidden bg-[#010001] rounded-b-[32px] lg:rounded-b-[80px]">
      <div className="relative flex flex-col items-center pt-[140px] pb-[80px] lg:pt-[180px] lg:pb-[120px]">
        <div className="container-page flex flex-col items-center gap-[36px]">
          <div className="flex max-w-[860px] flex-col items-center gap-[20px] text-center">
            {doc.icon && (
              <div className="relative h-[56px] w-[56px] overflow-hidden">
                <Image
                  src={doc.icon}
                  alt={hero.useCase || doc.title}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
            )}
            <h1
              className="text-white"
              style={{
                fontFamily: "var(--font-poppins)",
                fontWeight: 600,
                fontSize: "clamp(36px, 5.5vw, 60px)",
                lineHeight: 1.15,
                letterSpacing: "-0.045em",
              }}
            >
              {doc.title}
            </h1>
            {doc.description && (
              <p
                className="max-w-[640px]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 17,
                  lineHeight: 1.55,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {doc.description}
              </p>
            )}
          </div>

          <a
            href={SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-[32px] bg-white px-[28px] py-[14px] text-black transition-colors hover:bg-white/90"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {ctaText}
          </a>
        </div>

        {/* Support text + logo marquee read as one unit — the support
            line sits directly above the brand row with a tight gap. */}
        <div className="mt-[64px] flex w-full flex-col items-center gap-[20px] lg:mt-[80px]">
          {supportText && (
            <p
              className="container-page max-w-[680px] text-center"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 14,
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {supportText}
            </p>
          )}
          <LogoMarquee />
        </div>
      </div>
    </section>
  );
}
