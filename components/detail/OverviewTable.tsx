import Image from "next/image";
import type { ReactNode } from "react";
import SectionHeading from "./SectionHeading";
import type { OverviewIconKey, OverviewTableData } from "@/lib/detail-data";

const CRITERION_ICONS: Record<OverviewIconKey, ReactNode> = {
  commenting: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <g clipPath="url(#overview-commenting-a)">
        <g clipPath="url(#overview-commenting-b)">
          <path
            d="M13.25 7.55566H4.79167C2.69759 7.55566 1 9.25325 1 11.3473V22.4307C1 24.5247 2.69759 26.2223 4.79167 26.2223H15.875C17.9691 26.2223 19.6667 24.5247 19.6667 22.4307V14.5557"
            stroke="#A259FE"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="7.58 7.58"
          />
          <path
            d="M14.4902 8.13835C14.4902 4.95695 17.0693 2.37793 20.2507 2.37793C23.432 2.37793 26.0111 4.95696 26.0111 8.13835C26.0111 11.3197 23.432 13.8988 20.2507 13.8988H14.4902V8.13835Z"
            stroke="#A259FE"
            strokeWidth="1.5"
          />
        </g>
      </g>
      <defs>
        <clipPath id="overview-commenting-a">
          <rect width="27" height="26" fill="white" transform="translate(0.5 1)" />
        </clipPath>
        <clipPath id="overview-commenting-b">
          <rect width="27" height="26" fill="white" transform="translate(0.5 1)" />
        </clipPath>
      </defs>
    </svg>
  ),
  compatibility: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="14" height="11" rx="1.6" stroke="#22C55E" strokeWidth="1.8" />
      <rect x="14" y="11" width="11" height="11" rx="1.6" stroke="#22C55E" strokeWidth="1.8" fill="white" />
    </svg>
  ),
  integrations: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M15 3L6 16h6l-1 9 9-13h-6l1-9z"
        stroke="#F5B400"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "client-management": (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="10" cy="9" r="3.4" stroke="#F05252" strokeWidth="1.8" />
      <path d="M3.5 22c.6-3.6 3.4-5.5 6.5-5.5s5.9 1.9 6.5 5.5" stroke="#F05252" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="19" cy="10" r="2.8" stroke="#F05252" strokeWidth="1.8" />
      <path d="M16 21c.6-2.5 2.3-3.8 4.5-3.8 2 0 3.7 1.2 4.3 3.3" stroke="#F05252" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  "team-workflow": (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="4.5" stroke="#3B82F6" strokeWidth="1.8" />
      <path
        d="M18.5 14v1.3c0 2 1.5 3.4 3.3 3.4 1.9 0 3.2-1.5 3.2-3.7C25 8.4 20.5 4 14 4 7.4 4 2 9 2 14.6 2 20.3 7 25 13.4 25c2.4 0 4.5-.5 6.4-1.5"
        stroke="#3B82F6"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  "ai-copilot": (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path
        d="M11 4l1.6 4.4L17 10l-4.4 1.6L11 16l-1.6-4.4L5 10l4.4-1.6L11 4z"
        fill="#8B5CF6"
      />
      <path
        d="M20.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2L17.5 17l2.2-.8.8-2.2z"
        fill="#8B5CF6"
      />
    </svg>
  ),
};

const SUPERFLOW_LOGO = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="9" cy="8" r="4" fill="#FFB800" />
    <circle cx="15" cy="9" r="4" fill="#F05252" />
    <circle cx="9" cy="15" r="4" fill="#8B5CF6" />
    <circle cx="15" cy="16" r="4" fill="#22C55E" />
  </svg>
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
                Superflow
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
                    {CRITERION_ICONS[row.iconKey]}
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
            href={ctaHref}
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
