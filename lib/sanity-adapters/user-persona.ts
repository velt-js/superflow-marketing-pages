import { createElement } from "react";
import type {
  DetailPageConfig,
  ProblemCard,
  FeatureRowData,
  RelatedWayItem,
} from "@/lib/detail-data";
import IconBadge from "@/components/user-persona/IconBadge";
import { titleCase } from "@/lib/user-persona/format";

export interface PersonaListItem {
  _id?: string;
  title?: string;
  slug?: string;
  role?: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
}

export interface SanityUserPersonaDoc {
  _id?: string;
  title?: string;
  slug?: string;
  hidden?: boolean;
  thumbnail?: string;
  icon?: string;
  hero?: {
    role?: string;
    description?: string;
    heroCtaText?: string;
    trustLine?: string;
  };
  jobs?: SanityJob[];
  solutionTitle1?: string;
  solutionTitle2?: string;
  featureText1?: string;
  featureText2?: string;
  features?: SanityFeature[];
  othersTitle1?: string;
  othersTitle2?: string;
  outcomeOneLiner?: string;
  testimonials?: unknown;
  faq?: { question?: string; answer?: string }[];
  finalCta?: { title?: string; subText?: string };
  metaTitle?: string;
  metaDescription?: string;
  noIndex?: string;
}

interface SanityJob {
  title1?: string;
  title2?: string;
  features?: SanityJobFeature[];
}

interface SanityJobFeature {
  highlightTitle?: string;
  highlightSubText?: string;
  highlightImage?: string;
  barrierText?: string;
}

interface SanityFeature {
  title?: string;
  subText?: string;
  image?: string;
}

const FALLBACK_SHOWCASE_IMAGE = "/images/showcase/orange-bg.png";

const SUPERFLOW_HERO_BADGES = {
  leftBadge: { label: "Developer", color: "#4dd5ff" },
  rightBadge: { label: "Designer", color: "#fc6cba" },
};

export function mapUserPersonaDocToConfig(
  doc: SanityUserPersonaDoc,
  siblings: PersonaListItem[] = [],
): DetailPageConfig {
  const heading = doc.title ?? doc.hero?.role ?? "User persona";
  const job0 = doc.jobs?.[0];

  const problemCards: ProblemCard[] = (job0?.features ?? [])
    .filter((f) => f.highlightTitle || f.highlightImage)
    .slice(0, 3)
    .map((f) => ({
      title: f.highlightTitle ?? "",
      description: f.highlightSubText ?? f.barrierText ?? "",
      image: f.highlightImage ?? FALLBACK_SHOWCASE_IMAGE,
    }));

  const featureRows: FeatureRowData[] = (doc.features ?? [])
    .filter((f) => f.title || f.image)
    .map((f) => ({
      title: f.title ?? "",
      description: f.subText ?? "",
      image: f.image ?? FALLBACK_SHOWCASE_IMAGE,
      imageAlt: f.title,
    }));

  // Prefer a real section asset over the small listing thumbnail (which
  // upscales blurry). The first job feature image is large (≈1500×750).
  const showcaseImage =
    doc.jobs?.[1]?.features?.[0]?.highlightImage ??
    doc.features?.[0]?.image ??
    job0?.features?.[0]?.highlightImage ??
    FALLBACK_SHOWCASE_IMAGE;

  // Each sibling persona card uses its OWN icon + description, in a
  // dark badge so the light glyph is visible.
  const relatedItems: RelatedWayItem[] = siblings
    .filter((s) => s.slug && s.slug !== doc.slug)
    .map((s) => {
      const label = titleCase(s.role ?? s.title ?? s.slug!);
      return {
        title: label,
        description: s.description,
        href: `/user-persona/${s.slug}`,
        iconNode: createElement(IconBadge, {
          src: s.icon,
          name: label,
          size: 48,
        }),
      };
    });

  return {
    theme: "dark",
    hero: {
      eyebrow: "User Persona",
      heading,
      ctaText: doc.hero?.heroCtaText ?? "Try Superflow for Free",
      ctaHref: "https://app.usesuperflow.com/signup",
      ...SUPERFLOW_HERO_BADGES,
    },
    problem: {
      heading: job0?.title1 ?? doc.hero?.description ?? "",
      highlight: job0?.title2,
      cards: problemCards,
    },
    showcase: {
      heading: doc.solutionTitle1 ?? doc.featureText1 ?? heading,
      highlight: doc.solutionTitle2 ?? doc.featureText2,
      image: showcaseImage,
      imageAlt: doc.title,
    },
    features: featureRows,
    related: {
      heading: doc.othersTitle1 ?? "Other ways in which",
      highlight: doc.othersTitle2 ?? "Superflow can help",
      items: relatedItems,
    },
  };
}
