import { Cursor } from "@/components/shared/Cursor";
import type { CaseStudyHeroData } from "@/lib/case-study-data";

const DEFAULT_LEFT = { label: "Photographer", color: "#4dd5ff" };
const DEFAULT_RIGHT = { label: "Designer", color: "#fc6cba" };

export default function CaseStudyHero({
  heading,
  subtitle,
  leftBadge = DEFAULT_LEFT,
  rightBadge = DEFAULT_RIGHT,
  meta,
}: CaseStudyHeroData) {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#010001]"
      style={{ borderBottomLeftRadius: 80, borderBottomRightRadius: 80 }}
    >
      <div className="container-page relative flex flex-col items-center gap-[40px] pt-[140px] pb-[52px] lg:pt-[180px]">
        <div className="relative flex flex-col items-center gap-[20px] max-w-[920px] py-[40px] text-center">
          <h1
            className="text-white font-semibold"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(36px, 5.5vw, 60px)",
              lineHeight: 1.3,
              letterSpacing: "-0.045em",
            }}
          >
            {heading}
          </h1>
          <p
            className="text-[16px] leading-[32px]"
            style={{
              fontFamily: "var(--font-poppins)",
              color: "rgba(255,255,255,0.52)",
            }}
          >
            {subtitle}
          </p>

          <Cursor
            direction="right"
            text={leftBadge.label}
            color={leftBadge.color}
            className="pointer-events-none hidden lg:block"
            style={{ position: "absolute", left: "-110px", top: "calc(100% - 130px)" }}
          />
          <Cursor
            direction="left"
            text={rightBadge.label}
            color={rightBadge.color}
            className="pointer-events-none hidden lg:block"
            style={{ position: "absolute", right: "-110px", top: "calc(100% - 90px)" }}
          />
        </div>

        <div
          className="flex items-start justify-between w-full max-w-[850px] rounded-[16px] px-8 py-8 gap-6"
          style={{ background: "#141414" }}
        >
          <MetaItem label="industry" value={meta.industry} />
          <Divider />
          <MetaItem label="Teams involved" value={meta.teamsInvolved} />
          <Divider />
          <MetaItem label="Company size" value={meta.companySize} />
        </div>
      </div>
    </section>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-[8px] flex-1">
      <span
        className="text-white opacity-50 uppercase"
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: 14,
          lineHeight: "16.8px",
          letterSpacing: "-0.28px",
        }}
      >
        {label}
      </span>
      <span
        className="whitespace-nowrap"
        style={{
          fontFamily: "var(--font-poppins)",
          color: "#f9f4ff",
          fontSize: 18,
          lineHeight: "21.6px",
          letterSpacing: "-0.36px",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="self-stretch w-px bg-white/10" />;
}
