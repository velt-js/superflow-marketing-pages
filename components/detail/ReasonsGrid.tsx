import Image from "next/image";
import type { ReasonsGridData } from "@/lib/detail-data";

export default function ReasonsGrid({
  heading,
  highlight,
  subtitle,
  items,
}: ReasonsGridData) {
  return (
    <section
      className="bg-[#010001] pt-[80px] pb-[120px] lg:pt-[120px] lg:pb-[160px] rounded-b-[32px] lg:rounded-b-[80px]"
    >
      <div className="container-page flex flex-col items-center gap-[48px]">
        <div className="flex flex-col items-center gap-[20px] text-center">
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
                {highlight}
              </>
            )}
          </h2>
          {subtitle && (
            <p
              className="max-w-[640px]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 16,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-[1080px] grid-cols-1 gap-px overflow-hidden rounded-[24px] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <a
              key={item.id}
              href={`#criteria-${i + 1}`}
              className="group flex flex-col items-center gap-[12px] bg-[#010001] px-6 py-[40px] text-center transition-[background,box-shadow] duration-200 hover:bg-[#101018] hover:shadow-[inset_0_-60px_60px_-40px_rgba(132,128,255,0.25)]"
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
                  fontSize: 18,
                  lineHeight: 1.3,
                  letterSpacing: "-0.03em",
                }}
              >
                {item.label}
              </p>
              {item.description && (
                <p
                  className="max-w-[240px]"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  {item.description}
                </p>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
