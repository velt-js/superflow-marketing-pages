import Image from "next/image";

import { Cursor } from "@/components/shared/Cursor";
import WebsiteFirstCard from "@/components/review/WebsiteFirstCard";
import { toInternalHref } from "@/lib/links";

const IMG = "/images/sections/featurecards";

// Gradient palette cycles by card index. >4 cards wrap back to slot 0.
const GRADIENTS = [
  "linear-gradient(100deg, #C4F0FF 0%, #AFC0FF 100%)",
  "linear-gradient(99deg, #F8E6FF 0%, #EDA1E0 100%)",
  "linear-gradient(101deg, #EBE6FF 0%, #A28BFF 100%)",
  "linear-gradient(109deg, #F9FFB3 0%, #FFC962 100%)",
] as const;

export type FeatureCardType =
  | "simple"
  | "integrationIcons"
  | "integrationPills"
  | "websiteTabs";

export type FeatureCardIconType =
  | "comment"
  | "prioritize"
  | "approve"
  | "integrate";

export type FeatureCardTabVariant = {
  pillLabel: string;
  imageSrc: string;
};

export type FeatureCardCursor = {
  side: "left" | "right";
  label: string;
  color: string;
  textColor?: string;
  /** Vertical position as % of image height (0 = top edge, 100 = bottom). */
  topPct: number;
};

export type FeatureCardOverride = {
  type?: FeatureCardType;
  title: string;
  subtitle: string;
  imageSrc: string;
  iconType?: FeatureCardIconType;
  tabVariants?: FeatureCardTabVariant[];
  cursors?: FeatureCardCursor[];
  /** Optional aspect-ratio override for the image box, e.g. "740/350" or "7/1".
   *  Defaults to 740/350. */
  imageAspectRatio?: string;
  // Legacy fields kept so a Sanity payload still using the old shape doesn't
  // crash at runtime — `title` falls back to `${titleLine1}\n${titleLine2}`.
  titleLine1?: string;
  titleLine2?: string;
};

export type IntegrationLogoOverride = {
  name: string;
  logoSrc: string;
  href?: string;
};

export type FeatureCardsProps = {
  eyebrow?: string;
  heading?: string;
  cards?: FeatureCardOverride[];
  integrationLogos?: IntegrationLogoOverride[];
  integrationsCtaLabel?: string;
  integrationsCtaHref?: string;
};

const DEFAULT_INTEGRATION_LOGOS: IntegrationLogoOverride[] = [
  { name: "Asana", logoSrc: `${IMG}/asana.png`, href: "/integrations/asana" },
  { name: "ClickUp", logoSrc: `${IMG}/clickup.png`, href: "/integrations/clickup" },
  { name: "Monday.com", logoSrc: `${IMG}/monday.png`, href: "/integrations/monday" },
  { name: "Slack", logoSrc: `${IMG}/slack.png`, href: "/integrations/slack" },
];

// Default tag icon per slot index. Cycles for >4 cards.
const DEFAULT_ICON_BY_INDEX: FeatureCardIconType[] = [
  "comment",
  "prioritize",
  "approve",
  "integrate",
];

// Default card type per slot index — applied when a CMS payload omits
// `cardType`. Mirrors the historical 4-slot layout (review/manage/approve/sync).
const DEFAULT_TYPE_BY_INDEX: FeatureCardType[] = [
  "simple",
  "integrationIcons",
  "simple",
  "integrationPills",
];

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
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <g clipPath="url(#feature-card-integrate-clip)">
        <path
          d="M2.77783 17.2224L5.93783 14.0624M12.7085 2.77881L9.54855 5.93881M17.2221 7.29238L14.0621 10.4524M7.99997 4.58381L15.4164 11.9995L13.5621 13.8545C13.0795 14.3608 12.5005 14.7655 11.8592 15.0448C11.2179 15.324 10.5273 15.4722 9.82786 15.4806C9.12846 15.4889 8.43443 15.3574 7.78662 15.0936C7.13881 14.8298 6.5503 14.4391 6.05571 13.9445C5.56111 13.4499 5.17043 12.8614 4.90664 12.2136C4.64284 11.5658 4.51127 10.8718 4.51965 10.1723C4.52803 9.47294 4.67621 8.78227 4.95546 8.14097C5.2347 7.49967 5.63938 6.92069 6.14569 6.43809L8.00069 4.58381H7.99997Z"
          stroke="black"
          strokeWidth="1.42857"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="feature-card-integrate-clip">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

