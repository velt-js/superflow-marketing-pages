import Image from "next/image";

const tools = [
  { name: "Gmail", src: "/images/showcase/gmail.png" },
  { name: "Slack", src: "/images/showcase/slack.png" },
  { name: "Preview", src: "/images/showcase/preview.png" },
  { name: "Zoom", src: "/images/showcase/zoom.png" },
  { name: "Loom", src: "/images/showcase/loom.png" },
  { name: "QuickTime", src: "/images/showcase/quicktime.png" },
  { name: "Chrome", src: "/images/showcase/chrome.png" },
];

export default function HeroShowcase() {
  return (
    <section className="bg-black px-4 lg:px-[52px] pb-12 lg:pb-[80px] rounded-b-[32px] lg:rounded-b-[80px]">
      {/* Outer black card with white-12% 4px border, rounded-80, 12px inner padding */}
      <div
        className="relative mx-auto max-w-[1200px] bg-black p-[12px] rounded-[40px] lg:rounded-[80px]"
        style={{ border: "4px solid rgba(255,255,255,0.12)" }}
      >
        {/* Inner orange container — taller portrait aspect on mobile so all
            content fits; the Figma 1176/700 landscape aspect kicks in at lg. */}
        <div
          className="relative overflow-hidden aspect-[2/3] lg:aspect-[1176/700] rounded-[32px] lg:rounded-[70px]"
        >
          {/* Orange gradient background */}
          <Image
            src="/images/showcase/orange-bg.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 1176px, 100vw"
            className="object-cover"
            priority={false}
          />

          {/* Top group: loading cursor + heading + subtitle */}
          <div className="absolute left-[6%] right-[6%] lg:left-[25.55%] lg:right-[25.55%] top-[8%] lg:top-[14%] flex flex-col items-center gap-[24px] lg:gap-[60px] mt-12">
            {/* Loading cursor with rainbow spinner */}
            <div className="relative h-[40px] w-[58px] lg:h-[56px] lg:w-[80px]">
              <div className="absolute left-[8px] lg:left-[12px] top-0 h-[40px] w-[26px] lg:h-[56px] lg:w-[36px]">
                <Image src="/images/showcase/cursor.svg" alt="" width={36} height={56} className="w-full h-full" />
              </div>
              <div
                className="absolute left-[32px] lg:left-[45px] top-[16px] lg:top-[22px] h-[22px] w-[22px] lg:h-[31px] lg:w-[31px] animate-[spin_1.6s_linear_infinite]"
              >
                <Image src="/images/showcase/rainbow-spinner.png" alt="" width={31} height={31} className="w-full h-full" />
              </div>
            </div>

            {/* Heading + Subtitle */}
            <div className="flex flex-col items-center gap-[19.67px] w-[575px] max-w-full">
              <h2
                className="font-bold text-center tracking-[-1.8px] w-full"
                style={{
                  color: "#420404",
                  fontFamily: "var(--font-poppins)",
                  fontSize: "clamp(28px, 4.5vw, 60px)",
                  lineHeight: 1.15,
                }}
              >
                <span className="block">Reviews can move</span>
                <span className="block">
                  in slow motio
                  <span>n</span>
                  <span style={{ color: "rgba(66,4,4,0.5)" }}>n</span>
                  <span style={{ color: "rgba(66,4,4,0.2)" }}>n</span>
                </span>
              </h2>
              <p
                className="font-medium text-center w-full"
                style={{
                  color: "#420404",
                  fontFamily: "var(--font-poppins)",
                  fontSize: "clamp(14px, 1.8vw, 23.6px)",
                  lineHeight: 1.3,
                }}
              >
                Screenshots are for memes. Not precise and
                <br />
                efficient review process
              </p>
            </div>
          </div>
     

          {/* Bottom: tooltip + tool bar */}
          <div className="absolute bottom-[32px] left-1/2 -translate-x-1/2 w-[432px] max-w-[calc(100%-32px)]">
            {/* Tooltip — "You are using more than 6 tools to review" */}
            <div className="relative flex flex-col items-center mb-[10px]">
              <div
                className="flex items-center justify-center px-[16px] py-[12px]"
                style={{
                  background: "rgba(29,30,31,0.79)",
                  borderRadius: 16,
                }}
              >
                <p
                  className="text-center text-white"
                  style={{ fontFamily: "var(--font-poppins)", fontSize: 16, lineHeight: "24px" }}
                >
                  You are using{" "}
                  <strong style={{ fontWeight: 600 }}>
                    more than
                    <br />6 tools
                  </strong>{" "}
                  to review
                </p>
              </div>
              {/* Down arrow pointing at the tool bar below */}
              <svg
                width="21"
                height="12"
                viewBox="0 0 21 12"
                aria-hidden
                style={{ display: "block", marginTop: -1 }}
              >
                <path
                  d="M 13.573 8.313 C 11.974 10.232 9.026 10.232 7.427 8.313 L 0.5 0 L 20.5 0 Z"
                  fill="rgba(29,30,31,0.79)"
                />
              </svg>
            </div>

            {/* Tool bar — single tools-grouped image from Figma */}
            <div
              className="flex items-center justify-center p-[12px]"
              style={{
                background: "rgba(24,25,29,0.42)",
                borderRadius: 24,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <div className="relative w-full h-[48px]">
                <Image
                  src="/images/showcase/tools-grouped.png"
                  alt=""
                  fill
                  sizes="408px"
                  className="object-contain"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
