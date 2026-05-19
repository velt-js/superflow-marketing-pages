import Image from "next/image";

const assetPills = [
  { label: "Websites", icon: "world" },
  { label: "Video", icon: "youtube" },
  { label: "Lottie", icon: "lottie" },
  { label: "PDF", icon: "pdf" },
  { label: "Image", icon: "image" },
];

function PillIcon({ name }: { name: string }) {
  const common = { width: 23, height: 23, fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "world":
      return (
        <svg viewBox="0 0 24 24" {...common} className="opacity-90">
          <circle cx="12" cy="12" r="9" />
          <path d="M3.6 9h16.8M3.6 15h16.8M12 3a13 13 0 010 18M12 3a13 13 0 000 18" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" {...common} className="opacity-90">
          <rect x="3" y="6" width="18" height="12" rx="3" />
          <path d="M10 9.5l4.5 2.5L10 14.5z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "lottie":
      return (
        <svg viewBox="0 0 24 24" {...common} className="opacity-90">
          <path d="M5 18c4 0 4-12 8-12s4 12 8 12" />
        </svg>
      );
    case "pdf":
      return (
        <svg viewBox="0 0 24 24" {...common} className="opacity-90">
          <path d="M7 3h7l4 4v14H7z" />
          <path d="M14 3v4h4" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      );
    case "image":
      return (
        <svg viewBox="0 0 24 24" {...common} className="opacity-90">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="M21 17l-5-5-9 9" />
        </svg>
      );
    default:
      return null;
  }
}

function MarqueePill({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-4 rounded-[35px] bg-white/[0.08] px-4 py-2">
      <PillIcon name={icon} />
      <span className="text-[16px] leading-[25.88px] font-normal text-white opacity-90">
        {label}
      </span>
    </div>
  );
}

export default function Hero() {
  // Track repeated twice for seamless marquee loop.
  const track = [...assetPills, ...assetPills, ...assetPills, ...assetPills];
  return (
    <section
      className="relative w-full overflow-hidden pt-[140px] pb-[80px] lg:pt-[180px] lg:pb-[120px]"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(132,128,255,0.18), transparent 70%), #000",
      }}
    >
      <div className="container-page relative flex flex-col items-center gap-[40px] lg:gap-[52px]">
        <div className="relative flex flex-col items-center gap-[24px]">
          <div className="relative flex flex-col items-center gap-[10px]">
            <h1
              className="text-center font-semibold tracking-[-0.03em] text-white"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(48px, 9vw, 100px)",
                lineHeight: "1.1",
              }}
            >
              Ship More Creative
            </h1>
            <h1
              className="text-gradient-superflow text-center font-semibold tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(48px, 9vw, 100px)",
                lineHeight: "1.1",
              }}
            >
              Assets Impossibly Fast
            </h1>

            {/* Decorative cursor badges */}
            <div className="pointer-events-none absolute hidden lg:block left-[-40px] top-[140px]">
              <CursorBadge label="Developer" color="#4dd5ff" src="/images/hero/cursor-developer.png" flip={false} />
            </div>
            <div className="pointer-events-none absolute hidden lg:block right-[-40px] top-[140px]">
              <CursorBadge label="Designer" color="#fc6cba" src="/images/hero/cursor-designer.png" flip />
            </div>
          </div>

          <p
            className="max-w-[640px] text-center text-white text-[18px] lg:text-[24px]"
            style={{ fontFamily: "var(--font-poppins)", lineHeight: 1.2, letterSpacing: "-0.03em" }}
          >
            Get approved with fewer rounds of reviews. Get back to creating.
          </p>

          <div className="flex items-center gap-[17px]">
            <a
              href="#demo"
              className="flex items-center justify-center rounded-[32px] bg-white/[0.08] px-6 py-3 text-[18px] font-medium leading-[27px] text-white transition-colors hover:bg-white/[0.14]"
            >
              Try Demo
            </a>
            <a
              href="#signup"
              className="flex items-center justify-center rounded-[32px] bg-white px-6 py-3 text-[18px] font-medium leading-[27px] text-black transition-colors hover:bg-white/90"
            >
              Try Now For Free
            </a>
          </div>
        </div>

        {/* Asset-type marquee strip */}
        <div className="marquee-viewport w-full overflow-hidden" style={{ height: 60 }}>
          <div className="marquee-track items-center gap-[18.4px]" style={{ ["--marquee-duration" as string]: "40s" }}>
            {track.map((p, i) => (
              <MarqueePill key={`${p.label}-${i}`} icon={p.icon} label={p.label} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CursorBadge({
  label,
  color,
  src,
  flip,
}: {
  label: string;
  color: string;
  src: string;
  flip: boolean;
}) {
  return (
    <div className="relative h-[57px] w-[107px]">
      <div
        className="absolute top-0 h-[30px] w-[27px]"
        style={{ [flip ? "left" : "right"]: 0 } as React.CSSProperties}
      >
        <Image src={src} alt="" width={27} height={30} />
      </div>
      <div
        className="absolute bottom-0 flex items-center rounded-[29px] px-[9px] pt-[4px] pb-[5px]"
        style={{ background: color, [flip ? "left" : "right"]: "16px" } as React.CSSProperties}
      >
        <span
          className="font-semibold text-[16px] leading-[19.2px] text-black"
          style={{ fontFamily: "var(--font-urbanist)" }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