const TAG_ICON: Record<FeatureCardIconType, React.ReactNode> = {
  comment: <CommentIcon />,
  prioritize: <PrioritizeIcon />,
  approve: <ApproveIcon />,
  integrate: <IntegrateIcon />,
};

const TAG_LABEL: Record<FeatureCardIconType, string> = {
  comment: "Review",
  prioritize: "Prioritize",
  approve: "Approve",
  integrate: "Integrate",
};

function TagPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 lg:left-[52px] lg:translate-x-0 top-[24px] lg:top-[52px] inline-flex items-center rounded-full bg-black/[0.08] h-[40px] lg:h-[52px] px-[10px] lg:px-[16px] overflow-hidden transition-[gap] duration-300 ease-out gap-0 group-hover:gap-[8px] lg:group-hover:gap-[10px]">
      <span className="flex items-center justify-center w-[20px] h-[20px] flex-shrink-0">
        {icon}
      </span>
      <span
        className="overflow-hidden max-w-0 group-hover:max-w-[200px] whitespace-nowrap transition-[max-width] duration-300 ease-out font-semibold text-[14px] lg:text-[16px] text-[#111]"
        style={{ fontFamily: "var(--font-poppins)" }}
      >
        {label}
      </span>
    </div>
  );
}

function ChevronRight() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 6l6 6l-6 6" />
    </svg>
  );
}

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
      href={toInternalHref(href) ?? href}
      className="flex items-center gap-[10px] uppercase font-semibold text-[12px] tracking-[1.8px] leading-[14.4px]"
      style={{
        color: dim ? "rgba(0,0,0,0.52)" : "#111",
        fontFamily: "var(--font-urbanist)",
      }}
    >
      {label}
      <ChevronRight />
    </a>
  );
}

function AsanaIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M21.2906 14.7012C18.191 14.7012 15.6784 17.214 15.6784 20.3137C15.6784 23.4132 18.191 25.926 21.2906 25.926C24.3901 25.926 26.9027 23.4132 26.9027 20.3137C26.9027 17.214 24.3901 14.7012 21.2906 14.7012ZM6.70951 14.7017C3.61 14.7017 1.09729 17.214 1.09729 20.3137C1.09729 23.4132 3.61 25.926 6.70951 25.926C9.80916 25.926 12.322 23.4132 12.322 20.3137C12.322 17.214 9.80916 14.7017 6.70951 14.7017ZM19.6121 7.68582C19.6121 10.7856 17.0995 13.2985 14.0001 13.2985C10.9004 13.2985 8.3878 10.7856 8.3878 7.68582C8.3878 4.58667 10.9004 2.07373 14.0001 2.07373C17.0995 2.07373 19.6121 4.58667 19.6121 7.68582Z" fill="#111111" fillOpacity="0.52" />
    </svg>
  );
}
function ClickUpIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3.2478 20.9232L7.21539 17.8825C9.32391 20.6351 11.5636 21.9028 14.0571 21.9028C16.5376 21.9028 18.7128 20.6491 20.7267 17.9201L24.7523 20.8867C21.8471 24.822 18.2375 26.9026 14.0571 26.9026C9.89055 26.9026 6.24553 24.836 3.2478 20.9232ZM14.0431 7.7098L6.98099 13.7956L3.7166 10.0108L14.0592 1.09717L24.3201 10.0172L21.0407 13.7902L14.0431 7.7098Z" fill="#111111" fillOpacity="0.52" />
    </svg>
  );
}
function MondayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M4.30678 21.6973C3.73633 21.6986 3.17577 21.5484 2.68237 21.2621C2.18897 20.9758 1.78042 20.5636 1.49845 20.0677C1.22079 19.5753 1.08232 19.0167 1.09786 18.4516C1.1134 17.8866 1.28237 17.3364 1.58667 16.86L7.36996 7.77825C7.66596 7.29016 8.08621 6.88939 8.58778 6.61686C9.08936 6.34433 9.65428 6.20982 10.2249 6.22706C10.795 6.24072 11.3513 6.40561 11.8367 6.70487C12.3222 7.00412 12.7195 7.42698 12.9878 7.93019C13.527 8.94961 13.4596 10.1761 12.8139 11.133L7.03424 20.2148C6.74115 20.6715 6.3375 21.0468 5.86072 21.306C5.38394 21.5652 4.84944 21.6998 4.30678 21.6973Z" fill="#111111" fillOpacity="0.52" />
      <path d="M14.2267 21.6969C13.0603 21.6969 11.9869 21.0733 11.4233 20.071C11.1463 19.58 11.0081 19.0228 11.0236 18.4592C11.0392 17.8956 11.2078 17.3469 11.5115 16.8718L17.2838 7.81094C17.5754 7.31598 17.9942 6.90807 18.4966 6.62949C18.999 6.35092 19.5668 6.21183 20.1411 6.22666C21.3174 6.25239 22.3834 6.91036 22.9225 7.93959C23.4579 8.96882 23.3795 10.2027 22.7142 11.1572L16.9431 20.218C16.651 20.6728 16.249 21.0467 15.7742 21.3051C15.2995 21.5636 14.7673 21.6984 14.2267 21.6969Z" fill="#111111" fillOpacity="0.52" />
      <path d="M23.9257 21.7742C25.57 21.7742 26.9031 20.4691 26.9031 18.8593C26.9031 17.2494 25.57 15.9443 23.9257 15.9443C22.2813 15.9443 20.9482 17.2494 20.9482 18.8593C20.9482 20.4691 22.2813 21.7742 23.9257 21.7742Z" fill="#111111" fillOpacity="0.52" />
    </svg>
  );
}
function SlackIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M5.99674 17.6378C5.99674 19.2472 4.69595 20.548 3.08651 20.548C1.47706 20.548 0.17627 19.2472 0.17627 17.6378C0.17627 16.0283 1.47706 14.7275 3.08651 14.7275H5.99674V17.6378ZM7.45186 17.6378C7.45186 16.0283 8.75265 14.7275 10.3621 14.7275C11.9715 14.7275 13.2723 16.0283 13.2723 17.6378V24.9134C13.2723 26.5228 11.9715 27.8236 10.3621 27.8236C8.75265 27.8236 7.45186 26.5228 7.45186 24.9134V17.6378Z" fill="#111111" fillOpacity="0.52" />
      <path d="M10.3622 5.9528C8.75272 5.9528 7.45193 4.65201 7.45193 3.04256C7.45193 1.43311 8.75272 0.132324 10.3622 0.132324C11.9716 0.132324 13.2724 1.43311 13.2724 3.04256V5.9528H10.3622ZM10.3622 7.42996C11.9716 7.42996 13.2724 8.73075 13.2724 10.3402C13.2724 11.9496 11.9716 13.2504 10.3622 13.2504H3.06453C1.45508 13.2504 0.154297 11.9496 0.154297 10.3402C0.154297 8.73075 1.45508 7.42996 3.06453 7.42996H10.3622Z" fill="#111111" fillOpacity="0.52" />
      <path d="M22.0251 10.3402C22.0251 8.73075 23.3259 7.42996 24.9353 7.42996C26.5448 7.42996 27.8456 8.73075 27.8456 10.3402C27.8456 11.9496 26.5448 13.2504 24.9353 13.2504H22.0251V10.3402ZM20.57 10.3402C20.57 11.9496 19.2692 13.2504 17.6597 13.2504C16.0503 13.2504 14.7495 11.9496 14.7495 10.3402V3.04256C14.7495 1.43311 16.0503 0.132324 17.6597 0.132324C19.2692 0.132324 20.57 1.43311 20.57 3.04256V10.3402V10.3402Z" fill="#111111" fillOpacity="0.52" />
      <path d="M17.6597 22.0031C19.2692 22.0031 20.57 23.3039 20.57 24.9134C20.57 26.5228 19.2692 27.8236 17.6597 27.8236C16.0503 27.8236 14.7495 26.5228 14.7495 24.9134V22.0031H17.6597ZM17.6597 20.548C16.0503 20.548 14.7495 19.2472 14.7495 17.6378C14.7495 16.0283 16.0503 14.7275 17.6597 14.7275H24.9574C26.5668 14.7275 27.8676 16.0283 27.8676 17.6378C27.8676 19.2472 26.5668 20.548 24.9574 20.548H17.6597Z" fill="#111111" fillOpacity="0.52" />
    </svg>
  );
}

