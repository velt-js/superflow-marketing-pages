import Image from "next/image";
import Link from "next/link";

import styles from "./comparison.module.css";
import { getToolLogoSrc } from "./toolLogos";
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
  const isInternal = href.startsWith("/");
  if (isInternal) {
    return (
      <Link href={href} className={className}>
        {link?.label}
      </Link>
    );
  }
  return (
    <a href={href} className={className} rel="nofollow noopener">
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

/**
 * Anchor chips linking to each rendered dimension section, numbered in the
 * canonical order they arrive in.
 */
export function ComparisonAnchorChips({
  dimensions,
}: {
  dimensions?: ComparisonDimension[];
}) {
  if (!dimensions || dimensions.length === 0) {
    return null;
  }
  return (
    <ul className={styles.anchorChips}>
      {dimensions.map((dimension) => (
        <li key={dimension.label}>
          <a
            className={styles.anchorChip}
            href={`#${dimensionAnchorId(dimension.label)}`}
          >
            <span className={styles.anchorChipNumber}>{dimension.number}</span>
            {dimension.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * One numbered dimension: framing line, the paired fact cards, and the
 * verdict line. `leadSide` marks which card gets the accent treatment
 * (Superflow on vs pages; none on neutral arbiter pages).
 */
export function ComparisonDimensionSection({
  dimension,
  leftName,
  rightName,
  leadSide,
}: {
  dimension: ComparisonDimension;
  leftName: string;
  rightName: string;
  leadSide?: "left" | "right";
}) {
  const leftCardClass =
    leadSide === "left"
      ? `${styles.factCard} ${styles.factCardLead}`
      : styles.factCard;
  const rightCardClass =
    leadSide === "right"
      ? `${styles.factCard} ${styles.factCardLead}`
      : styles.factCard;

  return (
    <section
      id={dimensionAnchorId(dimension.label)}
      className={styles.dimension}
    >
      <div className={styles.dimensionHeader}>
        <span className={styles.dimensionNumber}>{dimension.number}</span>
        <h3 className={styles.dimensionLabel}>{dimension.label}</h3>
      </div>
      {dimension.framing ? (
        <p className={styles.dimensionFraming}>{dimension.framing}</p>
      ) : null}
      <div className={styles.cardPair}>
        <div className={leftCardClass}>
          <p className={styles.factCardName}>
            <ToolNameWithLogo name={leftName} />
          </p>
          <ul className={styles.factList}>
            {(dimension.leftFacts ?? []).map((fact) => (
              <li key={fact} className={styles.factItem}>
                {fact}
              </li>
            ))}
          </ul>
          {dimension.leftVerified ? (
            <p className={styles.factVerified}>({dimension.leftVerified})</p>
          ) : null}
        </div>
        <div className={rightCardClass}>
          <p className={styles.factCardName}>
            <ToolNameWithLogo name={rightName} />
          </p>
          <ul className={styles.factList}>
            {(dimension.rightFacts ?? []).map((fact) => (
              <li key={fact} className={styles.factItem}>
                {fact}
              </li>
            ))}
          </ul>
          {dimension.rightVerified ? (
            <p className={styles.factVerified}>({dimension.rightVerified})</p>
          ) : null}
        </div>
      </div>
      {dimension.verdict ? (
        <p className={styles.verdict}>
          <span className={styles.verdictTag}>Verdict</span>
          {dimension.verdict}
        </p>
      ) : null}
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

/** Pill-style related-page links. */
export function ComparisonRelatedLinks({
  links,
}: {
  links?: ComparisonLink[];
}) {
  if (!links || links.length === 0) {
    return null;
  }
  return (
    <ul className={styles.relatedList}>
      {links.map((link) => (
        <li key={`${link.label}-${link.href}`} className={styles.relatedItem}>
          <ComparisonSmartLink link={link} />
        </li>
      ))}
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

/** Dateline + source URLs footnote for the verify protocol. */
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
    <p className={styles.sources}>
      {factsCheckedAt ? `Facts checked ${factsCheckedAt}. ` : null}
      {sourceUrls && sourceUrls.length > 0
        ? `Sources: ${sourceUrls.join(" · ")}`
        : null}
    </p>
  );
}
