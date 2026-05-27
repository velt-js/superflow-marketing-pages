import Image from "next/image";
import SectionHeading from "./SectionHeading";
import type { ProblemSectionData } from "@/lib/detail-data";

export default function ProblemSection({
  heading,
  highlight,
  cards,
  dark = false,
}: ProblemSectionData & { dark?: boolean }) {
  return (
    <section className="bg-white pt-[80px] pb-[40px] lg:pt-[120px]">
      <div className="container-page flex flex-col items-center gap-[32px] pt-[32px] pb-[32px] mb-[32px] lg:pt-[48px] lg:pb-[48px]">

        <SectionHeading heading={heading} highlight={highlight} />

        <div className="grid w-full max-w-[1080px] grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className={`flex flex-col gap-[14px] rounded-[24px] border p-[24px] ${
                dark ? "border-white/10 bg-[#0b0b16]" : "border-[#ececec] bg-[#fafafa]"
              }`}
            >
              <div
                className={`relative h-[200px] w-full overflow-hidden rounded-[16px] ${
                  dark ? "bg-[#0b0b16]" : "bg-white"
                }`}
              >
                <Image
                  src={card.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 320px, 100vw"
                  className="object-cover object-top"
                />
              </div>
              <h3
                className="font-semibold"
                style={{
                  color: dark ? "#fff" : "#111",
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
                  color: dark ? "rgba(255,255,255,0.6)" : "rgba(17,17,17,0.6)",
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
