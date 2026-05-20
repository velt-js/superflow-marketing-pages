import Image from "next/image";
import SectionHeading from "./SectionHeading";
import type { ProblemSectionData } from "@/lib/detail-data";

export default function ProblemSection({
  heading,
  highlight,
  cards,
}: ProblemSectionData) {
  return (
    <section className="bg-white pt-[80px] pb-[40px] lg:pt-[120px]">
      <div className="container-page flex flex-col items-center gap-[48px]">
        <SectionHeading heading={heading} highlight={highlight} />

        <div className="grid w-full max-w-[1080px] grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="flex flex-col gap-[14px] rounded-[24px] border border-[#ececec] bg-[#fafafa] p-[24px]"
            >
              <div className="relative h-[120px] w-full overflow-hidden rounded-[16px] bg-white">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 320px, 100vw"
                  className="object-cover object-top"
                />
              </div>
              <h3
                className="text-[#111] font-semibold"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 18,
                  lineHeight: 1.3,
                  letterSpacing: "-0.03em",
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "rgba(17,17,17,0.6)",
                }}
              >
                {card.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
