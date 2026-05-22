import Image from "next/image";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";

function Card({ t }: { t: Testimonial }) {
  return (
    <div
      className="bg-white rounded-[32px] shrink-0 flex flex-col w-[clamp(340px,38vw,520px)] p-[52px] gap-[40px] items-center"
      style={{
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0px 16px 20px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex flex-col gap-[12px] w-full text-center">
        <p
          className="font-semibold"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 28,
            lineHeight: 1.5,
            letterSpacing: "-0.84px",
            color: "#23222b",
          }}
        >
          {t.headline}
        </p>
        <p
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 14,
            lineHeight: 1.8,
            letterSpacing: "-0.42px",
            color: "#23222b",
            opacity: 0.75,
          }}
        >
          {t.quote}
        </p>
      </div>

      <div className="flex items-center gap-[16px]">
        <div className="w-[44px] h-[44px] rounded-full overflow-hidden shrink-0">
          <Image src={t.avatar} alt={t.name} width={88} height={88} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col gap-[4px]">
          <span
            className="font-semibold text-[16px] leading-[1.5] whitespace-nowrap"
            style={{
              fontFamily: "var(--font-poppins)",
              backgroundImage: "linear-gradient(-83deg, rgb(252,153,255) 0%, rgb(181,34,113) 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {t.name}
          </span>
          <span
            className="text-[12px] whitespace-nowrap"
            style={{
              fontFamily: "var(--font-poppins)",
              color: "#23222b",
              opacity: 0.4,
              letterSpacing: "-0.36px",
            }}
          >
            {t.role}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoveCarousel() {
  const items = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <section className="bg-white px-6 lg:px-[30px] pb-[80px] rounded-b-[32px] lg:rounded-b-[80px]">
      <div className="bg-[#f5f5f7] rounded-[40px] lg:rounded-[80px] pt-[80px] pb-[52px] flex flex-col items-center gap-[48px]">
        <div className="flex flex-col items-center gap-[16px] px-6 text-center">
          <p
            className="uppercase"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.15em",
              lineHeight: 1.5,
              color: "#23222b",
            }}
          >
            Loved by 150+ Agencies
          </p>
          <h2
            className="font-semibold"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(36px, 5vw, 60px)",
              lineHeight: 1.3,
              letterSpacing: "-1.8px",
              color: "#000",
            }}
          >
            ❤️&nbsp; Why Customers Love Us
          </h2>
        </div>

        <div className="marquee-viewport w-full">
          <div className="marquee-track gap-[20px]" style={{ ["--marquee-duration" as string]: "90s" }}>
            {items.map((t, i) => (
              <Card key={`${t.name}-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
