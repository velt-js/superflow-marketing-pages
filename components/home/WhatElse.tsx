type Feature = {
  icon: React.ReactNode;
  lines: string[];
};

// Tabler-style outline icon with per-icon stroke color.
function TablerIcon({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

// Pin Comment — grey outline asymmetric pin shape (Figma node 17:3945 uses CSS, live site shows grey).
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

function MoodSmile() {
  return (
    <TablerIcon color="#4dd5ff">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10h.01M15 10h.01" />
      <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
    </TablerIcon>
  );
}

function At() {
  return (
    <TablerIcon color="#ffcd2e">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-5.5 8.3" />
    </TablerIcon>
  );
}

function Checks() {
  return (
    <TablerIcon color="#0dcf82">
      <path d="M7 12l5 5L22 7" />
      <path d="M2 12l5 5" />
    </TablerIcon>
  );
}

function Sparkles() {
  return (
    <TablerIcon color="#625df5">
      <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />
      <path d="M19 17l.8 1.8 1.8.8-1.8.8L19 22.2l-.8-1.8-1.8-.8 1.8-.8L19 17z" />
      <path d="M5 17l.7 1.5 1.5.7-1.5.7L5 21.4l-.7-1.5L2.8 19.2l1.5-.7L5 17z" />
    </TablerIcon>
  );
}

function LayoutKanban() {
  return (
    <TablerIcon color="#ff7162">
      <rect x="4" y="4" width="6" height="16" rx="1" />
      <rect x="14" y="4" width="6" height="10" rx="1" />
    </TablerIcon>
  );
}

// Flock Mode — exact inline SVG path from live site (green stroke).
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

function BellRinging() {
  return (
    <TablerIcon color="#ff5e79">
      <path d="M10 5a2 2 0 1 1 4 0" />
      <path d="M5 18h14l-1.5-2V12a5.5 5.5 0 1 0-11 0v4l-1.5 2z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
      <path d="M21 6l-1.5 1.5M3 6l1.5 1.5" />
    </TablerIcon>
  );
}

const FEATURES: Feature[] = [
  { icon: <PinComment />, lines: ["Pin Comment"] },
  { icon: <MoodSmile />, lines: ["Guest Mode"] },
  { icon: <At />, lines: ["Mentions"] },
  { icon: <Checks />, lines: ["Approvals"] },
  { icon: <Sparkles />, lines: ["AI Copilot"] },
  { icon: <LayoutKanban />, lines: ["In-built", "Task Manager"] },
  { icon: <FlockMode />, lines: ["Flock Mode"] },
  { icon: <BellRinging />, lines: ["Email & Slack", "Notifications"] },
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
        <div className="marquee-track gap-[20px]" style={{ ["--marquee-duration" as string]: "12s" }}>
          {items.map((f, i) => (
            <Chip key={`${f.lines.join("-")}-${i}`} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
