import CaseStudySectionHeading from "./CaseStudySectionHeading";
import type {
  CaseStudyBarrierCard,
  CaseStudyBarriersData,
} from "@/lib/case-study-data";

export default function CaseStudyBarriers({
  heading,
  subtitle,
  cards,
}: CaseStudyBarriersData) {
  return (
    <section className="bg-white">
      <div className="container-page max-w-[1280px] mx-auto py-[60px]">
        <div className="flex flex-col gap-[24px] items-center">
          <CaseStudySectionHeading heading={heading} subtitle={subtitle} />
          <div className="flex flex-col md:flex-row gap-[13px] items-stretch w-full">
            {cards.map((card) => (
              <BarrierCard key={card.number} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BarrierCard({ card }: { card: CaseStudyBarrierCard }) {
  return (
    <div
      className="flex flex-col items-center justify-between flex-1 p-[32px] rounded-[28px] h-[401px]"
      style={{ border: "2px solid rgba(255,113,98,0.16)" }}
    >
      <div
        className="flex items-center justify-center rounded-[32px] p-[12px]"
        style={{ background: "rgba(255,113,98,0.08)" }}
      >
        <span
          className="font-semibold uppercase text-center"
          style={{
            fontFamily: "var(--font-poppins)",
            color: "#ff7162",
            fontSize: 16,
            letterSpacing: "2.4px",
            lineHeight: 1,
            minWidth: 24,
          }}
        >
          {card.number}
        </span>
      </div>

      <div className="flex items-center justify-center w-full">
        <BarrierVisual visualKey={card.visualKey} />
      </div>

      <p
        className="text-[#111] font-medium text-center"
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: 24,
          letterSpacing: "-0.72px",
          lineHeight: 1.25,
        }}
      >
        {card.caption}
      </p>
    </div>
  );
}

function BarrierVisual({ visualKey }: { visualKey: CaseStudyBarrierCard["visualKey"] }) {
  if (visualKey === "shortcuts") {
    return (
      <div className="flex gap-[8px]">
        <KeyChip letter="C" />
        <KeyChip letter="V" />
      </div>
    );
  }
  if (visualKey === "chat") {
    return (
      <div className="relative">
        <div
          className="px-[18px] py-[13px] rounded-[14px] text-white"
          style={{ background: "#4285f4" }}
        >
          <p
            className="text-center whitespace-nowrap"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 20,
              letterSpacing: "0.2px",
              lineHeight: 1.2,
            }}
          >
            Which button do you mean?
          </p>
          <p
            className="text-center opacity-60 mt-[4px]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 15,
              letterSpacing: "0.16px",
              lineHeight: 1.2,
            }}
          >
            3:00AM
          </p>
        </div>
        <svg
          className="absolute -bottom-[10px] -left-[6px]"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="#4285f4"
          aria-hidden
        >
          <path d="M22 0 L0 22 L22 22 Z" />
        </svg>
      </div>
    );
  }
  // task
  return (
    <div className="flex flex-col gap-[14px] w-full">
      <span
        className="uppercase opacity-30 text-[#111]"
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: 14,
          lineHeight: 1,
        }}
      >
        Open Tasks (34)
      </span>
      <div
        className="rounded-[14px] p-[24px]"
        style={{ background: "#fffdf3" }}
      >
        <div className="flex items-center gap-[5px]">
          <span
            className="font-medium text-[#111]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 17,
              lineHeight: 1,
            }}
          >
            Assigned to:
          </span>
          <span
            className="flex items-center justify-center font-medium"
            style={{
              fontFamily: "var(--font-poppins)",
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(255,205,46,0.04)",
              border: "1.21px solid rgba(255,205,46,0.12)",
              color: "#ffcd2e",
              fontSize: 17,
            }}
          >
            ?
          </span>
        </div>
        <p
          className="opacity-70 text-[#111] mt-[14px]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 22,
            lineHeight: 1,
          }}
        >
          Fix Button Copy
        </p>
      </div>
    </div>
  );
}

function KeyChip({ letter }: { letter: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: 80,
        height: 80,
        borderRadius: 12,
        background: "rgba(17,17,17,0.04)",
        border: "2px solid rgba(17,17,17,0.04)",
      }}
    >
      <div className="flex items-center gap-[4px]">
        <span
          className="font-medium text-[#111]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 22,
            lineHeight: 1,
          }}
          aria-hidden
        >
          ⌘
        </span>
        <span
          className="font-medium text-[#111]"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 24,
            letterSpacing: "-0.72px",
          }}
        >
          {letter}
        </span>
      </div>
    </div>
  );
}
