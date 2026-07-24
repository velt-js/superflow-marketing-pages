import Image from "next/image";
import SectionHeading from "./SectionHeading";
import type { OverviewIconKey, OverviewTableData } from "@/lib/detail-data";
import { toInternalHref } from "@/lib/links";

const CRITERION_ICONS: Record<OverviewIconKey, string> = {
  commenting: "/images/sections/reasons/commenting.svg",
  compatibility: "/images/sections/reasons/compatibility.svg",
  integrations: "/images/sections/reasons/integrations.svg",
  "client-management": "/images/sections/reasons/client-management.svg",
  "team-workflow": "/images/sections/reasons/team-workflow.svg",
  "ai-copilot": "/images/sections/reasons/ai-copilot.svg",
};

const SUPERFLOW_LOGO = (
  <Image src="/images/nav/logo.svg" alt="Superflow" width={20} height={20} />
);

const GOOGLE_DOCS_LOGO = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
      fill="#3B82F6"
    />
    <path d="M14 2v6h6" fill="#1E40AF" opacity="0.6" />
    <path d="M8 12h8M8 15h8M8 18h6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export default function OverviewTable({
  heading,
  highlight,
  rows,
  competitorName,
  superflowName = "Superflow",
  superflowLogo,
  competitorLogo,
  ctaText,
  ctaHref,
}: OverviewTableData) {
  return (
    <section className="bg-white pt-[80px] pb-[100px] lg:pt-[120px] lg:pb-[140px]">
      <div className="container-page flex flex-col items-center gap-[56px]">
        <SectionHeading heading={heading} highlight={highlight} size="lg" />

        <div className="w-full max-w-[1080px] rounded-[28px] border border-[#ECECEC] bg-white px-[28px] py-[28px] lg:px-[48px] lg:py-[40px]">
          <div className="grid grid-cols-[1.6fr_1fr_1fr] items-center gap-2 pb-[20px]">
            <span
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 18,
                fontWeight: 400,
                color: "rgba(17,17,17,0.45)",
                letterSpacing: "-0.01em",
              }}
            >
              Overview
            </span>
            <div className="flex items-center justify-center gap-[10px]">
              {superflowLogo ? (
                <div className="relative h-[20px] w-[20px] overflow-hidden">
                  <Image src={superflowLogo} alt="" width={20} height={20} className="object-contain" />
                </div>
              ) : (
                SUPERFLOW_LOGO
              )}
              <span
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 18,
                  fontWeight: 500,
                  color: "#111",
                  letterSpacing: "-0.01em",
                }}
              >
                {superflowName}
              </span>
            </div>
            <div className="flex items-center justify-center gap-[10px]">
              {competitorLogo ? (
                <div className="relative h-[20px] w-[20px] overflow-hidden">
                  <Image src={competitorLogo} alt="" width={20} height={20} className="object-contain" />
                </div>
              ) : (
                GOOGLE_DOCS_LOGO
              )}
              <span
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 18,
                  fontWeight: 500,
                  color: "#111",
                  letterSpacing: "-0.01em",
                }}
              >
                {competitorName}
              </span>
            </div>
          </div>

          <div className="h-px w-full" style={{ background: "#ECECEC" }} />

          <div className="flex flex-col">
            {rows.map((row) => (
              <div
                key={row.criterion}
                className="grid grid-cols-[1.6fr_1fr_1fr] items-center gap-2 py-[18px] lg:py-[22px]"
              >
                <div className="flex items-center gap-[16px]">
                  <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center">
                    <Image
                      src={CRITERION_ICONS[row.iconKey]}
                      alt=""
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-poppins)",
                      fontSize: 20,
                      fontWeight: 500,
                      color: "#111",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {row.criterion}
                  </span>
                </div>
                <span
                  className="text-center"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 22,
                    fontWeight: 500,
                    color: "#22C55E",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {row.superflowScore}
                </span>
                <span
                  className="text-center"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 22,
                    fontWeight: 500,
                    color: "#F05252",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {row.competitorScore}
                </span>
              </div>
            ))}
          </div>
        </div>

        {ctaText && ctaHref && (
          <a
            href={toInternalHref(ctaHref) ?? "#"}
            className="inline-flex items-center justify-center rounded-[40px] bg-black px-[32px] py-[18px] text-white transition-colors hover:bg-black/80"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
