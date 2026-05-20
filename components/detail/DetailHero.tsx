import { CursorBadge } from "@/components/shared/CursorBadge";
import LogoBar from "@/components/home/LogoBar";
import type { DetailHeroData } from "@/lib/detail-data";

const DEFAULT_LEFT_BADGE = { label: "Developer", color: "#4dd5ff" };
const DEFAULT_RIGHT_BADGE = { label: "Designer", color: "#fc6cba" };

export default function DetailHero({
  eyebrow,
  heading,
  ctaText = "Try Superflow for Free",
  ctaHref = "https://app.usesuperflow.com/signup",
  leftBadge = DEFAULT_LEFT_BADGE,
  rightBadge = DEFAULT_RIGHT_BADGE,
  showLogoBar = true,
  roundedBottom = true,
}: DetailHeroData) {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#010001]"
      style={
        roundedBottom
          ? { borderBottomLeftRadius: 80, borderBottomRightRadius: 80 }
          : undefined
      }
    >
      <div className="container-page relative flex flex-col items-center gap-[60px] pt-[140px] pb-[40px] lg:pt-[180px] lg:gap-[80px]">
        <div className="relative flex flex-col items-center gap-[32px] w-full">
          <div className="relative flex flex-col items-center gap-[20px] max-w-[840px] text-center">
            {eyebrow && (
              <span
                className="uppercase text-white/60"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  lineHeight: 1.5,
                }}
              >
                {eyebrow}
              </span>
            )}
            <h1
              className="text-white font-semibold"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(36px, 5.5vw, 60px)",
                lineHeight: 1.2,
                letterSpacing: "-0.045em",
              }}
            >
              {heading}
            </h1>

            <CursorBadge
              side="left"
              label={leftBadge.label}
              color={leftBadge.color}
              style={{ left: "-180px", top: "calc(100% - 12px)" }}
            />
            <CursorBadge
              side="right"
              label={rightBadge.label}
              color={rightBadge.color}
              style={{ right: "-180px", top: "calc(100% - 12px)" }}
            />
          </div>

          <a
            href={ctaHref}
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
