import Image from "next/image";
import type { UseCaseProblemSection } from "@/lib/use-case-types";

export default function UseCaseProblem({
  section,
  explanationTitle,
}: {
  section: UseCaseProblemSection;
  explanationTitle?: string;
}) {
  const items = section.items ?? [];
  if (items.length === 0 && !section.title1 && !section.title2 && !explanationTitle) {
    return null;
  }
  return (
    <section className="bg-white pt-[80px] pb-[80px] lg:pt-[120px] lg:pb-[100px]">
      <div className="container-page">
        {explanationTitle && (
          <p
            className="mx-auto mb-[24px] max-w-[760px] text-center"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#6366F1",
            }}
          >
            {explanationTitle}
          </p>
        )}
        {(section.title1 || section.title2) && (
          <h2
            className="mx-auto mb-[48px] max-w-[820px] text-center text-[#111]"
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
              <span style={{ color: "rgba(17,17,17,0.45)" }}>{section.title2}</span>
            )}
          </h2>
        )}
        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-[32px] md:grid-cols-3 md:gap-[32px] lg:gap-[40px]">
            {items.map((item, i) => (
              <div key={i} className="flex flex-col gap-[16px]">
                {item.image && (
                  <div className="rounded-[20px] border border-white/10 bg-[#0b0b16] p-[20px] lg:p-[24px]">
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={item.image}
                        alt={item.title || ""}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
                {item.title && (
                  <p
                    className="text-[#111]"
                    style={{
                      fontFamily: "var(--font-poppins)",
                      fontWeight: 600,
                      fontSize: 17,
                      lineHeight: 1.4,
                      letterSpacing: "-0.015em",
                    }}
                  >
                    {item.title}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
