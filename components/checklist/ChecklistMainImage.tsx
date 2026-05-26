import Image from "next/image";
import type { ChecklistMainSection } from "@/lib/checklist-types";

export default function ChecklistMainImage({
  section,
}: {
  section: ChecklistMainSection;
}) {
  if (!section.image && !section.subText && !section.caption) return null;

  return (
    <section className="relative bg-black py-[80px] rounded-b-[32px] overflow-hidden lg:py-[120px] lg:rounded-b-[80px]">
      <div className="container-page flex flex-col items-center">
        {section.subText && (
          <h2
            className="max-w-[860px] text-center text-white"
            style={{
              fontFamily: "var(--font-poppins)",
              fontWeight: 600,
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            {section.subText}
          </h2>
        )}
        {section.caption && (
          <p
            className="mt-[16px] text-center"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            {section.caption}
          </p>
        )}
      </div>
      {section.image && (
        <div className="mt-[48px] w-full">
          <Image
            src={section.image}
            alt={section.subText || ""}
            width={2400}
            height={1100}
            className="h-auto w-full"
            sizes="100vw"
            priority={false}
            unoptimized
          />
        </div>
      )}
    </section>
  );
}
