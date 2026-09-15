import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { SIGNUP_URL } from "@/lib/use-case-types";
import styles from "./TestimonialsSection.module.css";

/** Assets exported from Figma node 582:5677. */
const ASSET_BASE = "/images/home-2026/testimonial";
const FEATURED_PHOTO_SRC = `${ASSET_BASE}/featured-wonderist.png`;

/** Section CTA pairing — mirrors the global footer (secondary + primary). */
const BOOK_DEMO_HREF = "/book-demo";
const SECONDARY_CTA_LABEL = "Book Demo";
const PRIMARY_CTA_LABEL = "Start Free";

/**
 * 07 / Testimonial — 2026 homepage redesign.
 *
 * Left column pairs a serif headline with a divided list of agency metrics
 * and stays pinned (position: sticky) while the right column scrolls.
 * Right column stacks one featured (image-backed) testimonial above a set of
 * data-driven compact testimonial cards. All content mirrors the Figma copy.
 */

type MetricIconName = "clock" | "message" | "calendar" | "folder";

interface AgencyMetric {
  id: string;
  icon: MetricIconName;
  /** Accent color sampled from the Figma icon stroke. */
  color: string;
  value: string;
  label: string;
}

interface FeaturedStat {
  value: string;
  label: string;
}

interface FeaturedTestimonial {
  company: string;
  heading: string;
  body: string;
  stats: FeaturedStat[];
}

interface Testimonial {
  id: string;
  company: string;
  quote: string;
  /** Person the quote is attributed to, shown beneath the quote as
      "{name} @{company}". */
  name: string;
  /** Card background tint, matched to the Figma per-card wash. */
  tint: string;
  /** Company logo exported from Figma, plus its natural pixel dimensions. */
  logoSrc: string;
  logoWidth: number;
  logoHeight: number;
  /** Rendered logo height in px. Tuned per-logo so the marks read at the same
      optical size despite different intrinsic aspect ratios. */
  logoDisplayHeight: number;
}

const AGENCY_METRICS: AgencyMetric[] = [
  {
    id: "hours",
    icon: "clock",
    color: "#2a44d7",
    value: "182 Hours",
    label: "back every month",
  },
  {
    id: "rounds",
    icon: "message",
    color: "#dc7713",
    value: "3 fewer rounds",
    label: "of feedback",
  },
  {
    id: "days",
    icon: "calendar",
    color: "#d30cb2",
    value: "4 Days",
    label: "to approval",
  },
  {
    id: "projects",
    icon: "folder",
    color: "#11ba60",
    value: "61 Projects",
    label: "shipped every month",
  },
];

const FEATURED_TESTIMONIAL: FeaturedTestimonial = {
  company: "Wonderist",
  heading: "47 hours back a month, every month",
  body: "Wonderist runs every client site through Superflow before it ships. Their senior designers stopped doing first-pass QA by hand.",
  stats: [
    { value: "47 hrs", label: "back every mo" },
    { value: "3 Fewer", label: "Feedback Rounds" },
    { value: "3 Days", label: "to approval" },
  ],
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "writesonic",
    company: "Writesonic",
    quote: "Empowers non-tech users like me.",
    name: "Manvi Agarwal",
    tint: "rgba(255, 103, 25, 0.06)",
    logoSrc: `${ASSET_BASE}/logo-writesonic.svg`,
    logoWidth: 131,
    logoHeight: 17,
    logoDisplayHeight: 16,
  },
  {
    id: "headway",
    company: "Headway",
    quote: "Everybody has loved how easy it is to get started.",
    name: "Riley Hennigh",
    tint: "rgba(49, 170, 183, 0.06)",
    logoSrc: `${ASSET_BASE}/logo-headway.svg`,
    logoWidth: 105,
    logoHeight: 33,
    logoDisplayHeight: 30,
  },
  {
    id: "harvey",
    company: "Harvey",
    quote: "Clear, Simple & Saves time for everyone involved.",
    name: "Simon Smallchua",
    tint: "rgba(30, 30, 31, 0.05)",
    logoSrc: `${ASSET_BASE}/logo-harvey.webp`,
    logoWidth: 300,
    logoHeight: 116,
    logoDisplayHeight: 30,
  },
];

