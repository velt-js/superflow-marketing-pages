import Image from "next/image";
import type { WhyChooseData } from "@/lib/detail-data";

const SUPERFLOW_LOGO = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="9" cy="8" r="4" fill="#FFB800" />
    <circle cx="15" cy="9" r="4" fill="#F05252" />
    <circle cx="9" cy="15" r="4" fill="#8B5CF6" />
    <circle cx="15" cy="16" r="4" fill="#22C55E" />
  </svg>
);

const LIGHTNING = (
  <svg width="28" height="32" viewBox="0 0 28 32" fill="none" aria-hidden="true">
    <path
      d="M16 3L6 18h7l-2 11 10-15h-7l2-11z"
      stroke="#F5B400"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const COMPETITOR_LOGO_DEFAULT = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
      fill="#3B82F6"
    />
    <path d="M14 2v6h6" fill="#1E40AF" opacity="0.6" />
    <path d="M8 12h8M8 15h8M8 18h6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const LOCK_ICON = (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <rect x="8" y="16" width="20" height="14" rx="3" stroke="#7B5EFF" strokeWidth="2" />
    <path
      d="M12 16v-3a6 6 0 1 1 12 0v3"
      stroke="#7B5EFF"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function WhyChooseSection({
  heading,
  highlight,
  bullets,
  ctaText,
  ctaHref,
  competitorLogo,
  compliance,
  quote,
}: WhyChooseData) {
  return (
    <section className="bg-white pt-[60px] pb-[80px] lg:pt-[80px] lg:pb-[120px]">
      <div className="container-page flex flex-col items-center gap-[28px]">
        <article className="w-full max-w-[920px] rounded-[28px] border border-[#ECECEC] bg-white px-[28px] py-[48px] lg:px-[64px] lg:py-[80px]">
          <div className="flex items-center justify-center gap-[28px]">
            <span className="flex h-[32px] items-center justify-center">{SUPERFLOW_LOGO}</span>
            <span className="flex h-[32px] items-center justify-center">{LIGHTNING}</span>
            {competitorLogo ? (
              <div className="relative h-[32px] w-[32px] overflow-hidden">
                <Image src={competitorLogo} alt="" width={32} height={32} className="object-contain" />
              </div>
            ) : (
              <span className="flex h-[32px] items-center justify-center">{COMPETITOR_LOGO_DEFAULT}</span>
            )}
          </div>

          <h2
            className="mt-[32px] text-center text-[#111]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
            }}
          >
            {heading}
            {highlight && (
              <>
                <br />
                {highlight}
              </>
            )}
          </h2>

          <ul className="mt-[32px] flex flex-col items-center gap-[14px]">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-center gap-[12px]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 18,
                  color: "#111",
                  letterSpacing: "-0.01em",
                }}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-[6px] w-[6px] rounded-full"
                  style={{ background: "#111" }}
                />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-[36px] flex justify-center">
            <a
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-[40px] bg-black px-[28px] py-[16px] text-white transition-colors hover:bg-black/80"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              {ctaText}
            </a>
          </div>
        </article>

        {compliance && (
          <div
            className="flex w-full max-w-[920px] items-center gap-[18px] rounded-[20px] px-[24px] py-[20px] lg:px-[32px]"
            style={{ background: "#EEEBFF" }}
          >
            <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center">
              {LOCK_ICON}
            </span>
            <p
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 18,
                fontWeight: 600,
                color: "#111",
                letterSpacing: "-0.01em",
              }}
            >
              {compliance.prefix}
              <span style={{ color: "#7B5EFF" }}>{compliance.highlight}</span>
              {compliance.suffix}
            </p>
          </div>
        )}

        {(quote?.quote || quote?.headline || quote?.authorName) && (
        <div className="flex w-full max-w-[920px] flex-col gap-[18px] rounded-[24px] border border-[#ECECEC] bg-white px-[28px] py-[28px] lg:flex-row lg:gap-[32px] lg:px-[40px] lg:py-[36px]">
          <div className="flex flex-col items-center gap-[10px] text-center lg:w-[180px] lg:shrink-0 lg:border-r lg:border-[#ECECEC] lg:pr-[24px]">
            <div className="relative h-[64px] w-[64px] overflow-hidden rounded-full bg-[#F4F4F6]">
              {quote.avatar ? (
                <Image
                  src={quote.avatar}
                  alt={quote.authorName}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : null}
            </div>
            <p
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 15,
                fontWeight: 700,
                color: "#111",
                letterSpacing: "-0.01em",
              }}
            >
              {quote.authorName}
            </p>
            <p
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 13,
                color: "rgba(17,17,17,0.55)",
              }}
            >
              {quote.authorRole}
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-[10px]">
            {quote.headline && (
              <p
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#111",
                  letterSpacing: "-0.02em",
                }}
              >
                {quote.headline}
              </p>
            )}
            {quote.quote && (
              <p
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "rgba(17,17,17,0.75)",
                }}
              >
                &ldquo;{quote.quote}&rdquo;
              </p>
            )}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
