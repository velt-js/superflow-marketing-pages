import CaseStudySectionHeading from "./CaseStudySectionHeading";
import type {
  CaseStudyResultMetric,
  CaseStudyResultsData,
} from "@/lib/case-study-data";

const TONES: Record<CaseStudyResultMetric["tone"], { from: string; to: string }> = {
  teal: { from: "#61ffe3", to: "#049077" },
  blue: { from: "#6184ff", to: "#0326a1" },
  amber: { from: "#f4c32a", to: "#de7a00" },
};

export default function CaseStudyResults({
  heading,
  subtitle,
  metrics,
}: CaseStudyResultsData) {
  const large = metrics.find((m) => m.size === "large");
  const small = metrics.filter((m) => m.size === "small");

  return (
    <section className="bg-white">
      <div className="container-page max-w-[1280px] mx-auto py-[80px] lg:py-[100px]">
        <div className="flex flex-col gap-[52px] items-center">
          <div className="flex flex-col gap-[12px] items-center text-center max-w-[800px]">
            <h2
              className="text-[#111] font-semibold"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(28px, 3.5vw, 40px)",
                letterSpacing: "-0.8px",
                lineHeight: 1.2,
              }}
            >
              {heading}
            </h2>
            <p
              className="text-[#111]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 18,
                letterSpacing: "-0.36px",
                lineHeight: 1.2,
              }}
            >
              {subtitle}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-[24px] w-full max-w-[800px] h-auto md:h-[384px]">
            {large && <LargeMetric metric={large} />}
            <div className="flex flex-col gap-[24px] flex-1">
              {small.map((m) => (
                <SmallMetric key={m.label} metric={m} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  function LargeMetric({ metric }: { metric: CaseStudyResultMetric }) {
    const tone = TONES[metric.tone];
    return (
      <div
        className="flex flex-col gap-[12px] items-center justify-center flex-1 p-[32px] rounded-[24px]"
        style={{ background: "#f7f7f7" }}
      >
        <span
          className="uppercase"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 500,
            fontSize: 100,
            lineHeight: 1,
            backgroundImage: `linear-gradient(180deg, ${tone.from}, ${tone.to})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {metric.value}
        </span>
        <span
          className="capitalize text-[#111] text-center"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 500,
            fontSize: 28,
            lineHeight: 1.2,
            maxWidth: 234,
          }}
        >
          {metric.label}
        </span>
      </div>
    );
  }

  function SmallMetric({ metric }: { metric: CaseStudyResultMetric }) {
    const tone = TONES[metric.tone];
    return (
      <div
        className="flex flex-col items-start justify-center flex-1 p-[24px] rounded-[24px]"
        style={{ background: "#f7f7f7" }}
      >
        <span
          className="uppercase text-left"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 500,
            fontSize: 40,
            lineHeight: 1.2,
            backgroundImage: `linear-gradient(180deg, ${tone.from}, ${tone.to})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {metric.value}
        </span>
        <span
          className="capitalize text-[#111] text-left"
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 500,
            fontSize: 28,
            lineHeight: 1.2,
          }}
        >
          {metric.label}
        </span>
      </div>
    );
  }
}
