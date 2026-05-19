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

function DeveloperCursor() {
  return (
    <svg width="27" height="30" viewBox="0 0 27 30" aria-hidden>
      <g transform="translate(2.955 1.792)">
        <path
          d="M 17.842 22.858 L 21.797 2.973 C 22.089 1.501 20.515 0.368 19.212 1.112 L 1.758 11.086 C 0.398 11.863 0.665 13.899 2.179 14.298 L 9.622 16.261 C 10.054 16.375 10.427 16.65 10.663 17.03 L 14.639 23.439 C 15.476 24.788 17.533 24.415 17.842 22.858 Z"
          fill="rgb(77,213,255)"
        />
        <path
          d="M 22.655 3.144 L 18.7 23.028 C 18.236 25.364 15.151 25.924 13.895 23.9 L 9.919 17.492 C 9.801 17.302 9.615 17.164 9.399 17.107 L 1.956 15.144 C -0.315 14.545 -0.716 11.492 1.323 10.327 L 18.778 0.353 C 20.732 -0.764 23.094 0.936 22.655 3.144 Z"
          fill="transparent"
          stroke="#fff"
          strokeWidth="1.75"
          strokeLinecap="square"
          strokeMiterlimit="10"
        />
      </g>
    </svg>
  );
}

function DesignerCursor() {
  return (
    <svg width="27" height="30" viewBox="0 0 27 30" aria-hidden>
      <g transform="translate(0.837 1.792)">
        <path
          d="M 4.866 22.858 L 0.911 2.973 C 0.619 1.501 2.193 0.368 3.496 1.112 L 20.95 11.086 C 22.31 11.863 22.043 13.899 20.529 14.298 L 13.086 16.261 C 12.654 16.375 12.281 16.65 12.045 17.03 L 8.069 23.439 C 7.232 24.788 5.175 24.415 4.866 22.858 Z"
          fill="rgb(252,108,186)"
        />
        <path
          d="M 0.053 3.144 L 4.008 23.028 C 4.472 25.364 7.557 25.924 8.813 23.9 L 12.789 17.492 C 12.907 17.302 13.093 17.164 13.309 17.107 L 20.752 15.144 C 23.023 14.545 23.424 11.492 21.385 10.327 L 3.93 0.353 C 1.976 -0.764 -0.386 0.936 0.053 3.144 Z"
          fill="transparent"
          stroke="#fff"
          strokeWidth="1.75"
          strokeLinecap="square"
          strokeMiterlimit="10"
        />
      </g>
    </svg>
  );
}

function CursorBadge({
  label,
  color,
  side,
  cursor,
}: {
  label: string;
  color: string;
  side: "left" | "right";
  cursor: React.ReactNode;
}) {
  // Cursor sits above-and-outside, pill hangs below at -16 inset on the inner side.
  const pillSide = side === "left" ? { left: 16 } : { right: 16 };
  const cursorSide = side === "left" ? { left: 0 } : { right: 0 };
  return (
    <div
      className="pointer-events-none absolute hidden lg:block"
      style={
        side === "left"
          ? { left: "-160px", top: "calc(50% + 12px)" }
          : { right: "-160px", top: "calc(50% + 12px)" }
      }
    >
      <div className="relative h-[57px] w-[107px]">
        <div className="absolute top-0 h-[30px] w-[27px]" style={cursorSide as React.CSSProperties}>
          {cursor}
        </div>
        <div
          className="absolute bottom-0 flex items-center rounded-[29px] px-[9px] pt-[4px] pb-[5px]"
          style={{ background: color, ...(pillSide as React.CSSProperties) }}
        >
          <span
            className="font-semibold text-black text-center"
            style={{ fontFamily: "var(--font-urbanist)", fontSize: 16, lineHeight: "19.2px" }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
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
            cursor={<DeveloperCursor />}
          />
          <CursorBadge
            label="Designer"
            color="#fc6cba"
            side="right"
            cursor={<DesignerCursor />}
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
              href="https://app.usesuperflow.com/"
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
