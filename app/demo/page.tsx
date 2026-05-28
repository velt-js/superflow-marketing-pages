import Image from "next/image";
import type { ReactNode } from "react";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import IntercomButton from "@/components/home/IntercomButton";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const metadata = buildPageMetadata({
  title: "Live Product Demo — Superflow",
  description:
    "Click an asset for a live demo of Superflow. Review and collaborate on websites, videos, PDFs, Lottie files, and images.",
  path: "/demo",
  noBrandSuffix: true,
});

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
    href: "https://demo.usesuperflow.com",
  },
  {
    id: "video",
    image: "/images/demo/video.png",
    imageAlt: "Video demo",
    href: "https://drive.usesuperflow.com/video?id=YVUxTXhLUDByY2EyVVh3S2k4YmxfXzhlYWExNjc5NWQ5YWJlYjBlOGNhZmE1NjdjMTg3ZTI2X192aWRlbw%3D%3D&version=v1",
  },
  {
    id: "lottie",
    image: "/images/demo/lottie.png",
    imageAlt: "Lottie demo",
    href: "https://drive.usesuperflow.com/lottie?id=YVUxTXhLUDByY2EyVVh3S2k4YmxfXzQ2MTIxN2NlYTAxZDJkOTk0YjMwMmQwZjllMTA4YjMyX19sb3R0aWU%3D&version=v1",
  },
  {
    id: "pdf",
    image: "/images/demo/pdf.png",
    imageAlt: "PDF demo",
    href: "https://drive.usesuperflow.com/pdf?id=YVUxTXhLUDByY2EyVVh3S2k4YmxfXzRkYjdiZGU1MzQ5NjNjOWQ0NDRmZGUyODgxYWFiMjE4X19wZGY%3D&review=true&version=v1",
  },
  {
    id: "image",
    image: "/images/demo/image.png",
    imageAlt: "Image demo",
    href: "https://drive.usesuperflow.com/image?id=YVUxTXhLUDByY2EyVVh3S2k4YmxfX2JjYzYwZjFiM2NkZDVlMzNmYjRlOGQ3NTlmMDhkMmVlX19pbWFnZQ%3D%3D&review=true&version=v1",
  },
];

const DEMO_HREF_BY_ID = Object.fromEntries(
  DEMO_CARDS.map((card) => [card.id, card.href]),
) as Record<string, string>;

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
      <PageJsonLd
        name="Live Product Demo — Superflow"
        description="Click an asset for a live demo of Superflow. Review and collaborate on websites, videos, PDFs, Lottie files, and images."
        path="/demo"
        trail={[{ name: "Demo", url: `${SITE_URL}/demo` }]}
      />
      <Nav />

      <section className="relative overflow-hidden pt-[140px] pb-[80px] lg:pt-[180px] lg:pb-[100px]">
        <div className="container-page flex flex-col items-center gap-[32px] text-center">
          <div className="flex flex-col items-center gap-[16px]">
            <h1
              className="text-white"
              style={{
                fontFamily: "var(--font-poppins)",
                fontWeight: 600,
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
                href={DEMO_HREF_BY_ID[type.id]}
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
