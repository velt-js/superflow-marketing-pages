import Image from "next/image";
import type { UseCaseSolutionSection } from "@/lib/use-case-types";

export default function UseCaseSolution({
  section,
}: {
  section: UseCaseSolutionSection;
}) {
  const items = section.items ?? [];
  if (items.length === 0 && !section.title1 && !section.title2) return null;
  return (
    <section className="bg-white pt-[40px] pb-[100px] lg:pt-[60px] lg:pb-[140px]">
      <div className="container-page">
        {(section.title1 || section.title2) && (
          <h2
            className="mx-auto mb-[64px] max-w-[820px] text-center text-[#111]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            {section.title1}
            {section.title1 && section.title2 ? " " : ""}
            {section.title2 && (
              <span style={{ color: "#6366F1" }}>{section.title2}</span>
            )}
          </h2>
        )}
        <div className="flex flex-col gap-[80px]">
          {items.map((item, i) => {
            const reversed = i % 2 === 1;
            return (
              <div
                key={i}
                className={`flex flex-col items-center gap-[32px] lg:gap-[64px] ${
                  reversed ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                {item.image && (
                  <div className="relative w-full overflow-hidden rounded-[20px] border border-white/10 bg-[#0b0b16] lg:flex-1">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={item.image}
                        alt={item.title || ""}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-[14px] lg:flex-1">
                  {item.title && (
                    <h3
                      className="text-[#111]"
                      style={{
                        fontFamily: "var(--font-poppins)",
                        fontWeight: 600,
                        fontSize: "clamp(22px, 2.4vw, 28px)",
                        lineHeight: 1.25,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {item.title}
                    </h3>
                  )}
                  {item.subCopy && (
                    <p
                      style={{
                        fontFamily: "var(--font-poppins)",
                        fontSize: 16,
                        lineHeight: 1.6,
                        color: "rgba(17,17,17,0.65)",
                      }}
                    >
                      {item.subCopy}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
