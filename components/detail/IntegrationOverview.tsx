import type {
  IntegrationOverviewData,
  IntegrationStep,
  IntegrationStepsData,
} from "@/lib/detail-data";

function StepRow({ step, index }: { step: IntegrationStep; index: number }) {
  return (
    <div className="flex items-start gap-[18px]">
      <span
        className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full"
        style={{
          background: "#F4F2FF",
          color: "#6366F1",
          fontFamily: "var(--font-poppins)",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {index + 1}
      </span>
      <div className="flex flex-1 flex-col gap-[10px]">
        <p
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            fontSize: 16,
            color: "#111",
            letterSpacing: "-0.01em",
          }}
        >
          {step.title}
        </p>
        <ul className="flex flex-col gap-[6px] pl-[18px]">
          {step.bullets.map((bullet, i) => (
            <li
              key={i}
              className="list-disc"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 14,
                lineHeight: 1.6,
                color: "rgba(17,17,17,0.65)",
              }}
            >
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function IntegrationOverview({
  overview,
  steps,
}: {
  overview: IntegrationOverviewData;
  steps: IntegrationStepsData;
}) {
  return (
    <section
      className="bg-white pt-[80px] pb-[120px] lg:pt-[120px] lg:pb-[160px] rounded-b-[32px] lg:rounded-b-[80px]"
    >
      <div className="container-page">
        <div className="mx-auto flex max-w-[720px] flex-col gap-[64px]">
          <div className="flex flex-col gap-[16px]">
            <h2
              className="text-[#111]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontWeight: 700,
                fontSize: "clamp(24px, 3vw, 32px)",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
              }}
            >
              {overview.heading}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 15,
                lineHeight: 1.65,
                color: "rgba(17,17,17,0.65)",
              }}
            >
              {overview.description}
            </p>
          </div>

          <div className="flex flex-col gap-[28px]">
            <div className="flex flex-col gap-[8px]">
              <h2
                className="text-[#111]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 700,
                  fontSize: "clamp(24px, 3vw, 32px)",
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                }}
              >
                {steps.heading}
              </h2>
              {steps.subheading && (
                <p
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "rgba(17,17,17,0.6)",
                  }}
                >
                  {steps.subheading}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-[28px]">
              {steps.steps.map((step, i) => (
                <StepRow key={step.title} step={step} index={i} />
              ))}
            </div>

            {steps.successNote && (
              <div className="flex items-center gap-[10px]">
                <span
                  className="flex h-[20px] w-[20px] items-center justify-center rounded-full"
                  style={{ background: "rgba(34,197,94,0.15)" }}
                  aria-hidden="true"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.2L4.8 8.5L9.5 3.5"
                      stroke="#22C55E"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#22C55E",
                  }}
                >
                  {steps.successNote}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
