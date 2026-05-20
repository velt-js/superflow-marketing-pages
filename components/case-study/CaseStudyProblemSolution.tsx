import CaseStudySectionHeading from "./CaseStudySectionHeading";
import type { CaseStudyProblemSolutionData } from "@/lib/case-study-data";

export default function CaseStudyProblemSolution({
  heading,
  subtitle,
  problem,
  solution,
}: CaseStudyProblemSolutionData) {
  return (
    <section className="bg-white">
      <div className="container-page max-w-[1280px] mx-auto py-[80px] lg:py-[100px]">
        <div className="flex flex-col gap-[40px] items-center">
          <CaseStudySectionHeading heading={heading} subtitle={subtitle} />
          <div className="flex flex-col md:flex-row gap-[12px] items-stretch w-full">
            <Card tone="problem" title="Problem" body={problem} />
            <Card tone="solution" title="Solution" body={solution} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({
  tone,
  title,
  body,
}: {
  tone: "problem" | "solution";
  title: string;
  body: string;
}) {
  const isProblem = tone === "problem";
  return (
    <div
      className="flex flex-col gap-[16px] items-start p-[32px] rounded-[32px] flex-1"
      style={{
        background: isProblem ? "rgba(255,113,98,0.08)" : "rgba(13,207,130,0.08)",
      }}
    >
      <div className="flex gap-[16px] items-center w-full">
        <div className="w-[28px] h-[28px] flex items-center justify-center">
          {isProblem ? <XCircleIcon /> : <CheckCircleIcon />}
        </div>
        <h3
          className="text-[#111] font-semibold"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 24,
            lineHeight: "33.6px",
          }}
        >
          {title}
        </h3>
      </div>
      <p
        className="text-[#111] font-medium"
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: 24,
          lineHeight: 1.4,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function XCircleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="#ff7162" strokeWidth="2" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="#ff7162" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="#0dcf82" strokeWidth="2" />
      <path d="M8 12.5l2.5 2.5L16 9" stroke="#0dcf82" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
