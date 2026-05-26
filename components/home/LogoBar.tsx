import Image from "next/image";

export const LOGO_BAR_LOGOS = [
  { src: "/images/logos/lbe.png", alt: "LBE", w: 110, h: 18 },
  { src: "/images/logos/xyt.png", alt: "XYT", w: 47, h: 28 },
  { src: "/images/logos/cox.png", alt: "Cox Automotive", w: 74, h: 24 },
  { src: "/images/logos/logo1.png", alt: "", w: 102, h: 26 },
  { src: "/images/logos/gmh.png", alt: "GMH", w: 152, h: 28 },
  { src: "/images/logos/image-graphic.svg", alt: "", w: 95, h: 16 },
  { src: "/images/logos/fhy.png", alt: "", w: 111, h: 34 },
  { src: "/images/logos/logo2.png", alt: "", w: 88, h: 16 },
  { src: "/images/logos/children.png", alt: "Children Defense Fund", w: 78, h: 28 },
  { src: "/images/logos/berger.png", alt: "Berger", w: 30, h: 23 },
  { src: "/images/logos/finsweet.png", alt: "Finsweet", w: 75, h: 23 },
  { src: "/images/logos/ncb.png", alt: "", w: 71, h: 31 },
  { src: "/images/logos/redshark.png", alt: "Redshark", w: 82, h: 25 },
  { src: "/images/logos/zanger.png", alt: "Zanger", w: 85, h: 26 },
  { src: "/images/logos/phenyx.png", alt: "Phenyx", w: 140, h: 25 },
  { src: "/images/logos/uservoice.png", alt: "Uservoice", w: 127, h: 26 },
  { src: "/images/logos/designgood.png", alt: "Design Good", w: 54, h: 26 },
  { src: "/images/logos/omfh.png", alt: "", w: 102, h: 19 },
  { src: "/images/logos/sylvan.png", alt: "Sylvan Learning", w: 46, h: 46 },
];

export function LogoMarquee() {
  const track = [...LOGO_BAR_LOGOS, ...LOGO_BAR_LOGOS];
  return (
    <div className="marquee-viewport w-full overflow-hidden">
      <div
        className="marquee-track items-center gap-[64px] opacity-40"
        style={{ ["--marquee-duration" as string]: "60s" }}
      >
        {track.map((logo, i) => (
          <div key={`${logo.src}-${i}`} className="shrink-0 flex items-center justify-center" style={{ height: 40 }}>
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.w}
              height={logo.h}
              className="object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LogoBar() {
  return (
    <section className="bg-black py-[60px]">
      <LogoMarquee />
    </section>
  );
}
