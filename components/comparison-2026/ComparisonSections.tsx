import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import BlueprintFrame from "@/components/home-2026/BlueprintFrame";
import { toInternalHref, isExternalHref } from "@/lib/links";
import { TIERS, type Tier } from "@/components/pricing/pricing-data";

import styles from "./comparison.module.css";
import { badgeNumber, dimensionBadgeColor } from "./comparisonBadges";
import ComparisonReveal from "./ComparisonReveal";
import { getToolLogoSrc, getToolLogosFromSlug } from "./toolLogos";
import type {
  ComparisonDimension,
  ComparisonLink,
  ComparisonScorecardRow,
} from "./types";

export const SIGNUP_URL = "https://app.usesuperflow.com/signup";
export const BOOK_DEMO_PATH = "/book-demo";
export const CTA_MICROCOPY =
  "Free to start. No credit card. Your client reviews without an account.";

/**
 * Slugify a dimension label into a stable in-page anchor id.
 *
 * @param label - The buyer label, e.g. "Who checks the site".
 * @returns A kebab-case anchor id, e.g. "who-checks-the-site".
 */
export function dimensionAnchorId(label: string): string {
  try {
    return (label ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  } catch {
    return "dimension";
  }
}

/**
 * Renders an internal path with next/link and external URLs with a plain
 * anchor, so preview pages can safely link future live paths.
 */
export function ComparisonSmartLink({
  link,
  className,
}: {
  link: ComparisonLink;
  className?: string;
}) {
  const href = link?.href ?? "#";
  // Decide internal vs external from the ORIGINAL value, but render the
  // normalized href so bare-relative internal links (e.g. "comparisons") are
  // rooted at "/" instead of compounding onto the current route.
  const normalizedHref = toInternalHref(href) ?? "#";
  if (!isExternalHref(href)) {
    return (
      <Link href={normalizedHref} className={className}>
        {link?.label}
      </Link>
    );
  }
  return (
    <a href={normalizedHref} className={className} rel="nofollow noopener">
      {link?.label}
    </a>
  );
}

/**
 * A tool's name with its logo mark, used in fact-card headers and scorecard
 * columns. Falls back to the bare name when no logo is known.
 */
export function ToolNameWithLogo({
  name,
  size = 18,
}: {
  name?: string;
  size?: number;
}) {
  const label = name ?? "";
  const logoSrc = getToolLogoSrc(label);
  if (!logoSrc) {
    return <>{label}</>;
  }
  return (
    <span className={styles.toolNameWithLogo}>
      <Image
        src={logoSrc}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className={styles.toolLogo}
        unoptimized
      />
      {label}
    </span>
  );
}

/** The Start free / Book a demo pair with the sitewide microcopy. */
export function ComparisonCtas({ onDark = true }: { onDark?: boolean }) {
  return (
    <>
      <div className={styles.heroCtas}>
        <a className={styles.ctaPrimary} href={SIGNUP_URL}>
          Start free
        </a>
        <Link
          className={onDark ? styles.ctaSecondary : styles.ctaPrimary}
          href={BOOK_DEMO_PATH}
        >
          Book a demo
        </Link>
      </div>
      <p className={styles.heroMicrocopy}>{CTA_MICROCOPY}</p>
    </>
  );
}

/** Tabler `layers-difference` icon (Figma 1061:2222) in the site accent. */
function LayersDifferenceIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 16v2a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2h2" />
      <path d="M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
      <path d="M11 17l6 -6" />
      <path d="M8 13l5 -5" />
      <path d="M14 20l6 -6" />
    </svg>
  );
}

/** Tabler `award` icon used by the dimension-panel verdict label. */
function AwardIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="9" r="6" />
      <path d="M9 14.2l-1 7.3l4 -2.5l4 2.5l-1 -7.3" />
    </svg>
  );
}

/** One card of the criteria grid: a numbered color badge + its label. */
export type ComparisonCriteriaGridItem = {
  label: string;
  /** Optional supporting line rendered under the label. */
  line?: string;
  /** Optional in-page anchor; when set the card renders as a link. */
  href?: string;
};

