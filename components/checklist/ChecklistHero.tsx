import type { ChecklistDoc } from "@/lib/checklist-types";
import { toInternalHref } from "@/lib/links";

const SIGNUP_FALLBACK = "https://app.usesuperflow.com/signup";

export default function ChecklistHero({ doc }: { doc: ChecklistDoc }) {
  const hero = doc.hero ?? {};
  const ctaText = hero.primaryCtaText || "Get Google Doc";
  const ctaHref = toInternalHref(hero.primaryCtaLink) ?? SIGNUP_FALLBACK;
  const docName = hero.docName || doc.title;

  return (
    <section className="relative w-full overflow-hidden bg-black">

      <div className="container-page relative flex flex-col items-center pt-[140px] pb-[80px] lg:pt-[180px] lg:pb-[120px]">
        <div className="mb-[28px] flex h-[64px] w-[64px] items-center justify-center">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="6"
              y="6"
              width="44"
              height="44"
              rx="10"
              stroke="#34D399"
              strokeWidth="3"
            />
            <path
              d="M18 29.5l7.5 7.5 14-16"
              stroke="#34D399"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          className="max-w-[920px] text-center text-white"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 700,
            fontSize: "clamp(36px, 5.5vw, 64px)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
          }}
        >
          {doc.title}
        </h1>

        {doc.description && (
          <p
            className="mt-[24px] max-w-[720px] text-center"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 17,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {doc.description}
          </p>
        )}

        {/* CTA card */}
        <div
          className="mt-[80px] w-full max-w-[920px] rounded-[24px] border p-[24px] lg:p-[32px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex flex-col items-start justify-between gap-[20px] sm:flex-row sm:items-center">
            <div>
              <div
                className="text-white"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: 20,
                  lineHeight: 1.3,
                }}
              >
                {docName}
              </div>
              <div
                className="mt-[4px]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                by Superflow Team
              </div>
            </div>
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-[40px] px-[28px] py-[14px] transition-opacity hover:opacity-90"
              style={{
                background: "#625DF5",
                color: "white",
                fontFamily: "var(--font-poppins)",
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {ctaText}
            </a>
          </div>

          {/* Skeleton lines (decorative) */}
          <div className="mt-[28px] flex flex-col gap-[12px]">
            {[88, 72, 84, 64, 78, 56].map((w, i) => (
              <div
                key={i}
                className="h-[10px] rounded-full"
                style={{
                  width: `${w}%`,
                  background: "rgba(255,255,255,0.05)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
