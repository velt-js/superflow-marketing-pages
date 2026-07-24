import { Cursor } from "@/components/shared/Cursor";
import LogoBar from "@/components/home/LogoBar";
import { toInternalHref } from "@/lib/links";

export interface ListingHeroBadge {
  label: string;
  color: string;
}

export interface ListingHeroProps {
  heading: string;
  subheading: string;
  ctaText?: string;
  ctaHref?: string;
  leftBadge?: ListingHeroBadge;
  rightBadge?: ListingHeroBadge;
  showLogoBar?: boolean;
}

const DEFAULT_LEFT_BADGE: ListingHeroBadge = { label: "Photographer", color: "#4dd5ff" };
const DEFAULT_RIGHT_BADGE: ListingHeroBadge = { label: "Designer", color: "#fc6cba" };

export default function ListingHero({
  heading,
  subheading,
  ctaText = "Try Superflow for Free",
  ctaHref = "https://app.usesuperflow.com/signup",
  leftBadge = DEFAULT_LEFT_BADGE,
  rightBadge = DEFAULT_RIGHT_BADGE,
  showLogoBar = true,
}: ListingHeroProps) {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#010001] rounded-b-[32px] lg:rounded-b-[80px]"
    >
      <div className="container-page relative flex flex-col items-center gap-[60px] pt-[140px] pb-[40px] lg:pt-[180px] lg:gap-[80px]">
        <div className="relative flex flex-col items-center gap-[32px] w-full">
          <div className="relative flex flex-col items-center gap-[20px] max-w-[800px] text-center">
            <h1
              className="text-white font-semibold"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(36px, 5.5vw, 60px)",
                lineHeight: "1.3",
                letterSpacing: "-0.045em",
              }}
            >
              {heading}
            </h1>
            <p
              className="max-w-[640px]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 16,
                lineHeight: "32px",
                color: "rgba(255,255,255,0.52)",
              }}
            >
              {subheading}
            </p>

            <Cursor
              direction="right"
              text={leftBadge.label}
              color={leftBadge.color}
              className="pointer-events-none hidden lg:block"
              style={{ position: "absolute", left: "-220px", top: "calc(100% - 12px)" }}
            />
            <Cursor
              direction="left"
              text={rightBadge.label}
              color={rightBadge.color}
              className="pointer-events-none hidden lg:block"
              style={{ position: "absolute", right: "-220px", top: "calc(100% - 12px)" }}
            />
          </div>

          <a
            href={toInternalHref(ctaHref) ?? "#"}
            className="inline-flex items-center justify-center rounded-[32px] bg-white px-4 py-[11px] text-black transition-colors hover:bg-white/90"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 14,
              fontWeight: 500,
              lineHeight: "21px",
            }}
          >
            {ctaText}
          </a>
        </div>
      </div>

      {showLogoBar && <LogoBar />}
    </section>
  );
}
