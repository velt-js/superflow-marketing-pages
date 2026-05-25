import Image from "next/image";
import SectionHeading from "./SectionHeading";
import type { ReasonsGridData } from "@/lib/detail-data";

export default function ReasonsGrid({
  heading,
  highlight,
  items,
}: ReasonsGridData) {
  return (
    <section
      className="bg-[#030219] pt-[80px] pb-[120px] lg:pt-[120px] lg:pb-[160px] rounded-b-[32px] lg:rounded-b-[80px]"
    >
      <div className="container-page flex flex-col items-center gap-[48px]">
        <div className="text-center">
          <h2
            className="font-semibold text-white tracking-[-0.03em]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.25,
            }}
          >
            {heading}
            {highlight && (
              <>
                <br />
                <span className="text-gradient-superflow">{highlight}</span>
              </>
            )}
          </h2>
        </div>

        <div className="grid w-full max-w-[960px] grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="group flex flex-col items-center justify-center gap-[12px] rounded-[20px] border border-white/10 bg-white/5 px-6 py-[28px] text-center transition-colors hover:border-white/30 hover:bg-white/10"
            >
              <div className="relative h-[36px] w-[36px] overflow-hidden">
                <Image
                  src={item.icon}
                  alt=""
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <p
                className="text-white"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: 1.3,
                  letterSpacing: "-0.03em",
                }}
              >
                {item.label}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