/**
 * The numbered criteria overview (Figma 1061:2384): a full-bleed section
 * wrapped in the homepage {@link BlueprintFrame} (crossing rule-lines +
 * registration bolts with their draw-in entrance), a serif "NN Comparison
 * Criteria" heading on the left and a two-column grid of numbered cards on
 * the right, staggered in by {@link ComparisonReveal}.
 */
export function ComparisonCriteriaGrid({
  items,
  headingNoun = "Comparison Criteria",
}: {
  items?: ComparisonCriteriaGridItem[];
  headingNoun?: string;
}) {
  if (!items || items.length === 0) {
    return null;
  }
  return (
    <section className={styles.criteriaSection}>
      <BlueprintFrame />
      <ComparisonReveal>
        <div className={styles.criteriaInner}>
          <div className={styles.criteriaHead}>
            <span className={styles.criteriaHeadIcon}>
              <LayersDifferenceIcon />
            </span>
            <h2 className={styles.criteriaHeading}>
              {String(items.length).padStart(2, "0")} {headingNoun}
            </h2>
          </div>
          <ul className={styles.criteriaGrid}>
            {items.map((item, itemIndex) => {
              const badge = (
                <span
                  className={styles.criteriaBadge}
                  style={{ background: dimensionBadgeColor(itemIndex) }}
                >
                  {badgeNumber(itemIndex)}
                </span>
              );
              const body = (
                <>
                  {badge}
                  <span className={styles.criteriaLabel}>{item.label}</span>
                  {item?.line ? (
                    <span className={styles.criteriaLine}>{item.line}</span>
                  ) : null}
                </>
              );
              return (
                <li
                  key={item.label}
                  className={styles.criteriaItem}
                  style={
                    { "--reveal-delay": `${itemIndex * 70}ms` } as CSSProperties
                  }
                >
                  {item?.href ? (
                    <a className={styles.criteriaCard} href={item.href}>
                      {body}
                    </a>
                  ) : (
                    <span className={styles.criteriaCard}>{body}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </ComparisonReveal>
    </section>
  );
}

/**
 * Build the criteria-grid items for a page's dimensions, each linking to its
 * dimension section anchor.
 *
 * @param dimensions - The page's dimensions in canonical order.
 * @returns Grid items with in-page anchors, or an empty list.
 */
export function criteriaItemsFromDimensions(
  dimensions?: ComparisonDimension[],
): ComparisonCriteriaGridItem[] {
  try {
    return (dimensions ?? []).map((dimension) => ({
      label: dimension.label,
      href: `#${dimensionAnchorId(dimension.label)}`,
    }));
  } catch {
    return [];
  }
}

/** One tool's fact card inside a dimension panel (Figma 1061:2282). */
function DimensionToolCard({
  name,
  facts,
  verified,
  lead = false,
}: {
  name: string;
  facts?: string[];
  verified?: string;
  lead?: boolean;
}) {
  const cardClass = lead
    ? `${styles.factCard} ${styles.factCardLead}`
    : styles.factCard;
  return (
    <div className={cardClass}>
      <p className={styles.factCardName}>
        <ToolNameWithLogo name={name} size={24} />
      </p>
      <ul className={styles.factList}>
        {(facts ?? []).map((fact) => (
          <li key={fact} className={styles.factItem}>
            {fact}
          </li>
        ))}
      </ul>
      {verified ? <p className={styles.factVerified}>({verified})</p> : null}
    </div>
  );
}

/**
 * One dimension as a soft rounded panel (Figma 1061:2236): on the left a
 * colored number badge, the serif label, the framing line, and the verdict
 * block (award glyph + purple "Verdict" + takeaway); on the right the two
 * tool fact cards stacked. `leadSide` marks which tool card gets the accent
 * treatment (Superflow on vs pages; none on neutral arbiter pages).
 * `index` picks the badge color.
 */
export function ComparisonDimensionSection({
  dimension,
  leftName,
  rightName,
  leadSide,
  index = 0,
}: {
  dimension: ComparisonDimension;
  leftName: string;
  rightName: string;
  leadSide?: "left" | "right";
  index?: number;
}) {
  return (
    <section
      id={dimensionAnchorId(dimension.label)}
      className={styles.dimension}
    >
      <div className={styles.dimensionPanel}>
        <div className={styles.dimensionIntro}>
          <div className={styles.dimensionIntroTop}>
            <span
              className={styles.dimensionBadge}
              style={{ background: dimensionBadgeColor(index) }}
            >
              {dimension?.number ?? badgeNumber(index)}
            </span>
            <h3 className={styles.dimensionLabel}>{dimension.label}</h3>
            {dimension.framing ? (
              <p className={styles.dimensionFraming}>{dimension.framing}</p>
            ) : null}
          </div>
          {dimension.verdict ? (
            <div className={styles.dimensionVerdict}>
              <p className={styles.verdictTag}>
                <AwardIcon />
                Verdict
              </p>
              <p className={styles.verdictText}>{dimension.verdict}</p>
            </div>
          ) : null}
        </div>
        <div className={styles.dimensionCards}>
          <DimensionToolCard
            name={leftName}
            facts={dimension.leftFacts}
            verified={dimension.leftVerified}
            lead={leadSide === "left"}
          />
          <DimensionToolCard
            name={rightName}
            facts={dimension.rightFacts}
            verified={dimension.rightVerified}
            lead={leadSide === "right"}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * The eight-row scorecard table. `superflowColumn` shades that column with
 * the accent tint on pages where Superflow is a contestant.
 */
export function ComparisonScorecardTable({
  rows,
  leftName,
  rightName,
  superflowColumn,
}: {
  rows?: ComparisonScorecardRow[];
  leftName: string;
  rightName: string;
  superflowColumn?: "left" | "right";
}) {
  if (!rows || rows.length === 0) {
    return null;
  }
  const leftCellClass =
    superflowColumn === "left" ? styles.scorecardSuperflowCol : undefined;
  const rightCellClass =
    superflowColumn === "right" ? styles.scorecardSuperflowCol : undefined;

  return (
    <div className={styles.scorecardWrap}>
      <table className={styles.scorecard}>
        <thead>
          <tr>
            <th scope="col">The job</th>
            <th scope="col" className={leftCellClass}>
              <ToolNameWithLogo name={leftName} size={16} />
            </th>
            <th scope="col" className={rightCellClass}>
              <ToolNameWithLogo name={rightName} size={16} />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className={styles.scorecardLabel}>{row.label}</td>
              <td className={leftCellClass}>{row.leftCell}</td>
              <td className={rightCellClass}>{row.rightCell}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Related-page links as hub-style cards (same idiom as the comparison
 * listing page): tool logos derived from the target slug, the page title,
 * and the hover lift. Internal paths use next/link; anything else falls
 * back to a plain anchor.
 */
export function ComparisonRelatedLinks({
  links,
}: {
  links?: ComparisonLink[];
}) {
  if (!links || links.length === 0) {
    return null;
  }
  return (
    <ul className={styles.hubGrid}>
      {links.map((link) => {
        const href = link?.href ?? "#";
        const normalizedHref = toInternalHref(href) ?? "#";
        const slug = href.split("/").filter(Boolean).pop();
        const logoSrcs = getToolLogosFromSlug(slug);
        const cardBody = (
          <>
            {logoSrcs.length > 0 ? (
              <span className={styles.hubCardLogos}>
                {logoSrcs.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    aria-hidden="true"
                    width={22}
                    height={22}
                    className={styles.toolLogo}
                    unoptimized
                  />
                ))}
              </span>
            ) : null}
            <p className={styles.hubCardTitle}>{link.label}</p>
          </>
        );
        return (
          <li key={`${link.label}-${href}`}>
            {!isExternalHref(href) ? (
              <Link className={styles.hubCard} href={normalizedHref}>
                {cardBody}
              </Link>
            ) : (
              <a
                className={styles.hubCard}
                href={normalizedHref}
                rel="nofollow noopener"
              >
                {cardBody}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** The dark final CTA band with an H1 echo. */
export function ComparisonFinalCta({ headline }: { headline?: string }) {
  if (!headline) {
    return null;
  }
  return (
    <section className={styles.section}>
      <div className={styles.ctaBand}>
        <h2 className={styles.ctaBandHeadline}>{headline}</h2>
        <div className={styles.heroCtas}>
          <a className={styles.ctaPrimary} href={SIGNUP_URL}>
            Start free
          </a>
          <Link className={styles.ctaSecondary} href={BOOK_DEMO_PATH}>
            Book a demo
          </Link>
        </div>
        <p className={styles.ctaBandMicrocopy}>{CTA_MICROCOPY}</p>
      </div>
    </section>
  );
}

/**
 * Split prose into sentences at ". " boundaries followed by a capital,
 * currency sign, or digit — tolerant of vendor names like "Marker.io"
 * because their inner dot has no trailing space.
 *
 * @param text - The prose to split.
 * @returns The trimmed sentences, or the input as a single entry.
 */
export function splitSentences(text: string): string[] {
  try {
    return (text ?? "")
      .split(/(?<=[.!?])\s+(?=[A-Z$€£0-9])/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);
  } catch {
    return [text];
  }
}

/** Structured parts of an arbiter pricing note (see splitPricingNote). */
type PricingNoteParts = {
  intro?: string;
  leftFacts: string[];
  rightFacts: string[];
  takeaway?: string;
};

/**
 * Break an arbiter `pricingNote` blob into scannable parts. The notes follow
 * an editorial pattern: a "Both columns verified …" lead, a "{LeftTool}: …"
 * segment, a "{RightTool}: …" segment, and usually a trailing takeaway that
 * compares the two. The takeaway is detected as the first sentence after the
 * right tool's opener that names the left tool or says "both".
 *
 * @param note - The raw pricing note.
 * @param leftName - The left tool's display name.
 * @param rightName - The right tool's display name.
 * @returns The structured parts, or `null` when the note doesn't follow the
 * "{Tool}: …" pattern and should render as plain prose.
 */
function splitPricingNote(
  note: string,
  leftName: string,
  rightName: string,
): PricingNoteParts | null {
  try {
    const leftMarker = `${leftName}:`;
    const rightMarker = `${rightName}:`;
    const leftIndex = note.indexOf(leftMarker);
    const rightIndex =
      leftIndex >= 0
        ? note.indexOf(rightMarker, leftIndex + leftMarker.length)
        : -1;
    if (leftIndex < 0 || rightIndex < 0) {
      return null;
    }
    const intro = note.slice(0, leftIndex).trim();
    const leftText = note
      .slice(leftIndex + leftMarker.length, rightIndex)
      .trim();
    const rightSentences = splitSentences(
      note.slice(rightIndex + rightMarker.length).trim(),
    );
    let takeawayStart = rightSentences.length;
    for (let index = 1; index < rightSentences.length; index += 1) {
      const sentence = rightSentences[index] ?? "";
      if (sentence.includes(leftName) || /\bboth\b/i.test(sentence)) {
        takeawayStart = index;
        break;
      }
    }
    const takeaway = rightSentences.slice(takeawayStart).join(" ");
    return {
      intro: intro || undefined,
      leftFacts: splitSentences(leftText),
      rightFacts: rightSentences.slice(0, takeawayStart),
      takeaway: takeaway || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * The arbiter "Pricing, side by side" body: instead of one wall-of-text
 * paragraph, the note renders as a small verified-intro line, one fact card
 * per tool (logo + sentence bullets), and a highlighted "The math" takeaway.
 * Notes that don't follow the "{Tool}: …" pattern fall back to prose with
 * the intro line still lifted out.
 */
export function ComparisonPricingNote({
  note,
  leftName,
  rightName,
}: {
  note?: string;
  leftName: string;
  rightName: string;
}) {
  if (!note) {
    return null;
  }
  const parts = splitPricingNote(note, leftName, rightName);

  if (!parts) {
    const sentences = splitSentences(note);
    const hasIntro = /^Both columns verified/i.test(sentences[0] ?? "");
    return (
      <div className={styles.pricingNote}>
        {hasIntro ? (
          <p className={styles.pricingIntro}>{sentences[0]}</p>
        ) : null}
        <p className={styles.bodyText}>
          {(hasIntro ? sentences.slice(1) : sentences).join(" ")}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.pricingNote}>
      {parts.intro ? (
        <p className={styles.pricingIntro}>{parts.intro}</p>
      ) : null}
      <div className={styles.cardPair}>
        <div className={styles.factCard}>
          <p className={styles.factCardName}>
            <ToolNameWithLogo name={leftName} size={24} />
          </p>
          <ul className={styles.factList}>
            {parts.leftFacts.map((fact) => (
              <li key={fact} className={styles.factItem}>
                {fact}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.factCard}>
          <p className={styles.factCardName}>
            <ToolNameWithLogo name={rightName} size={24} />
          </p>
          <ul className={styles.factList}>
            {parts.rightFacts.map((fact) => (
              <li key={fact} className={styles.factItem}>
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {parts.takeaway ? (
        <div className={styles.pricingTakeaway}>
          <p className={styles.verdictTag}>
            <AwardIcon />
            The math
          </p>
          <p className={styles.verdictText}>{parts.takeaway}</p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Price label for a tier on the comparison pages: "Free", "Custom", or
 * "$29 per seat/mo ($24 annual)".
 *
 * @param tier - The pricing tier.
 * @returns The compact price label.
 */
function tierPriceLabel(tier: Tier): string {
  try {
    if (tier?.customPrice) {
      return "Custom";
    }
    if (tier?.monthlyPrice === "0") {
      return "Free";
    }
    const annual =
      tier?.annualPrice && tier.annualPrice !== tier.monthlyPrice
        ? ` ($${tier.annualPrice} annual)`
        : "";
    return `$${tier.monthlyPrice} per seat/mo${annual}`;
  } catch {
    return tier?.monthlyPrice ?? "";
  }
}

/**
 * One-line summary of a tier's headline bullets, e.g. "Unlimited Projects,
 * Pay Per Team Seat, 10GB Storage". Divider rows ("Everything in X, plus")
 * and "+N More Features" teasers are dropped.
 *
 * @param tier - The pricing tier.
 * @returns The comma-joined bullet summary.
 */
function tierBulletSummary(tier: Tier): string {
  try {
    return (tier?.bullets ?? [])
      .filter((bullet) => !bullet.divider && !/^\+\d+ More/i.test(bullet.text))
      .map((bullet) => bullet.text)
      .join(", ");
  } catch {
    return "";
  }
}

/**
 * Superflow's real pricing, inline on the comparison pages — sourced from
 * the same `TIERS` module that renders /pricing, so the numbers can never
 * drift. One row per tier (name, price, headline bullets) with a link to
 * the full breakdown for the feature table.
 */
export function SuperflowPricingSummary() {
  return (
    <div className={styles.pricingTiers}>
      {TIERS.map((tier) => (
        <div key={tier.id} className={styles.pricingTierRow}>
          <p className={styles.pricingTierHead}>
            <span className={styles.pricingTierName}>{tier.name}</span>
            <span className={styles.pricingTierPrice}>
              {tierPriceLabel(tier)}
            </span>
          </p>
          <p className={styles.pricingTierDetail}>{tierBulletSummary(tier)}</p>
        </div>
      ))}
      <Link className={styles.inlineLink} href="/pricing">
        Full feature breakdown
      </Link>
    </div>
  );
}

/**
 * Compact display label for a source URL: protocol and trailing slash
 * stripped, e.g. "https://ruttl.com/pricing/" → "ruttl.com/pricing".
 *
 * @param url - The full source URL.
 * @returns The shortened label, or the input when parsing fails.
 */
function sourceUrlLabel(url: string): string {
  try {
    return (url ?? "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  } catch {
    return url;
  }
}

/**
 * Dateline + sources footnote for the verify protocol: a single "Facts
 * checked {date}. Sources" line where hovering (or keyboard-focusing) the
 * "Sources" trigger reveals a tooltip card listing every source link.
 */
export function ComparisonSources({
  factsCheckedAt,
  sourceUrls,
}: {
  factsCheckedAt?: string;
  sourceUrls?: string[];
}) {
  if (!factsCheckedAt && (!sourceUrls || sourceUrls.length === 0)) {
    return null;
  }
  return (
    <div className={styles.sources}>
      {factsCheckedAt ? <span>Facts checked {factsCheckedAt}.</span> : null}
      {sourceUrls && sourceUrls.length > 0 ? (
        <span className={styles.sourcesTrigger} tabIndex={0}>
          Sources
          <span className={styles.sourcesTooltip} role="tooltip">
            <span className={styles.sourcesTooltipCard}>
              {sourceUrls.map((url) => (
                <a
                  key={url}
                  className={styles.sourcesTooltipLink}
                  href={url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                >
                  {sourceUrlLabel(url)}
                </a>
              ))}
            </span>
          </span>
        </span>
      ) : null}
    </div>
  );
}
