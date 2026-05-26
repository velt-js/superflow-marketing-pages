import type {
  ComparisonDetailConfig,
  ComparisonProductCard,
  ComparisonBullet,
  ComparisonBulletTone,
  OverviewIconKey,
  PricingProduct,
} from "@/lib/detail-data";
import { SHARED_REASONS } from "@/lib/detail-data";

// Sanity comparisonPage shape returned by `getComparisonPageBySlug`.
// Mirrors the alternative adapter — the two doc types share the same
// schema-level field shape after the Comp v/s Comp rollback.
export interface SanityComparisonDoc {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  competitor1Name?: string;
  competitor2Name?: string;
  competitor1Logo?: string;
  competitor2Logo?: string;
  thumbnail?: string;
  criteria?: SanityCriterion[];
  pricing?: SanityPricingRow[];
  faq?: { question?: string; answer?: string }[];
  overview?: string;
  showOverview?: boolean;
  summaryPointers?: unknown;
  testimonial?: SanityTestimonial;
  layout2Testimonial?: SanityTestimonial;
  metaTitle?: string;
  metaDescription?: string;
}

interface SanityCriterion {
  _key?: string;
  title?: string;
  description?: string;
  winnerC1?: boolean;
  competitor1?: SanityCompetitorBlock;
  competitor2?: SanityCompetitorBlock;
}

interface SanityCompetitorBlock {
  score?: string;
  title?: string;
  video?: string;
  youtubeUrl?: string;
  tags?: { label?: string; color?: string }[];
}

interface SanityPricingRow {
  c1Name?: string;
  c1Price?: string;
  c1Users?: string;
  c2Name?: string;
  c2Price?: string;
  c2Users?: string;
}

interface SanityTestimonial {
  name?: string;
  role?: string;
  company?: string;
  title?: string;
  subCopy?: string;
  profileImage?: string;
}

function tagColorToTone(color?: string): ComparisonBulletTone {
  switch ((color ?? "").toLowerCase()) {
    case "green":
      return "good";
    case "red":
      return "bad";
    case "yellow":
    case "orange":
      return "warn";
    default:
      return "warn";
  }
}

function bulletsFromTags(
  tags: SanityCompetitorBlock["tags"],
): ComparisonBullet[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t) => t?.label)
    .map((t) => ({ text: t!.label!, tone: tagColorToTone(t!.color) }));
}

function makeProductCard(
  block: SanityCompetitorBlock | undefined,
  name: string,
  logo?: string,
): ComparisonProductCard {
  return {
    name,
    logo,
    score: block?.score ?? "",
    image: "",
    imageAlt: block?.title,
    video: block?.video,
    summary: block?.title,
    bullets: bulletsFromTags(block?.tags),
  };
}

const DEFAULT_OVERVIEW_ICON: OverviewIconKey = "commenting";

const SUPERFLOW_HERO_BADGES = {
  leftBadge: { label: "Developer", color: "#4dd5ff" },
  rightBadge: { label: "Designer", color: "#fc6cba" },
};

export function mapComparisonDocToConfig(
  doc: SanityComparisonDoc,
): ComparisonDetailConfig {
  const c1Name = doc.competitor1Name ?? "Superflow";
  const c2Name = doc.competitor2Name ?? "Competitor";

  // Cap to the 6 canonical factors; Sanity docs carry a stray 7th entry the
  // live site excludes. Anchor ids match the tile hrefs (#criteria-N).
  const criteria = (doc.criteria ?? []).slice(0, 6).map((c, i) => ({
    id: `criteria-${i + 1}`,
    title: c.title ?? "",
    description: c.description ?? "",
    superflow: makeProductCard(c.competitor1, c1Name, doc.competitor1Logo),
    competitor: makeProductCard(c.competitor2, c2Name, doc.competitor2Logo),
  }));

  const products: PricingProduct[] = [
    {
      name: c1Name,
      logo: doc.competitor1Logo,
      tiers: (doc.pricing ?? [])
        .filter((p) => p.c1Name || p.c1Price)
        .map((p) => ({
          planName: p.c1Name ?? "",
          price: p.c1Price ?? "",
          billing: p.c1Users,
        })),
    },
    {
      name: c2Name,
      logo: doc.competitor2Logo,
      tiers: (doc.pricing ?? [])
        .filter((p) => p.c2Name || p.c2Price)
        .map((p) => ({
          planName: p.c2Name ?? "",
          price: p.c2Price ?? "",
          billing: p.c2Users,
        })),
    },
  ];

  const testimonial =
    (doc.testimonial?.subCopy && doc.testimonial) ||
    (doc.layout2Testimonial?.subCopy && doc.layout2Testimonial) ||
    doc.testimonial ||
    doc.layout2Testimonial;

  return {
    hero: {
      eyebrow: "Comparison",
      heading: doc.title ?? `${c1Name} vs ${c2Name}`,
      ctaText: "Try Superflow for Free",
      ctaHref: "https://app.usesuperflow.com/signup",
      ...SUPERFLOW_HERO_BADGES,
    },
    reasons: SHARED_REASONS,
    criteria,
    overview: {
      heading: `How they stack up`,
      highlight: `${c1Name} vs ${c2Name}`,
      competitorName: c2Name,
      superflowName: c1Name,
      superflowLogo: doc.competitor1Logo,
      competitorLogo: doc.competitor2Logo,
      rows: criteria.map((c, i) => ({
        criterion: c.title,
        iconKey: (SHARED_REASONS.items[i]?.id as OverviewIconKey) ?? DEFAULT_OVERVIEW_ICON,
        superflowScore: c.superflow.score,
        competitorScore: c.competitor.score,
      })),
      ctaText: "Try Superflow Free",
      ctaHref: "https://app.usesuperflow.com/signup",
    },
    pricing: {
      heading: "Pricing",
      highlight: "comparison",
      products,
    },
    whyChoose: {
      heading: `Why choose Superflow over`,
      highlight: `${c1Name} or ${c2Name}`,
      bullets: [
        "Annotate live websites — no mockups required.",
        "Centralized feedback that syncs with your project tools.",
        "AI-assisted rewrites for crisp UI copy.",
      ],
      ctaText: "Try Superflow Free",
      ctaHref: "https://app.usesuperflow.com/signup",
      competitorLogo: doc.competitor2Logo,
      quote: {
        headline: testimonial?.title,
        quote: testimonial?.subCopy ?? "",
        authorName: testimonial?.name ?? "",
        authorRole: [testimonial?.role, testimonial?.company]
          .filter(Boolean)
          .join(", "),
        avatar: testimonial?.profileImage ?? "",
      },
    },
    faq: (doc.faq ?? [])
      .filter((f) => f.question)
      .map((f) => ({ q: f.question!, a: f.answer ?? "" })),
  };
}
