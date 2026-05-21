import Image from "next/image";

import { Cursor } from "@/components/shared/Cursor";

const IMG = "/images/sections/featurecards";

type CursorDef = {
  label: string;
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

/**
 * Per-feature override fed by Sanity. Only the editorial bits swap; the
 * 4 gradient backgrounds, cursor labels/colors, tag icon, and footer
 * variant are visual chrome and stay hard-coded per Figma 18:3443.
 */
export type FeatureCardOverride = {
  titleLine1: string;
  titleLine2?: string;
  subtitle: string;
  imageSrc: string;
};

export type IntegrationLogoOverride = {
  name: string;
  logoSrc: string;
  href?: string;
};

export type FeatureCardsProps = {
  /** Accepted for backwards compat but NOT rendered — Figma 18:3443 has no
   *  above-cards section heading. Kept in the Sanity schema so editors can
   *  re-add later without a migration. */
  eyebrow?: string;
  heading?: string;
  /** Length-4 override; index aligns with the 4 fixed card slots. */
  cards?: FeatureCardOverride[];
  integrationLogos?: IntegrationLogoOverride[];
  integrationsCtaLabel?: string;
  integrationsCtaHref?: string;
  /** Replaces the default slot-0 card with a custom node. Used on
   *  /website-review to mount the interactive tabbed WebsiteFirstCard. */
  firstCardOverride?: React.ReactNode;
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

/**
 * Renders one of the two card cursors. `side` is the side of the CARD the
 * badge is anchored to; visually the cursor inside the badge mirrors that
 * (anchored on left → cursor on right of badge → direction="right", etc.).
 */
function CardCursor({
  label,
  color,
  textWhite,
  side,
  offset,
  top,
}: CursorDef & { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <Cursor
      text={label}
      color={color}
      textColor={textWhite ? "#fff" : "#000"}
      direction={isLeft ? "right" : "left"}
      className="hidden lg:block"
      style={{
        position: "absolute",
        top,
        ...(isLeft ? { left: offset } : { right: offset }),
      }}
    />
  );
}

function HeroBlock({ hero }: { hero: HeroDef }) {
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

const DEFAULT_INTEGRATION_LOGOS: IntegrationLogoOverride[] = [
  { name: "Monday.com", logoSrc: `${IMG}/monday.png` },
  { name: "ClickUp", logoSrc: `${IMG}/clickup.png` },
  { name: "Slack", logoSrc: `${IMG}/slack.png` },
  { name: "Asana", logoSrc: `${IMG}/asana.png` },
];

function ViewIntegrationsLink({
  label,
  href,
  dim = false,
}: {
  label: string;
  href: string;
  dim?: boolean;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-[10px] uppercase font-semibold text-[12px] tracking-[1.8px] leading-[14.4px]"
      style={{
        color: dim ? "rgba(0,0,0,0.52)" : "#111",
        fontFamily: "var(--font-urbanist)",
      }}
    >
      {label}
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 6l6 6l-6 6" />
      </svg>
    </a>
  );
}

function IntegrationsIconRow({
  logos,
  ctaLabel,
  ctaHref,
}: {
  logos: IntegrationLogoOverride[];
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[60px] flex flex-col items-center gap-[24px]">
      <div className="flex gap-[16px] items-center opacity-50">
        {logos.map((b) => (
          <div key={b.name} className="w-[60px] h-[60px] rounded-[80px] border border-black/[0.16] flex items-center justify-center bg-white/0">
            <Image src={b.logoSrc} alt={b.name} width={28} height={28} className="object-contain" />
          </div>
        ))}
      </div>
      <ViewIntegrationsLink label={ctaLabel} href={ctaHref} dim />
    </div>
  );
}

function IntegrationsPillRow({
  logos,
  ctaLabel,
  ctaHref,
}: {
  logos: IntegrationLogoOverride[];
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[60px] flex flex-col items-center gap-[24px] max-w-[600px] w-full px-6">
      <div className="flex flex-wrap items-center justify-center gap-[12px] w-full">
        {logos.map((b) => (
          <div
            key={b.name}
            className="bg-white rounded-[32px] flex items-center gap-[6px] pl-[8px] pr-[12px] py-[8px]"
          >
            <div className="w-[32px] h-[32px] rounded-[24px] overflow-hidden border-2 border-white">
              <Image src={b.logoSrc} alt={b.name} width={32} height={32} className="w-full h-full object-cover" />
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
      <ViewIntegrationsLink label={ctaLabel} href={ctaHref} />
    </div>
  );
}

// Card visual chrome — fixed per Figma 18:3443. Heights mirror the Figma
// frame heights; cursor labels/colors mirror nodes 18:3465/18:3491 (C1),
// 18:3535/18:3521 (C2), 18:3652/18:3638 (C3), 18:3702/18:3688 (C4).
const CARD_CHROME: Omit<CardDef, "titleLines" | "subtitle" | "hero">[] = [
  {
    bgGradient: "linear-gradient(106deg, rgb(196,240,255) 0%, rgb(175,192,255) 100%)",
    height: 832,
    tagIcon: <CommentIcon />,
    subtitleLeading: 36,
    leftCursor: { label: "Designer", color: "#4dd5ff", offset: 204, top: 336 },
    rightCursor: { label: "Photographer", color: "#3772ff", textWhite: true, offset: 174, top: 393 },
  },
  {
    bgGradient: "linear-gradient(109deg, rgb(255,224,242) 0%, rgb(248,183,224) 100%)",
    height: 852,
    tagIcon: <PrioritizeIcon />,
    subtitleLeading: 30,
    leftCursor: { label: "Manager", color: "#ff62a4", textWhite: true, offset: 204, top: 367 },
    rightCursor: { label: "Team Lead", color: "#ffcd2e", offset: 174, top: 329 },
    footer: "integrations-icons",
  },
  {
    bgGradient: "linear-gradient(109deg, rgb(235,230,255) 0%, rgb(162,139,255) 100%)",
    height: 780,
    tagIcon: <ApproveIcon />,
    subtitleLeading: 30,
    leftCursor: { label: "Client", color: "#b1ff4d", offset: 204, top: 315 },
    rightCursor: { label: "Designer", color: "#ff62a4", offset: 174, top: 367 },
  },
  {
    bgGradient: "linear-gradient(106deg, rgb(255,238,178) 0%, rgb(255,201,97) 100%)",
    height: 792,
    tagIcon: <IntegrateIcon />,
    subtitleLeading: 30,
    leftCursor: { label: "Manager", color: "#ff9e2c", offset: 204, top: 326 },
    rightCursor: { label: "Team Lead", color: "#ffcd2e", offset: 174, top: 380 },
    footer: "integrations-pills",
  },
];

// Hero positioning per card slot — must match the chrome above 1:1.
// Sizes lifted from Figma 18:3443 child group bounding boxes.
const CARD_HERO_LAYOUT: Omit<HeroDef, "src">[] = [
  // C1: dashed-rect + comment-card composite (group 25:235, 680×243).
  { w: 736, h: 267, top: 460 },
  // C2: comment card (mask group 25:300, 480×251) centered.
  { w: 488, h: 259, top: 374 },
  // C3: approval card (mask group 25:379, 708×366) centered, flush to bottom.
  { w: 708, h: 366, bottom: 0 },
  // C4: small comment bubble (400×65) above the pills row.
  { w: 400, h: 65, top: 412 },
];

const DEFAULT_CARDS: FeatureCardOverride[] = [
  {
    titleLine1: "Review pixels",
    titleLine2: "with precision",
    subtitle: "Comment directly on elements for clearer feedback",
    imageSrc: "/images/review/featurecards/c1-hero.png",
  },
  {
    titleLine1: "Manage, prioritize",
    titleLine2: "& assign",
    subtitle: "Use our built-in task manager or integrate your own.",
    imageSrc: "/images/review/featurecards/c2-hero.png",
  },
  {
    titleLine1: "Get approvals",
    titleLine2: "at hyper speed",
    subtitle: "Built-in approvals for less back-and-forth-ing.",
    imageSrc: "/images/review/featurecards/c3-hero.png",
  },
  {
    titleLine1: "Sync with",
    titleLine2: "your tools",
    subtitle: "Seamlessly integrate your Slack or favorite task manager",
    imageSrc: "/images/review/featurecards/c4-hero.png",
  },
];

function Card(c: CardDef & {
  integrationLogos: IntegrationLogoOverride[];
  integrationsCtaLabel: string;
  integrationsCtaHref: string;
}) {
  return (
    <div className="w-full flex justify-center px-[24px] lg:px-[52px] py-[26px]">
      <div
        className="relative w-full max-w-[1436px] rounded-[40px] lg:rounded-[48px] overflow-hidden"
        style={{ background: c.bgGradient }}
      >
        <div className="hidden lg:block" style={{ height: c.height }} aria-hidden />

        <TagPill icon={c.tagIcon} />

        <div className="lg:absolute lg:left-0 lg:right-0 lg:top-[120px] flex flex-col items-center gap-[16px] pt-[96px] lg:pt-0 px-6 text-center">
          <h3
            className="font-bold tracking-[-1.8px] text-[#111]"
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(36px, 5vw, 60px)",
              lineHeight: "72px",
            }}
          >
            {c.titleLines[0]}
            {c.titleLines[1] ? (
              <>
                <br />
                {c.titleLines[1]}
              </>
            ) : null}
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

        <CardCursor {...c.leftCursor} side="left" />
        <CardCursor {...c.rightCursor} side="right" />

        <HeroBlock hero={c.hero} />
        <HeroMobile hero={c.hero} />

        {c.footer === "integrations-icons" && (
          <IntegrationsIconRow
            logos={c.integrationLogos}
            ctaLabel={c.integrationsCtaLabel}
            ctaHref={c.integrationsCtaHref}
          />
        )}
        {c.footer === "integrations-pills" && (
          <IntegrationsPillRow
            logos={c.integrationLogos}
            ctaLabel={c.integrationsCtaLabel}
            ctaHref={c.integrationsCtaHref}
          />
        )}

        <div className="lg:hidden h-[80px]" aria-hidden />
      </div>
    </div>
  );
}

export default function FeatureCards({
  // eyebrow + heading deliberately ignored — Figma 18:3443 has no above-cards heading.
  cards,
  integrationLogos,
  integrationsCtaLabel = "View Integrations",
  integrationsCtaHref = "#integrations",
  firstCardOverride,
}: FeatureCardsProps = {}) {
  const source = cards && cards.length === 4 ? cards : DEFAULT_CARDS;
  const logos = integrationLogos && integrationLogos.length > 0 ? integrationLogos : DEFAULT_INTEGRATION_LOGOS;

  return (
    <section className="bg-white">
      {source.map((override, i) => {
        if (i === 0 && firstCardOverride) {
          return <div key="first-card-override">{firstCardOverride}</div>;
        }
        const chrome = CARD_CHROME[i];
        const heroLayout = CARD_HERO_LAYOUT[i];
        const card: CardDef & {
          integrationLogos: IntegrationLogoOverride[];
          integrationsCtaLabel: string;
          integrationsCtaHref: string;
        } = {
          ...chrome,
          titleLines: [override.titleLine1, override.titleLine2 ?? ""],
          subtitle: override.subtitle,
          hero: { ...heroLayout, src: override.imageSrc },
          integrationLogos: logos,
          integrationsCtaLabel,
          integrationsCtaHref,
        };
        return <Card key={`${override.titleLine1}-${i}`} {...card} />;
      })}
    </section>
  );
}
