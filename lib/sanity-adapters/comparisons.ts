// Type narrowing for the Comp v/s Comp data returned by
// `getComparisonPageBySlug`. The renderer reads this shape directly —
// no transformation needed (unlike the alternative adapter, which
// reshapes Sanity into the legacy ComparisonDetailConfig).

export interface SanityComparisonDoc {
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  hidden?: boolean;
  author?: string;
  publishedDate?: string;
  publishedDateText?: string;
  metaTitle?: string;
  metaDescription?: string;
  noIndex?: string;

  heroImage?: string;
  thumbnail?: string;

  competitor1Name?: string;
  competitor1Logo?: string;
  competitor2Name?: string;
  competitor2Logo?: string;

  overviewC1Text?: string;
  overviewC2Text?: string;

  namedCriteria?: NamedCriterion[];
  pricingTiers?: PricingTier[];
  featureTable?: FeatureGroup[];
  superflowHighlights?: HighlightBlock[];
  alternativeHighlights?: HighlightBlock[];
  reviews?: ReviewCard[];
  faq?: { question?: string; answer?: string }[];
}

export interface NamedCriterion {
  _key?: string;
  key?: string;
  summary?: string;
  c1Image?: string;
  c1ImageAlt?: string;
  c1Video?: string;
  c2Image?: string;
  c2ImageAlt?: string;
  c2Video?: string;
}

export interface PricingTier {
  _key?: string;
  c1Price?: string;
  c1Seats?: string;
  c2Price?: string;
  c2Seats?: string;
}

export interface FeatureGroup {
  _key?: string;
  key?: string;
  rows?: FeatureRow[];
}

export interface FeatureRow {
  _key?: string;
  rowKey?: string;
  c1Available?: boolean;
  c1Text?: string;
  c2Available?: boolean;
  c2Text?: string;
}

export interface HighlightBlock {
  _key?: string;
  title?: string;
  subText?: string;
  image?: string;
  imageAlt?: string;
  videoUrl?: string;
}

export interface ReviewCard {
  _key?: string;
  side?: "c1" | "c2";
  image?: string;
  imageAlt?: string;
  name?: string;
  rating?: string;
  title?: string;
  content?: string;
}

const CRITERION_HEADINGS: Record<string, string> = {
  pure_comments: "Pure commenting",
  viewing_modes: "Viewing modes",
  authenticated_page: "Authenticated pages",
  integrations: "Integrations",
  ai_copywriting: "AI copywriting",
  private_commenting: "Private commenting",
};

export function criterionHeading(key?: string): string {
  if (!key) return "";
  return CRITERION_HEADINGS[key] ?? key.replace(/_/g, " ");
}
