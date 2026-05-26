import Image from "next/image";
import type { ReactNode } from "react";
import type {
  ComparisonBulletTone,
  ComparisonCriterionData,
  ComparisonProductCard,
} from "@/lib/detail-data";

const TONE_DOT_COLOR: Record<ComparisonBulletTone, string> = {
  good: "#22C55E",
  warn: "#F5B400",
  bad: "#F05252",
};

const SUPERFLOW_LOGO = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="9" cy="8" r="4" fill="#FFB800" />
    <circle cx="15" cy="9" r="4" fill="#F05252" />
    <circle cx="9" cy="15" r="4" fill="#8B5CF6" />
    <circle cx="15" cy="16" r="4" fill="#22C55E" />
  </svg>
);

const COMPETITOR_LOGO_DEFAULT = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
      fill="#3B82F6"
    />
    <path d="M14 2v6h6" fill="#1E40AF" opacity="0.6" />
    <path d="M8 12h8M8 15h8M8 18h6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const DEFAULT_LOGO: Record<"superflow" | "competitor", ReactNode> = {
  superflow: SUPERFLOW_LOGO,
  competitor: COMPETITOR_LOGO_DEFAULT,
};

function BulletPill({
  text,
  tone,
}: {
  text: string;
  tone: ComparisonBulletTone;
}) {
  return (
    <span
      className="inline-flex items-center gap-[8px] rounded-full px-[12px] py-[6px]"
      style={{ background: "#F4F4F6" }}
    >
      <span
        className="h-[8px] w-[8px] shrink-0 rounded-full"
        style={{ background: TONE_DOT_COLOR[tone] }}
      />
      <span
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: 13,
          lineHeight: 1.4,
          color: "#111",
        }}
      >
        {text}
      </span>
    </span>
  );
}

function ProductHeader({
  card,
  variant,
}: {
  card: ComparisonProductCard;
  variant: "superflow" | "competitor";
}) {
  const palette =
    variant === "superflow"
      ? { bg: "#E6F5EC", text: "#0F8A4D", score: "#0F8A4D" }
      : { bg: "#FFEAE0", text: "#C0522D", score: "#C0522D" };

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-[14px] px-[16px] py-[12px]"
      style={{ background: palette.bg }}
    >
      <div className="flex items-center gap-[10px]">
        {card.logo ? (
          <div className="relative h-[22px] w-[22px] overflow-hidden">
            <Image
              src={card.logo}
              alt=""
              width={22}
              height={22}
              className="object-contain"
            />
          </div>
        ) : (
          <span className="flex h-[22px] w-[22px] items-center justify-center">
            {DEFAULT_LOGO[variant]}
          </span>
        )}
        <span
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            fontSize: 15,
            color: "#111",
            letterSpacing: "-0.01em",
          }}
        >
          {card.name}
        </span>
      </div>
      <span
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: 14,
          fontWeight: 600,
          color: palette.score,
        }}
      >
        {card.score}
      </span>
    </div>
  );
}

function ProductColumn({
  card,
  variant,
}: {
  card: ComparisonProductCard;
  variant: "superflow" | "competitor";
}) {
  return (
    <div className="flex flex-1 flex-col gap-[16px]">
      <ProductHeader card={card} variant={variant} />

      {card.video ? (
        <div className="w-full overflow-hidden rounded-[16px]">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={card.video}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={card.imageAlt}
            className="block w-full h-auto"
          />
        </div>
      ) : card.image ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[16px] bg-[#0E0E18]">
          <Image
            src={card.image}
            alt={card.imageAlt ?? ""}
            fill
            sizes="(min-width: 1024px) 480px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      {card.summary && (
        <p
          style={{
            fontFamily: "var(--font-poppins)",
            fontWeight: 600,
            fontSize: 16,
            color: "#111",
            letterSpacing: "-0.02em",
          }}
        >
          {card.summary}
        </p>
      )}

      <ul className="flex flex-wrap gap-[8px]">
        {card.bullets.map((bullet, i) => (
          <li key={i}>
            <BulletPill text={bullet.text} tone={bullet.tone} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ComparisonCriterion({
  id,
  icon,
  title,
  description,
  superflow,
  competitor,
}: ComparisonCriterionData) {
  return (
    <section id={id} className="bg-white py-[28px] lg:py-[40px]">
      <div className="container-page">
        <article
          className="relative mx-auto max-w-[1080px] rounded-[32px] p-[1.5px]"
          style={{
            background:
              "linear-gradient(135deg, rgba(252,108,186,0.45), rgba(132,128,255,0.45) 50%, rgba(45,154,255,0.35))",
          }}
        >
          <div className="rounded-[31px] bg-white px-[28px] py-[36px] lg:px-[56px] lg:py-[56px]">
            <div className="flex flex-col items-center gap-[12px] text-center">
              {icon && (
                <div className="relative h-[36px] w-[36px] overflow-hidden">
                  <Image
                    src={icon}
                    alt=""
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
              )}
              <h3
                className="text-[#111]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontWeight: 600,
                  fontSize: "clamp(24px, 2.6vw, 32px)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.03em",
                }}
              >
                {title}
              </h3>
              <p
                className="max-w-[640px]"
                style={{
                  fontFamily: "var(--font-poppins)",
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "rgba(17,17,17,0.55)",
                }}
              >
                {description}
              </p>
            </div>

            <div className="mt-[32px] flex flex-col gap-[24px] lg:flex-row lg:gap-[24px]">
              <ProductColumn card={superflow} variant="superflow" />
              <ProductColumn card={competitor} variant="competitor" />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
