import Image from "next/image";

const IMG = "/images/sections/featurecards";

type CursorDef = {
  color: string;
  textWhite?: boolean;
  /** left/right offset in px (from the relevant side of the card) */
  offset: number;
  /** top offset in px */
  top: number;
};

type HeroDef = {
  src: string;
  w: number;
  h: number;
  /** absolute top in px (for top-anchored), or undefined to anchor bottom */
  top?: number;
  bottom?: number;
  /** if undefined, image is centered horizontally */
  left?: number;
};

type CardDef = {
  bgGradient: string;
  height: number;
  tagIcon: React.ReactNode;
  titleLines: [string, string];
  subtitle: string;
  subtitleLeading: number;
  hero: HeroDef;
  leftCursor: CursorDef;
  rightCursor: CursorDef;
  footer?: "integrations-icons" | "integrations-pills";
};

// Tag icons — simple Tabler-style SVGs to avoid extra binary downloads.
function CommentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
    </svg>
  );
}
function PrioritizeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l0 4" /><path d="M6 12l0 8" /><path d="M12 4l0 12" /><path d="M12 18l0 2" /><path d="M18 4l0 6" /><path d="M18 14l0 6" /><path d="M4 8l4 0" /><path d="M10 16l4 0" /><path d="M16 10l4 0" />
    </svg>
  );
}
function ApproveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5l10 -10" />
    </svg>
  );
}
function IntegrateIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 15l-4.5 4.5" /><path d="M14.5 4l5.5 5.5" /><path d="M3 13l4 4l11 -11l-4 -4z" /><path d="M14 7l3 3" />
    </svg>
  );
}

function TagPill({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="absolute left-[24px] lg:left-[52px] top-[24px] lg:top-[52px] flex items-center justify-center rounded-[52px] bg-black/[0.08] w-[52px] h-[52px]">
      {icon}
    </div>
  );
}

function CursorTag({
  color,
  textWhite,
  side,
  offset,
  top,
}: CursorDef & { side: "left" | "right" }) {
  const isLeft = side === "left";
  // Left badge: pointer at top-right, chip below extending left (Medium/Right).
  // Right badge: pointer at top-left, chip below extending right (Medium/Left).
  return (
    <div
      className="hidden lg:block absolute"
      style={
        {
          top,
          [isLeft ? "left" : "right"]: offset,
        } as React.CSSProperties
      }
    >
      <div className="relative h-[78px] w-[159px]">
        <div
          className="absolute top-0 h-[30px] w-[28px]"
          style={{ [isLeft ? "right" : "left"]: 0 } as React.CSSProperties}
        >
          <svg
            viewBox="0 0 27 30"
            width="27"
            height="30"
            fill={color}
            style={{ transform: isLeft ? undefined : "scaleX(-1)" }}
          >
            <path d="M2 2l12 28 4-12 12-4z" />
          </svg>
        </div>
        <div
          className="absolute top-[27px] flex items-start rounded-[29px] pt-[7px] pb-[8px] px-4 whitespace-nowrap"
          style={
            {
              background: color,
              [isLeft ? "right" : "left"]: "21px",
            } as React.CSSProperties
          }
        >
          <span
            className="font-semibold text-[18px] leading-[21.6px]"
            style={{ fontFamily: "var(--font-urbanist)", color: textWhite ? "#fff" : "#000" }}
          >
            Developer
          </span>
        </div>
      </div>
    </div>
  );
}

function Hero({ hero }: { hero: HeroDef }) {
  const style: React.CSSProperties = {
    position: "absolute",
    width: hero.w,
    height: hero.h,
    maxWidth: "calc(100% - 48px)",
  };
  if (hero.left !== undefined) {
    style.left = hero.left;
  } else {
    style.left = "50%";
    style.transform = "translateX(-50%)";
  }
  if (hero.top !== undefined) {
    style.top = hero.top;
  } else if (hero.bottom !== undefined) {
    style.bottom = hero.bottom;
  }
  return (
    <div style={style} className="hidden lg:block">
      <Image src={hero.src} alt="" width={hero.w} height={hero.h} className="w-full h-full object-contain" />
    </div>
  );
}

function HeroMobile({ hero }: { hero: HeroDef }) {
  return (
    <div className="lg:hidden mt-8 px-6">
      <Image src={hero.src} alt="" width={hero.w} height={hero.h} className="w-full h-auto object-contain" />
    </div>
  );
}

const INTEGRATION_BRANDS = [
  { name: "Monday.com", logo: `${IMG}/monday.png` },
  { name: "ClickUp", logo: `${IMG}/clickup.png` },
  { name: "Slack", logo: `${IMG}/slack.png` },
  { name: "Asana", logo: `${IMG}/asana.png` },
];

function ViewIntegrationsLink({ dim = false }: { dim?: boolean }) {
  return (
    <a
      href="#integrations"
      className="flex items-center gap-[10px] uppercase font-semibold text-[12px] tracking-[1.8px] leading-[14.4px]"
      style={{
        color: dim ? "rgba(0,0,0,0.52)" : "#111",
        fontFamily: "var(--font-urbanist)",
      }}
    >
      View Integrations
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6l-6 6" />
      </svg>
    </a>
  );
}

function IntegrationsIconRow() {
  // C2: dim row of brand icons (only the brand logos, no name).
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[60px] flex flex-col items-center gap-[24px]">
      <div className="flex gap-[16px] items-center opacity-50">
        {INTEGRATION_BRANDS.map((b) => (
          <div key={b.name} className="w-[60px] h-[60px] rounded-[80px] border border-black/[0.16] flex items-center justify-center bg-white/0">
            <Image src={b.logo} alt={b.name} width={28} height={28} className="object-contain" />
          </div>
        ))}
      </div>
      <ViewIntegrationsLink dim />
    </div>
  );
}