const INTEGRATION_INLINE_ICONS: Record<string, React.ReactNode> = {
  Asana: <AsanaIcon />,
  ClickUp: <ClickUpIcon />,
  "Monday.com": <MondayIcon />,
  Slack: <SlackIcon />,
};

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
    <div className="flex flex-col items-center gap-[40px] w-full">
      <div className="flex flex-wrap justify-center gap-[16px] items-center">
        {logos.map((b) => {
          const inline = INTEGRATION_INLINE_ICONS[b.name];
          return (
            <a
              key={b.name}
              href={toInternalHref(b.href) ?? "#"}
              aria-label={b.name}
              className="w-[60px] h-[60px] rounded-full border border-black/[0.16] flex items-center justify-center bg-white/0"
            >
              {inline ?? (
                <Image src={b.logoSrc} alt="" width={28} height={28} className="object-contain opacity-50" />
              )}
            </a>
          );
        })}
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
    <div className="flex flex-col items-center gap-[40px] max-w-[600px] w-full">
      <div className="flex flex-wrap items-center justify-center gap-[12px] w-full">
        {logos.map((b) => (
          <a
            key={b.name}
            href={toInternalHref(b.href) ?? "#"}
            aria-label={b.name}
            className="bg-white rounded-full flex items-center gap-[6px] pl-[8px] pr-[12px] py-[8px]"
          >
            <span className="w-[32px] h-[32px] rounded-full overflow-hidden border-2 border-white block">
              <Image src={b.logoSrc} alt="" width={32} height={32} className="w-full h-full object-cover" />
            </span>
            <span
              className="text-[16px] leading-[22.4px]"
              style={{ color: "#636363", fontFamily: "var(--font-poppins)", fontWeight: 500 }}
            >
              {b.name}
            </span>
          </a>
        ))}
      </div>
      <ViewIntegrationsLink label={ctaLabel} href={ctaHref} />
    </div>
  );
}

function resolveTitle(card: FeatureCardOverride): string {
  if (card.title) return card.title;
  const line1 = card.titleLine1 ?? "";
  const line2 = card.titleLine2 ?? "";
  return line2 ? `${line1}\n${line2}` : line1;
}

