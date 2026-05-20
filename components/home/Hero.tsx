import { CursorBadge, PhotographerCursor } from "@/components/shared/CursorBadge";

const assetPills = [
  { label: "Websites", icon: "/images/hero/icon-world.svg", href: "/website-review" },
  { label: "Video", icon: "/images/hero/icon-youtube.svg", href: "/video-review" },
  { label: "Lottie", icon: "/images/hero/icon-lottie.svg", href: "/lottie-files-review" },
  { label: "PDF", icon: "/images/hero/icon-pdf.svg", href: "/pdf-review" },
  { label: "Image", icon: "/images/hero/icon-image.svg", href: "/image-review" },
];

function MarqueePill({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className="flex shrink-0 items-center gap-4 rounded-[35px] bg-white/[0.08] px-4 py-2 transition-colors hover:bg-white/[0.14]"
    >
      <img src={icon} alt="" width={23} height={24} aria-hidden style={{ flexShrink: 0 }} />
      <span
        className="font-normal text-white"
        style={{ fontFamily: "var(--font-poppins)", fontSize: 16, lineHeight: "25.88px" }}
      >
        {label}
      </span>
    </a>
  );
}

export default function Hero() {
  // Repeat 5× for seamless marquee (track translates -50% so it needs at least 2 copies; 5 keeps gap distribution similar to live site).
  const track = Array.from({ length: 5 }).flatMap(() => assetPills);

  return (
    <section
      className="relative w-full overflow-hidden bg-black pt-[120px] pb-[60px] lg:pt-[160px] lg:pb-[80px]"
    >
      <div className="container-page relative flex flex-col items-center gap-[40px] lg:gap-[52px]">
        <div className="relative flex flex-col items-center gap-[24px]">
          <div className="relative flex flex-col items-center gap-[10px]">
            <h1
              className="text-center text-white font-semibold tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(40px, 7vw, 80px)",
                lineHeight: "1.3em",
              }}
            >
              Ship More Creative
            </h1>

            <h1
              className="text-gradient-superflow text-center font-semibold tracking-[-0.03em]"
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(40px, 7vw, 80px)",
                lineHeight: "1.3em",
              }}
            >
              Assets Impossibly Fast
            </h1>
          </div>

          <CursorBadge
            label="Developer"
            color="#4dd5ff"
            side="left"
            style={{ left: "-160px", top: "calc(50% + 12px)" }}
          />
          <CursorBadge
            label="Designer"
            color="#fc6cba"
            side="right"
            style={{ right: "-160px", top: "calc(50% + 12px)" }}
          />
          <CursorBadge
            label="Photographer"
            color="#4dd5ff"
            side="right"
            cursor={<PhotographerCursor />}
            style={{ right: "-80px", top: "calc(100% + 8px)" }}
          />

          <p
            className="text-center text-white max-w-[720px]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(18px, 2vw, 24px)",
              lineHeight: "1.2",
              letterSpacing: "-0.03em",
            }}
          >
            Get approved with fewer rounds of reviews. Get back to creating.
          </p>

          <div className="flex items-center gap-[17px]">
            <a
              href="/demo"
              className="flex items-center justify-center rounded-[32px] bg-white/[0.08] px-6 py-3 text-white transition-colors hover:bg-white/[0.14]"
              style={{ fontFamily: "var(--font-poppins)", fontSize: 18, fontWeight: 500, lineHeight: "1.5em" }}
            >
              Try Demo
            </a>
            <a
              href="https://app.usesuperflow.com/signup?returnUrl=%2Fhome%3F_gl%3D1*16r2jus*_gcl_au*MzgzMzk1NDk4LjE3NzkxMjUzNjU."
              rel="noopener"
              className="flex items-center justify-center rounded-[32px] bg-white px-6 py-3 text-black transition-colors hover:bg-white/90"
              style={{ fontFamily: "var(--font-poppins)", fontSize: 18, fontWeight: 500, lineHeight: "1.5em" }}
            >
              Try Now For Free
            </a>
          </div>
        </div>

        <div className="marquee-viewport w-full overflow-hidden" style={{ height: 60 }}>
          <div
            className="marquee-track items-center"
            style={{ ["--marquee-duration" as string]: "12s", gap: 10, padding: "10px 0" }}
          >
            {track.map((p, i) => (
              <MarqueePill key={`${p.label}-${i}`} icon={p.icon} label={p.label} href={p.href} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
