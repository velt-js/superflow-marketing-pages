import Image from "next/image";
import type {
  CaseStudyTestimonialBadge,
  CaseStudyTestimonialData,
} from "@/lib/case-study-data";

export default function CaseStudyTestimonial({
  headline,
  quote,
  authorName,
  authorRole,
  avatar,
  badges,
}: CaseStudyTestimonialData) {
  return (
    <section className="bg-white">
      <div className="container-page max-w-[1280px] mx-auto py-[80px] lg:py-[120px] relative">
        <div className="flex flex-col gap-[40px] items-center max-w-[1120px] mx-auto relative">
          <div className="flex flex-col gap-[16px] items-center">
            <div
              className="flex items-center p-[16px] rounded-[6px]"
              style={{ border: "1.3px dashed #625ff0" }}
            >
              <h2
                className="text-[#111] font-semibold text-center whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                  lineHeight: 1.2,
                }}
              >
                {`“${headline}”`}
              </h2>
            </div>
            <p
              className="text-[#111] opacity-75 text-center"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(18px, 2vw, 24px)",
                lineHeight: 2,
                maxWidth: 1028,
              }}
            >
              {`"${quote}"`}
            </p>
          </div>

          <div className="flex gap-[16px] items-center justify-center">
            <div
              className="relative shrink-0 flex items-center justify-center"
              style={{
                width: 50,
                height: 50,
                background: "#625df5",
                border: "2.5px solid #fff",
                borderRadius: "125px 2.5px 125px 125px",
                transform: "rotate(-90deg)",
              }}
            >
              <div
                className="relative overflow-hidden"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  transform: "rotate(90deg)",
                }}
              >
                <Image src={avatar} alt={authorName} fill className="object-cover" sizes="30px" />
              </div>
            </div>
            <div className="flex flex-col gap-[8px] items-start text-[#111]">
              <span
                className="capitalize font-medium"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                {authorName}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 14,
                  letterSpacing: "-0.28px",
                  lineHeight: 1.2,
                }}
              >
                {authorRole}
              </span>
            </div>
          </div>

          {badges.map((b) => (
            <FloatingBadge key={b.label} badge={b} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FloatingBadge({ badge }: { badge: CaseStudyTestimonialBadge }) {
  const pointerColor = badge.pointerColor ?? badge.color;
  return (
    <div
      className="absolute pointer-events-none hidden lg:block"
      style={badge.position}
    >
      <div className="relative flex items-center">
        {badge.pointer === "left" && (
          <svg
            width="29"
            height="32"
            viewBox="0 0 27 30"
            fill={pointerColor}
            stroke="#fff"
            strokeWidth="1.75"
            aria-hidden
            style={{ marginRight: -4, transform: "scaleX(-1)" }}
          >
            <path d="M 17.842 22.858 L 21.797 2.973 C 22.089 1.501 20.515 0.368 19.212 1.112 L 1.758 11.086 C 0.398 11.863 0.665 13.899 2.179 14.298 L 9.622 16.261 C 10.054 16.375 10.427 16.65 10.663 17.03 L 14.639 23.439 C 15.476 24.788 17.533 24.415 17.842 22.858 Z" />
          </svg>
        )}
        <span
          className="flex items-center justify-center font-bold whitespace-nowrap"
          style={{
            fontFamily: "var(--font-urbanist)",
            background: badge.color,
            color: badge.textColor ?? "#fff",
            fontSize: 18,
            letterSpacing: "0.18px",
            padding: "9px 18px",
            borderRadius: 56,
            marginTop: 22,
          }}
        >
          {badge.label}
        </span>
        {badge.pointer === "right" && (
          <svg
            width="29"
            height="32"
            viewBox="0 0 27 30"
            fill={pointerColor}
            stroke="#fff"
            strokeWidth="1.75"
            aria-hidden
            style={{ marginLeft: -4 }}
          >
            <path d="M 17.842 22.858 L 21.797 2.973 C 22.089 1.501 20.515 0.368 19.212 1.112 L 1.758 11.086 C 0.398 11.863 0.665 13.899 2.179 14.298 L 9.622 16.261 C 10.054 16.375 10.427 16.65 10.663 17.03 L 14.639 23.439 C 15.476 24.788 17.533 24.415 17.842 22.858 Z" />
          </svg>
        )}
      </div>
    </div>
  );
}
