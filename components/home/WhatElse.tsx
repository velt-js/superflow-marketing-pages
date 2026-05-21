type Feature = {
  icon: React.ReactNode;
  lines: string[];
};

const ICON = "/images/sections/what-else";

function FigmaIcon({ src, alt }: { src: string; alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={32} height={32} className="block" />;
}

// Pin Comment — grey outline asymmetric pin shape (CSS only, no asset in Figma).
function PinComment() {
  return (
    <div
      className="bg-white rounded-tl-[30px] rounded-tr-[30px] rounded-br-[30px]"
      style={{
        width: 22,
        height: 22,
        border: "2px solid #b1b5c3",
      }}
    />
  );
}

// Flock Mode — exact inline SVG from live site (green stroke), no Figma asset.
function FlockMode() {
  return (
    <svg width="32" height="32" viewBox="0 0 26 26" fill="none" stroke="rgb(13,207,130)" strokeWidth="2.44" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 4.706 3.182 L 7.119 21.228 L 11.415 14.802 L 19.127 14.295 Z" />
      <path d="M 11.714 15.313 L 15.915 22.591" />
      <path d="M 14.083 1.806 L 17.694 1.806" />
      <path d="M 16.972 6.139 L 23.472 6.139" />
    </svg>
  );
}

const FEATURES: Feature[] = [
  { icon: <PinComment />, lines: ["Pin Comment"] },
  { icon: <FigmaIcon src={`${ICON}/mood-smile.svg`} alt="" />, lines: ["Guest Mode"] },
  { icon: <FigmaIcon src={`${ICON}/at.svg`} alt="" />, lines: ["Mentions"] },
  { icon: <FigmaIcon src={`${ICON}/checks.svg`} alt="" />, lines: ["Approvals"] },
  { icon: <FigmaIcon src={`${ICON}/sparkles.svg`} alt="" />, lines: ["AI Copilot"] },
  { icon: <FigmaIcon src={`${ICON}/layout-kanban.svg`} alt="" />, lines: ["In-built", "Task Manager"] },
  { icon: <FlockMode />, lines: ["Flock Mode"] },
  { icon: <FigmaIcon src={`${ICON}/bell-ringing.svg`} alt="" />, lines: ["Email & Slack", "Notifications"] },
];

function Chip({ feature }: { feature: Feature }) {
  return (
    <div className="flex flex-col items-center gap-[24px] w-[153px] shrink-0">
      <div className="w-[32px] h-[32px] flex items-center justify-center">{feature.icon}</div>
      <div className="flex flex-col items-center">
        {feature.lines.map((line) => (
          <span
            key={line}
            className="text-[16px] leading-[24px] text-center whitespace-nowrap"
            style={{
              color: "rgb(87,86,98)",
              fontFamily: "var(--font-poppins)",
              fontWeight: 500,
              letterSpacing: "-0.03em",
            }}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function WhatElse() {
  const items = [...FEATURES, ...FEATURES, ...FEATURES, ...FEATURES];
  return (
    <section className="bg-white py-[80px] flex flex-col items-center gap-[80px]">
      <h2
        className="text-center font-semibold"
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: "clamp(32px, 5vw, 52px)",
          lineHeight: "67.6px",
          letterSpacing: "-1.56px",
        }}
      >
        <span style={{ color: "#23222b" }}>What else can</span>
        <br />
        <span
          style={{
            backgroundImage:
              "linear-gradient(90deg, #6941ff 0%, #b450bc 25%, #ff5e79 50%, #ff7f46 75%, #ffa013 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Superflow do?
        </span>
      </h2>

      <div className="marquee-viewport w-full">
        <div className="marquee-track gap-[20px]" style={{ ["--marquee-duration" as string]: "24s" }}>
          {items.map((f, i) => (
            <Chip key={`${f.lines.join("-")}-${i}`} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