function Card({
  card,
  index,
  integrationLogos,
  integrationsCtaLabel,
  integrationsCtaHref,
}: {
  card: FeatureCardOverride;
  index: number;
  integrationLogos: IntegrationLogoOverride[];
  integrationsCtaLabel: string;
  integrationsCtaHref: string;
}) {
  const gradient = GRADIENTS[index % GRADIENTS.length];
  const iconKey = card.iconType ?? DEFAULT_ICON_BY_INDEX[index % DEFAULT_ICON_BY_INDEX.length];
  const tagIcon = TAG_ICON[iconKey];
  const title = resolveTitle(card);
  const type: FeatureCardType =
    card.type ?? DEFAULT_TYPE_BY_INDEX[index % DEFAULT_TYPE_BY_INDEX.length];
  const hasFooter = type === "integrationIcons" || type === "integrationPills";

  return (
    <div
      className={[
        "group relative w-full max-w-[1436px] mx-auto rounded-[32px] lg:rounded-[48px] overflow-hidden",
        "flex flex-col items-center text-center",
        "px-6 lg:px-12 pt-[88px] lg:pt-[120px]",
        "gap-8 lg:gap-12",
        hasFooter ? "pb-12 lg:pb-[60px]" : "pb-0",
      ].join(" ")}
      style={{ background: gradient }}
    >
      <TagPill icon={tagIcon} label={TAG_LABEL[iconKey]} />

      <div className="flex flex-col items-center gap-[16px] max-w-[820px]">
        <h3
          className="font-bold tracking-[-0.03em] text-[#111] whitespace-pre-line"
          style={{
            fontFamily: "var(--font-poppins)",
            fontSize: "clamp(32px, 5vw, 60px)",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: "rgba(17,17,17,0.8)",
            fontFamily: "var(--font-poppins)",
            fontSize: "clamp(16px, 1.6vw, 20px)",
            lineHeight: 1.5,
          }}
        >
          {card.subtitle}
        </p>
      </div>

      <div className="w-full flex justify-center">
        <div
          className="relative w-full max-w-[800px]"
          style={{ aspectRatio: (card.imageAspectRatio ?? "740/350").replace("/", " / ") }}
        >
          <Image
            src={card.imageSrc}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-contain"
          />
          {card.cursors?.map((cur, idx) => {
            const isLeft = cur.side === "left";
            return (
              <Cursor
                key={`cursor-${idx}-${cur.label}`}
                text={cur.label}
                color={cur.color}
                textColor={cur.textColor ?? "#000"}
                direction={isLeft ? "right" : "left"}
                className="hidden lg:block"
                style={{
                  position: "absolute",
                  top: `${cur.topPct}%`,
                  ...(isLeft
                    ? { right: "calc(100% + 32px)" }
                    : { left: "calc(100% + 32px)" }),
                }}
              />
            );
          })}
        </div>
      </div>

      {type === "integrationIcons" && (
        <IntegrationsIconRow
          logos={integrationLogos}
          ctaLabel={integrationsCtaLabel}
          ctaHref={integrationsCtaHref}
        />
      )}
      {type === "integrationPills" && (
        <IntegrationsPillRow
          logos={integrationLogos}
          ctaLabel={integrationsCtaLabel}
          ctaHref={integrationsCtaHref}
        />
      )}
    </div>
  );
}

export default function FeatureCards({
  cards,
  integrationLogos,
  integrationsCtaLabel = "View Integrations",
  integrationsCtaHref = "/integrations",
}: FeatureCardsProps = {}) {
  if (!cards || cards.length === 0) return null;
  const logos = integrationLogos && integrationLogos.length > 0 ? integrationLogos : DEFAULT_INTEGRATION_LOGOS;

  return (
    <section className="bg-white flex flex-col gap-[26px] py-[26px] px-6 lg:px-[52px]">
      {cards.map((card, i) => {
        if (card.type === "websiteTabs") {
          return (
            <WebsiteFirstCard
              key={`feature-card-${i}`}
              titleLine1={card.titleLine1}
              titleLine2={card.titleLine2}
              subtitle={card.subtitle}
            />
          );
        }
        return (
          <Card
            key={`feature-card-${i}`}
            card={card}
            index={i}
            integrationLogos={logos}
            integrationsCtaLabel={integrationsCtaLabel}
            integrationsCtaHref={integrationsCtaHref}
          />
        );
      })}
    </section>
  );
}
