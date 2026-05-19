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
    <section className="bg-black px-4 lg:px-[52px] pb-12 lg:pb-[80px]">
      <div className="relative mx-auto max-w-[1200px] rounded-[40px] lg:rounded-[80px] bg-black p-[12px]"
        style={{ border: "4px solid rgba(255,255,255,0.12)" }}>
        <div className="relative aspect-[1176/700] overflow-hidden rounded-[32px] lg:rounded-[70px]">
          {/* Orange gradient background */}
          <Image
            src="/images/showcase/orange-bg.png"
            alt=""
            fill
            className="object-cover"
            priority={false}
          />

          {/* Centered cursor + heading */}
          <div className="absolute inset-x-0 top-[14%] flex flex-col items-center gap-[40px] lg:gap-[60px] px-6 text-center">
            <div className="relative h-[72px] w-[102px]">
              <div className="absolute left-[15px] top-0 h-[72px] w-[72px]">
                <Image src="/images/showcase/cursor.svg" alt="" width={72} height={72} />
              </div>
              <div className="absolute left-[58px] top-[28px] h-[40px] w-[40px] rotate-[-33deg]">
                <Image src="/images/showcase/rainbow-spinner.png" alt="" width={40} height={40} />
              </div>
            </div>

            <div className="flex flex-col gap-[20px]">
              <h2
                className="font-bold tracking-[-1.8px]"
                style={{
                  color: "#420404",
                  fontFamily: "var(--font-poppins)",
                  fontSize: "clamp(36px, 5vw, 60px)",
                  lineHeight: "1.2",
                }}
              >
                Reviews can move
                <br />
                <span>in slow motion</span>
                <span style={{ color: "rgba(66,4,4,0.5)" }}>n</span>
                <span style={{ color: "rgba(66,4,4,0.2)" }}>n</span>
              </h2>
              <p
                className="font-medium max-w-[527px] mx-auto"
                style={{
                  color: "#420404",
                  fontFamily: "var(--font-poppins)",
                  fontSize: "clamp(16px, 1.8vw, 23.6px)",
                  lineHeight: "1.2",
                }}
              >
                Screenshots are for memes. Not precise and
                <br />
                efficient review process
              </p>
            </div>
          </div>

          {/* Bottom tool bar */}
          <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 w-[432px] max-w-[calc(100%-32px)]">
            <div
              className="relative rounded-[24px] p-[12px] backdrop-blur-md flex items-center justify-center gap-[12px]"
              style={{ background: "rgba(24,25,29,0.42)" }}
            >
              {tools.map((t) => (
                <div key={t.name} className="h-[48px] w-[48px] shrink-0">
                  <Image src={t.src} alt={t.name} width={48} height={48} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
