import type {
  ComparisonDetailConfig,
  ComparisonProductCard,
  ComparisonBullet,
  ComparisonBulletTone,
  OverviewIconKey,
  PricingProduct,
} from "@/lib/detail-data";

// Shape returned by `getAlternativePageBySlug` after GROQ deref. Keep this
// loose — Sanity content evolves; the adapter pulls only the fields the
// renderer needs.
export interface SanityAlternativeDoc {
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

// Framer tag color enum → renderer tone. Anything outside the known set
// degrades to "warn" so a typo doesn't blow up rendering.
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

// ComparisonProductCard.image is a still asset (the existing renderer
// shows it as a frame above the bullets). Framer ships videos here; until
// we extract thumbnails we degrade to an empty string + the competitor
// logo handles brand recognition.
function makeProductCard(
  block: SanityCompetitorBlock | undefined,
  name: string,
  logo?: string,
): ComparisonProductCard {
  return {
    name,
    logo,
    score: block?.score ?? "",
    image: "", // see note above
    imageAlt: block?.title,
    video: block?.video,
    summary: block?.title,
    bullets: bulletsFromTags(block?.tags),
  };
}

const DEFAULT_OVERVIEW_ICON: OverviewIconKey = "commenting";

export function mapAlternativeDocToConfig(
  doc: SanityAlternativeDoc,
): ComparisonDetailConfig {
  const c1Name = doc.competitor1Name ?? "Superflow";
  const c2Name = doc.competitor2Name ?? "Alternative";

  const criteria = (doc.criteria ?? []).map((c, i) => ({
    id: c._key ?? `criterion-${i}`,
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

  // Prefer whichever testimonial actually has a body. The Framer CSV
  // splits `sub_copy` (layout 1) and `sub_text` (layout 2) — sometimes
  // only one is populated.
  const testimonial =
    (doc.testimonial?.subCopy && doc.testimonial) ||
    (doc.layout2Testimonial?.subCopy && doc.layout2Testimonial) ||
    doc.testimonial ||
    doc.layout2Testimonial;

  return {
    hero: {
      variant: "alternative",
      eyebrow: "Alternative",
      heading: doc.title ?? `${c2Name} Alternative`,
      subheading: doc.description,
      ctaText: "Try Superflow for Free",
      ctaHref: "https://app.usesuperflow.com/signup",
    },
    reasons: {
      heading: `Why teams pick Superflow over`,
      highlight: c2Name,
      items: [
        { id: "speed", label: "10× faster reviews", icon: "/images/hero/icon-world.svg" },
        { id: "context", label: "Comments on the live site", icon: "/images/hero/icon-world.svg" },
        { id: "integrations", label: "Connects to Slack, Asana, ClickUp", icon: "/images/hero/icon-world.svg" },
      ],
    },
    criteria,
    overview: {
      heading: `How Superflow stacks up against`,
      highlight: c2Name,
      competitorName: c2Name,
      superflowLogo: doc.competitor1Logo,
      competitorLogo: doc.competitor2Logo,
      rows: criteria.map((c) => ({
        criterion: c.title,
        iconKey: DEFAULT_OVERVIEW_ICON,
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
      highlight: c2Name,
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