/** Stroke paths for the metric icons (24x24 grid, tabler-style line icons). */
const METRIC_ICON_PATHS: Record<MetricIconName, ReactNode> = {
  clock: (
    <>
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  message: (
    <>
      <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
      <path d="M12 12v.01" />
      <path d="M8 12v.01" />
      <path d="M16 12v.01" />
    </>
  ),
  calendar: (
    <>
      <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M4 11h16" />
      <path d="M8 15h2v2h-2z" />
    </>
  ),
  folder: (
    <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
  ),
};

/**
 * Renders a single-color line icon used beside an agency metric.
 * @param name - Which metric glyph to draw.
 * @param color - Stroke color for the glyph.
 */
function TestimonialsSectionMetricIcon({
  name,
  color,
}: {
  name: MetricIconName;
  color: string;
}) {
  return (
    <svg
      className={styles.metricIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {METRIC_ICON_PATHS[name]}
    </svg>
  );
}

/**
 * Decorative winking-face badge shown above the section headline.
 * Exact vector exported from Figma (tabler mood-wink-2, 582:5713): a single
 * gradient-stroked outline path with the original drop/inner shadow filter.
 */
function TestimonialsSectionBadge() {
  return (
    <svg
      className={styles.badge}
      viewBox="0 0 60 60"
      fill="none"
      aria-hidden="true"
    >
      <g filter="url(#tsWinkShadow)">
        <path
          d="M22.5006 25H22.4756M36.25 37.5C35.4353 38.3315 34.4629 38.9921 33.3897 39.443C32.3165 39.894 31.1641 40.1263 30 40.1263C28.8359 40.1263 27.6835 39.894 26.6103 39.443C25.5371 38.9921 24.5647 38.3315 23.75 37.5M38.75 21.25L35 25L38.75 28.75M30 52.5C27.0453 52.5 24.1194 51.918 21.3896 50.7873C18.6598 49.6566 16.1794 47.9992 14.0901 45.9099C12.0008 43.8206 10.3434 41.3402 9.21271 38.6104C8.08198 35.8806 7.5 32.9547 7.5 30C7.5 27.0453 8.08198 24.1194 9.21271 21.3896C10.3434 18.6598 12.0008 16.1794 14.0901 14.0901C16.1794 12.0008 18.6598 10.3434 21.3896 9.21271C24.1194 8.08198 27.0453 7.5 30 7.5C35.9674 7.5 41.6903 9.87053 45.9099 14.0901C50.1295 18.3097 52.5 24.0326 52.5 30C52.5 35.9674 50.1295 41.6903 45.9099 45.9099C41.6903 50.1295 35.9674 52.5 30 52.5Z"
          stroke="url(#tsWinkGradient)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        {/* Region widened from the Figma export (was ~2.7px of slack) so the
            blur fades out fully instead of clipping to a hard edge. */}
        <filter
          id="tsWinkShadow"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="2.4" dy="2.4" />
          <feGaussianBlur stdDeviation="4.8" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="4.8" dy="4.8" />
          <feGaussianBlur stdDeviation="2.4" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"
          />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-2.4" dy="-2.4" />
          <feGaussianBlur stdDeviation="2.4" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="effect2_innerShadow"
            result="effect3_innerShadow"
          />
        </filter>
        <linearGradient
          id="tsWinkGradient"
          x1="14.7275"
          y1="7.5"
          x2="34.9464"
          y2="56.7401"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#35D98F" />
          <stop offset="1" stopColor="#0F7C39" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Wonderist wordmark as a cacheable SVG asset. Keeps the same Figma vector
 * while avoiding repeated path data in the HTML and React server payload.
 * @param className - Class applied to the image for sizing and placement.
 */
function WonderistLogo({ className }: { className?: string }) {
  return (
    <Image
      src={`${ASSET_BASE}/wonderist-logo.svg`}
      alt={`${FEATURED_TESTIMONIAL.company} logo`}
      width={158}
      height={34}
      className={className}
    />
  );
}

/**
 * Reusable compact testimonial card showing the company logo, quote and role.
 * @param testimonial - Quote, role, company, logo and background tint to render.
 */
function TestimonialsSectionCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure
      className={styles.card}
      style={{ "--testimonial-tint": testimonial?.tint } as CSSProperties}
    >
      <Image
        className={styles.cardLogo}
        src={testimonial.logoSrc}
        alt={`${testimonial?.company} logo`}
        width={testimonial.logoWidth}
        height={testimonial.logoHeight}
        style={{ height: testimonial?.logoDisplayHeight }}
      />
      <blockquote className={styles.cardQuote}>{testimonial?.quote}</blockquote>
      <figcaption className={styles.cardPerson}>
        {testimonial?.name} @{testimonial?.company}
      </figcaption>
    </figure>
  );
}

/** Which single testimonial a page shows (solutions pages, spec S6). */
export type TestimonialsProof =
  | "wonderist-review"
  | "headway"
  | "harvey"
  | "metrics-only";

/**
 * Per-page overrides for the testimonials section. Omit `proof` to render
 * the full home page section unchanged.
 */
export interface TestimonialsSectionProps {
  /**
   * When set, the showcase column shows only the chosen card: the Wonderist
   * featured figure ("wonderist-review") or one compact card ("headway",
   * "harvey"). "metrics-only" drops the showcase column and renders the
   * intro and metrics alone, full width. No quote is ever invented: an id
   * with no matching card falls through to the metrics-only layout.
   */
  proof?: TestimonialsProof;
}

/**
 * The Wonderist body line shown on solutions pages. The spec allows Wonderist
 * only as proof of review-and-approval speed (hours back), never as proof
 * that the agents work, so the solutions pages keep the first sentence (the
 * review process) and drop the line about first-pass QA. The home page
 * renders the full body unchanged; nothing is added or reworded.
 *
 * @param body - The full featured body.
 * @returns The first sentence of the body.
 */
function featuredBodyForProof(body: string): string {
  try {
    const match = /^[^.]*\./.exec(body);
    return match ? match[0] : body;
  } catch {
    return body;
  }
}

/**
 * Full "07 / Testimonial" section for the 2026 homepage preview.
 * Composes the metrics column and the featured + compact testimonials column.
 *
 * @param props - Optional per-page override; the default reproduces the
 *   home page exactly.
 */
export default function TestimonialsSection({
  proof,
}: TestimonialsSectionProps = {}) {
  const showFeatured = proof === undefined || proof === "wonderist-review";
  const compactCards =
    proof === undefined
      ? TESTIMONIALS
      : TESTIMONIALS.filter((testimonial) => testimonial?.id === proof);
  const hasShowcase = showFeatured || compactCards.length > 0;
  const gridClassName = hasShowcase
    ? styles.grid
    : `${styles.grid} ${styles.gridSingle}`;

  return (
    <section
      className={styles.section}
      data-section="testimonials"
      aria-labelledby="testimonials-heading"
    >
      <div className={styles.inner}>
        <div className={gridClassName}>
          <div className={styles.intro}>
            <TestimonialsSectionBadge />
            <h2 id="testimonials-heading" className={styles.heading}>
              Real agencies.
              <br />
              Real hours back.
            </h2>
            <ul className={styles.metrics}>
              {AGENCY_METRICS.map((metric) => (
                <li key={metric?.id} className={styles.metric}>
                  <span className={styles.metricValueGroup}>
                    <TestimonialsSectionMetricIcon
                      name={metric.icon}
                      color={metric.color}
                    />
                    <span className={styles.metricValue}>{metric?.value}</span>
                  </span>
                  <span className={styles.metricLabel}>{metric?.label}</span>
                </li>
              ))}
            </ul>

            <div className={styles.ctaButtons}>
              <Link
                href={BOOK_DEMO_HREF}
                className={`${styles.btn} ${styles.btnOutline}`}
              >
                {SECONDARY_CTA_LABEL}
              </Link>
              <Link
                href={SIGNUP_URL}
                className={`${styles.btn} ${styles.btnFilled}`}
              >
                {PRIMARY_CTA_LABEL}
              </Link>
            </div>
          </div>

          {hasShowcase ? (
            <div className={styles.showcase}>
              {showFeatured ? (
                <figure className={styles.featured}>
                  <Image
                    className={styles.featuredPhoto}
                    src={FEATURED_PHOTO_SRC}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                  />
                  <span className={styles.featuredScrim} aria-hidden="true" />
                  <WonderistLogo className={styles.featuredLogo} />
                  <div className={styles.featuredContent}>
                    <blockquote className={styles.featuredText}>
                      <p className={styles.featuredHeading}>
                        {FEATURED_TESTIMONIAL.heading}
                      </p>
                      <p className={styles.featuredBody}>
                        {proof === undefined
                          ? FEATURED_TESTIMONIAL.body
                          : featuredBodyForProof(FEATURED_TESTIMONIAL.body)}
                      </p>
                    </blockquote>
                    <div className={styles.featuredStats}>
                      {FEATURED_TESTIMONIAL.stats.map((stat) => (
                        <div key={stat?.label} className={styles.featuredStat}>
                          <span className={styles.featuredStatValue}>
                            {stat?.value}
                          </span>
                          <span className={styles.featuredStatLabel}>
                            {stat?.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </figure>
              ) : null}

              {compactCards.map((testimonial) => (
                <TestimonialsSectionCard
                  key={testimonial?.id}
                  testimonial={testimonial}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