function IntegrationsPillRow() {
  // C4: white rounded pill chips with brand logo + name.
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[60px] flex flex-col items-center gap-[24px] max-w-[600px] w-full px-6">
      <div className="flex flex-wrap items-center justify-center gap-[12px] w-full">
        {INTEGRATION_BRANDS.map((b) => (
          <div
            key={b.name}
            className="bg-white rounded-[32px] flex items-center gap-[6px] pl-[8px] pr-[12px] py-[8px]"
          >
            <div className="w-[32px] h-[32px] rounded-[24px] overflow-hidden border-2 border-white">
              <Image src={b.logo} alt={b.name} width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <span
              className="text-[16px] leading-[22.4px]"
              style={{ color: "#636363", fontFamily: "var(--font-poppins)", fontWeight: 500 }}
            >
              {b.name}
            </span>
          </div>
        ))}
      </div>
      <ViewIntegrationsLink />
    </div>
  );
}

const CARDS: CardDef[] = [
  {
    bgGradient:
      "linear-gradient(106deg, rgb(196,240,255) 0%, rgb(175,192,255) 100%)",
    height: 820,
    tagIcon: <CommentIcon />,
    titleLines: ["Review creative assets", "with precision"],
    subtitle: "Comment directly on assets for clearer feedback",
    subtitleLeading: 36,
    hero: { src: `${IMG}/card1-asset-review.png`, w: 696, h: 340, bottom: 110 },
    // Figma: Left Cursor at inset left=14.23% (~204px from left edge of 1436), top=336
    leftCursor: { color: "#4dd5ff", offset: 204, top: 336 },
    // Right Cursor: left=1046 in a 1436-wide card → right offset = 1436-1046-216 ≈ 174
    rightCursor: { color: "#3772ff", textWhite: true, offset: 174, top: 393 },
  },
  {
    bgGradient:
      "linear-gradient(109deg, rgb(248,255,178) 0%, rgb(255,201,97) 100%)",
    height: 880,
    tagIcon: <PrioritizeIcon />,
    titleLines: ["Manage, prioritize", "& assign"],
    subtitle: "Use our built-in task manager or integrate your own.",
    subtitleLeading: 30,
    hero: { src: `${IMG}/card2-task-card.png`, w: 502, h: 273, top: 374, left: 467 },
    leftCursor: { color: "#ff62a4", textWhite: true, offset: 204, top: 367 },
    rightCursor: { color: "#ffcd2e", offset: 174, top: 329 },
    footer: "integrations-icons",
  },
  {
    bgGradient:
      "linear-gradient(109deg, rgb(235,230,255) 0%, rgb(162,139,255) 100%)",
    height: 780,
    tagIcon: <ApproveIcon />,
    titleLines: ["Get approvals", "at hyper speed"],
    subtitle: "Built-in approvals for less back-and-forth-ing",
    subtitleLeading: 30,
    hero: { src: `${IMG}/card3-approval.png`, w: 833, h: 392, bottom: 0 },
    leftCursor: { color: "#b1ff4d", offset: 204, top: 315 },
    rightCursor: { color: "#ff62a4", offset: 174, top: 367 },
  },
  {
    bgGradient:
      "linear-gradient(106deg, rgb(255,206,196) 0%, rgb(255,189,175) 100%)",
    height: 800,
    tagIcon: <IntegrateIcon />,
    titleLines: ["Sync with", "your tools"],
    subtitle: "Seamlessly integrate your Slack or favorite task manager",
    subtitleLeading: 30,
    hero: { src: `${IMG}/card4-chat-bubble.png`, w: 400, h: 64, top: 422 },
    leftCursor: { color: "#ff9e2c", offset: 204, top: 326 },
    rightCursor: { color: "#ffcd2e", offset: 174, top: 380 },
    footer: "integrations-pills",
  },
];

function Card(c: CardDef) {
  return (
    <div className="w-full flex justify-center px-[24px] lg:px-[52px] py-[26px]">
      <div
        className="relative w-full max-w-[1436px] rounded-[40px] lg:rounded-[80px] overflow-hidden"
        style={{ background: c.bgGradient }}
      >
        {/* Desktop fixed height; mobile auto */}
        <div className="hidden lg:block" style={{ height: c.height }} aria-hidden />

        <TagPill icon={c.tagIcon} />

        <div className="lg:absolute lg:left-0 lg:right-0 lg:top-[120px] flex flex-col items-center gap-[16px] pt-[96px] lg:pt-0 px-6 text-center">
          <h3
            className="font-semibold tracking-[-1.8px] text-[#111]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(36px, 5vw, 60px)",
              lineHeight: "72px",
            }}
          >
            {c.titleLines[0]}
            <br />
            {c.titleLines[1]}
          </h3>
          <p
            className="text-center"
            style={{
              color: "rgba(17,17,17,0.8)",
              fontFamily: "var(--font-poppins)",
              fontSize: 20,
              lineHeight: `${c.subtitleLeading}px`,
            }}
          >
            {c.subtitle}
          </p>
        </div>

        <CursorTag {...c.leftCursor} side="left" />
        <CursorTag {...c.rightCursor} side="right" />

        <Hero hero={c.hero} />
        <HeroMobile hero={c.hero} />

        {c.footer === "integrations-icons" && <IntegrationsIconRow />}
        {c.footer === "integrations-pills" && <IntegrationsPillRow />}

        {/* Mobile bottom padding so absolute footer doesn't clip */}
        <div className="lg:hidden h-[80px]" aria-hidden />
      </div>
    </div>
  );
}

export default function FeatureCards() {
  return (
    <section className="bg-white">
      {CARDS.map((c) => (
        <Card key={c.titleLines[0]} {...c} />
      ))}
    </section>
  );
}
