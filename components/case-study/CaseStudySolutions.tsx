import Image from "next/image";
import CaseStudySectionHeading from "./CaseStudySectionHeading";
import type {
  CaseStudySolutionRow,
  CaseStudySolutionsData,
} from "@/lib/case-study-data";

export default function CaseStudySolutions({
  heading,
  subtitle,
  rows,
}: CaseStudySolutionsData) {
  return (
    <section className="bg-white">
      <div className="container-page max-w-[1280px] mx-auto py-[80px] lg:py-[100px]">
        <div className="flex flex-col gap-[80px] items-center">
          <CaseStudySectionHeading heading={heading} subtitle={subtitle} />
          <div className="flex flex-col gap-[52px] w-full">
            {rows.map((row) => (
              <SolutionRow key={row.number} row={row} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionRow({ row }: { row: CaseStudySolutionRow }) {
  const text = (
    <div className="flex flex-col gap-[16px] items-start flex-1">
      <div
        className="flex items-center gap-[10px] justify-center p-[12px] rounded-[32px]"
        style={{ background: "rgba(5,127,50,0.08)" }}
      >
        <span
          className="font-semibold uppercase text-center"
          style={{
            fontFamily: "var(--font-poppins)",
            color: "#057f32",
            fontSize: 14,
            letterSpacing: "2.1px",
            lineHeight: 1,
          }}
        >
          {row.number}
        </span>
        <span
          className="self-stretch w-px"
          style={{ background: "#057f32", opacity: 0.4 }}
        />
        <span
          className="font-semibold uppercase whitespace-nowrap"
          style={{
            fontFamily: "var(--font-poppins)",
            color: "#057f32",
            fontSize: 14,
            letterSpacing: "2.1px",
            lineHeight: 1,
          }}
        >
          {row.tag}
        </span>
      </div>
      <div className="flex flex-col gap-[4px] w-full">
        <h3
          className="text-[#111] font-medium"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 24,
            letterSpacing: "-0.72px",
            lineHeight: 1.2,
          }}
        >
          {row.title}
        </h3>
        <p
          className="text-[#111] opacity-75"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 16,
            letterSpacing: "-0.48px",
            lineHeight: 1.6,
          }}
        >
          {row.description}
        </p>
      </div>
    </div>
  );

  const visual = (
    <div
      className="relative shrink-0 rounded-[24px] overflow-hidden w-full md:w-[580px] h-[326px]"
      style={{ background: "#0b0a23" }}
    >
      {row.video ? (
        <video
          src={row.video}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : row.image ? (
        <Image
          src={row.image}
          alt={row.title}
          fill
          className="object-cover"
          sizes="580px"
        />
      ) : null}
    </div>
  );

  return (
    <div
      className="flex flex-col md:flex-row items-center gap-[24px] rounded-[32px] py-[12px]"
      style={{
        paddingLeft: row.reverse ? 12 : 80,
        paddingRight: row.reverse ? 32 : 12,
      }}
    >
      {row.reverse ? (
        <>
          {visual}
          {text}
        </>
      ) : (
        <>
          {text}
          {visual}
        </>
      )}
    </div>
  );
}
