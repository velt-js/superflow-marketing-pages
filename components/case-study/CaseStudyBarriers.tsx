import Image from "next/image";
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

      <div className="relative flex items-center justify-center w-full flex-1">
        {card.image && (
          <Image
            src={card.image}
            alt={card.imageAlt || card.caption}
            width={220}
            height={140}
            className="object-contain max-h-[160px] w-auto"
          />
        )}
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

