import type { UseCaseDoc } from "@/lib/use-case-types";
import { SIGNUP_URL } from "@/lib/use-case-types";

export default function UseCaseFeatureBanner({ doc }: { doc: UseCaseDoc }) {
  const line1 = doc.featureText1;
  const line2 = doc.featureText2;
  if (!line1 && !line2) return null;
  const ctaText = doc.hero?.heroCtaText || "Start Superflow for free";
  return (
    <section className="bg-[#0a0a0a] pt-[80px] pb-[80px] lg:pt-[120px] lg:pb-[120px]">
      <div className="container-page">
        <div
          className="relative mx-auto flex max-w-[960px] flex-col items-center gap-[24px] overflow-hidden rounded-[24px] px-[24px] py-[56px] text-center lg:py-[72px]"
          style={{
            background:
              "radial-gradient(circle at 30% 0%, rgba(99,102,241,0.45), rgba(10,10,10,0) 60%), radial-gradient(circle at 80% 100%, rgba(252,108,186,0.35), rgba(10,10,10,0) 60%), #111",
          }}
        >
          {line1 && (
            <p
              className="text-white"
              style={{
                fontFamily: "var(--font-poppins)",
                fontWeight: 600,
                fontSize: "clamp(28px, 4vw, 44px)",
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
              }}
            >
              {line1}
            </p>
          )}
          {line2 && (
            <p
              className="max-w-[640px]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 16,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {line2}
            </p>
          )}
          <a
            href={SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-[8px] inline-flex items-center justify-center rounded-[32px] bg-white px-[28px] py-[14px] text-black transition-colors hover:bg-white/90"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  );
}
