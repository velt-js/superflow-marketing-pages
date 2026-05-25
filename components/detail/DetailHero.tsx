import { Cursor } from "@/components/shared/Cursor";
import LogoBar from "@/components/home/LogoBar";
import type { DetailHeroData } from "@/lib/detail-data";

const DEFAULT_LEFT_BADGE = { label: "Developer", color: "#4dd5ff" };
const DEFAULT_RIGHT_BADGE = { label: "Designer", color: "#fc6cba" };

export default function DetailHero({
  variant = "default",
  eyebrow,
  heading,
  subheading,
  ctaText = "Try Superflow for Free",
  ctaHref = "https://app.usesuperflow.com/signup",
  leftBadge = DEFAULT_LEFT_BADGE,
  rightBadge = DEFAULT_RIGHT_BADGE,
  showLogoBar = true,
  roundedBottom = true,
}: DetailHeroData) {
  const isAlternative = variant === "alternative";

  return (
    <section
      className={`relative w-full overflow-hidden bg-[#030219] ${
        roundedBottom ? "rounded-b-[32px] lg:rounded-b-[80px]" : ""
      }`}
    >
      <div className="container-page relative flex flex-col items-center gap-[40px] pt-[140px] pb-[40px] lg:pt-[180px] lg:gap-[56px]">
        <div className="relative flex flex-col items-center gap-[28px] w-full">
          <div className="relative flex flex-col items-center gap-[20px] max-w-[840px] text-center">
            {eyebrow && (
              isAlternative ? (
                <span
                  className="inline-flex items-center rounded-full uppercase"
                  style={{
                    background: "rgba(98, 93, 245, 0.18)",
                    color: "#A89BFF",
                    border: "1px solid rgba(98, 93, 245, 0.35)",
                    padding: "6px 14px",
                    fontFamily: "var(--font-poppins)",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    lineHeight: 1,
                  }}
                >
                  {eyebrow}
                </span>
              ) : (
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
              )
            )}
            <h1
              className="text-white font-semibold"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: isAlternative
                  ? "clamp(36px, 5vw, 56px)"
                  : "clamp(36px, 5.5vw, 60px)",
                lineHeight: 1.15,
                letterSpacing: "-0.04em",
              }}
            >
              {heading}
            </h1>

            {isAlternative && subheading && (
              <p
                className="text-white/70"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 18,
                  lineHeight: 1.5,
                  letterSpacing: "-0.01em",
                  maxWidth: 680,
                }}
              >
                {subheading}
              </p>
            )}

            {!isAlternative && (
              <>
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
              </>
            )}
          </div>

          <a
            href={ctaHref}
            className={
              isAlternative
                ? "inline-flex items-center justify-center rounded-full px-5 py-[12px] text-white transition-colors"
                : "inline-flex items-center justify-center rounded-[32px] bg-white px-4 py-[11px] text-black transition-colors hover:bg-white/90"
            }
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 14,
              fontWeight: 500,
              lineHeight: "21px",
              ...(isAlternative
                ? { background: "#625DF5" }
                : {}),
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
