import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";

export const metadata: Metadata = {
  title: "Try Demo — Superflow",
  description: "Click an asset for a live demo of Superflow.",
};

interface AssetType {
  id: string;
  label: string;
  icon: ReactNode;
  iconColor: string;
}

const ASSET_TYPES: AssetType[] = [
  {
    id: "websites",
    label: "Websites",
    iconColor: "#8B5CF6",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "video",
    label: "Video",
    iconColor: "#F05252",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M17 10l4-2v8l-4-2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "lottie",
    label: "Lottie",
    iconColor: "#22C55E",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 13s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    id: "pdf",
    label: "PDF",
    iconColor: "#F05252",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "image",
    label: "Image",
    iconColor: "#A855F7",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="9" cy="10" r="1.6" fill="currentColor" />
        <path d="M4 18l5-5 4 4 3-3 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
];

interface DemoCard {
  id: string;
  image: string;
  imageAlt: string;
  href: string;
}

const DEMO_CARDS: DemoCard[] = [
  {
    id: "websites",
    image: "/images/demo/website.png",
    imageAlt: "Website demo",
    href: "https://app.usesuperflow.com/signup",
  },
  {
    id: "video",
    image: "/images/demo/video.png",
    imageAlt: "Video demo",
    href: "https://app.usesuperflow.com/signup",
  },
  {
    id: "lottie",
    image: "/images/demo/lottie.png",
    imageAlt: "Lottie demo",
    href: "https://app.usesuperflow.com/signup",
  },
  {
    id: "pdf",
    image: "/images/demo/pdf.png",
    imageAlt: "PDF demo",
    href: "https://app.usesuperflow.com/signup",
  },
  {
    id: "image",
    image: "/images/demo/image.png",
    imageAlt: "Image demo",
    href: "https://app.usesuperflow.com/signup",
  },
];

function DemoTile({ card }: { card: DemoCard }) {
  return (
    <a
      href={card.href}
      aria-label={card.imageAlt}
      className="group block flex-shrink-0 transition-transform hover:-translate-y-1"
      style={{ width: 720 }}
    >
      <Image
        src={card.image}
        alt={card.imageAlt}
        width={720}
        height={450}
        sizes="720px"
        className="h-auto w-full opacity-90 transition-opacity group-hover:opacity-100"
      />
    </a>
  );
}

export default function DemoPage() {
  const marqueeCards = [...DEMO_CARDS, ...DEMO_CARDS];

  return (
    <main style={{ background: "#000" }}>
      <Nav />

      <section className="relative overflow-hidden pt-[140px] pb-[80px] lg:pt-[180px] lg:pb-[100px]">
        <div className="container-page flex flex-col items-center gap-[32px] text-center">
          <div className="flex flex-col items-center gap-[16px]">
            <h1
              className="text-white"
              style={{
                fontFamily: "var(--font-poppins)",
                fontWeight: 700,
                fontSize: "clamp(36px, 5.5vw, 60px)",
                lineHeight: 1.15,
                letterSpacing: "-0.045em",
              }}
            >
              Ship Creative Assets
              <br />
              Impossibly Fast
            </h1>
            <p
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: 16,
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Click an asset for a live demo.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-[10px]">
            {ASSET_TYPES.map((type) => (
              <a
                key={type.id}
                href={`#${type.id}`}
                className="inline-flex items-center gap-[8px] rounded-[32px] border border-white/10 bg-white/5 px-[18px] py-[10px] text-white transition-colors hover:border-white/25 hover:bg-white/10"
              >
                <span style={{ color: type.iconColor }} className="flex items-center">
                  {type.icon}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-poppins)",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {type.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden pb-[80px]">
        <div className="marquee-viewport w-full overflow-hidden">
          <div className="marquee-track gap-[20px]" style={{ ["--marquee-duration" as string]: "60s" }}>
            {marqueeCards.map((card, i) => (
              <DemoTile key={`${card.id}-${i}`} card={card} />
            ))}
          </div>
        </div>

        <p
          className="mt-[60px] text-center uppercase"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Click on a demo to continue
        </p>
      </section>

      <Footer />
      <IntercomButton />
    </main>
  );
}
