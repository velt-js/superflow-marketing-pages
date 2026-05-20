import Image from "next/image";
import Link from "next/link";
import SectionHeading from "./SectionHeading";
import type { RelatedWaysData } from "@/lib/detail-data";

export default function RelatedWays({
  heading,
  highlight,
  items,
}: RelatedWaysData) {
  return (
    <section className="bg-white pt-[80px] pb-[60px] lg:pt-[120px]">
      <div className="container-page flex flex-col items-center gap-[48px]">
        <SectionHeading heading={heading} highlight={highlight} />

        <div className="grid w-full max-w-[1080px] grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center gap-[12px] rounded-[24px] border-2 border-[#f7f7f7] bg-[#f7f7f7] px-6 py-[28px] text-center transition-colors hover:border-[#111] hover:bg-white"
            >
              {item.icon && (
                <div className="relative h-[28px] w-[28px] overflow-hidden">
                  <Image src={item.icon} alt="" width={28} height={28} className="object-contain" />
                </div>
              )}
              <p
                className="text-black"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: 1.3,
                  letterSpacing: "-0.03em",
                }}
              >
                {item.title}
              </p>
              {item.description && (
                <p
                  className="text-black"
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: 1.4,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {item.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
