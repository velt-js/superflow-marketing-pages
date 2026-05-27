import Image from "next/image";
import Link from "next/link";
import SectionHeading from "./SectionHeading";
import Testimonial from "@/components/home/Testimonial";
import { TESTIMONIALS } from "@/lib/testimonials";
import type { RelatedWaysData } from "@/lib/detail-data";

export default function RelatedWays({
  heading,
  highlight,
  items,
  dark = false,
}: RelatedWaysData & { dark?: boolean }) {
  const featured = TESTIMONIALS[0];

  return (
    <section className="bg-white pt-[80px] pb-[100px] lg:pt-[120px] lg:pb-[140px]">
      <div className="flex flex-col items-center gap-[48px]">
        <SectionHeading heading={heading} highlight={highlight} />

        <div className="grid w-full max-w-[1000px] grid-cols-1 gap-[20px] sm:grid-cols-2 lg:grid-cols-3 px-6 lg:px-0">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex flex-col items-center gap-[16px] rounded-[28px] border-2 px-8 py-[40px] text-center transition-colors ${
                dark
                  ? "border-white/10 bg-[#0b0b16] hover:border-white/40 hover:bg-[#15151f]"
                  : "border-[#f7f7f7] bg-[#f7f7f7] hover:border-[#111] hover:bg-white"
              }`}
            >
              {item.iconNode ? (
                item.iconNode
              ) : item.icon ? (
                <div className="relative h-[40px] w-[40px] overflow-hidden">
                  <Image src={item.icon} alt="" width={40} height={40} className="object-contain" />
                </div>
              ) : null}
              <p
                className={dark ? "text-white" : "text-black"}
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: 20,
                  lineHeight: 1.3,
                  letterSpacing: "-0.03em",
                }}
              >
                {item.title}
              </p>
              {item.description && (
                <p
                  className={dark ? "text-white/70" : "text-black"}
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontWeight: 400,
                    fontSize: 16,
                    lineHeight: 1.5,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {item.description}
                </p>
              )}
            </Link>
          ))}
        </div>

        {featured && (
          <div className="w-full mt-[24px] lg:mt-[40px]">
            <Testimonial
              name={featured.name}
              role={featured.role}
              headline={featured.headline}
              quote={featured.quote}
              avatar={featured.avatar}
            />
          </div>
        )}
      </div>
    </section>
  );
}
