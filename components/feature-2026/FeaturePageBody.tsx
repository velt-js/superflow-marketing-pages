// FeaturePageBody — composition for /preview/features/<slug> pages.
//
// Reuses the 2026 homepage sections (components/home-2026/*) as a shared
// template. Section order mirrors /home-preview exactly. Only the Hero, the
// Problem intro, the Feature Set and the FAQ are per-feature (Sanity-driven);
// every other section renders its hard-coded homepage default.

import Hero from "@/components/home-2026/Hero";
import SolutionSection from "@/components/home-2026/SolutionSection";
import FeatureSet from "@/components/home-2026/FeatureSet";
import type {
  FeatureSetBlockData,
  FeatureSetMockName,
} from "@/components/home-2026/FeatureSetBlock";
import type { FeatureSetIconName } from "@/components/home-2026/FeatureSetIcons";
import GetStarted, {
  type GetStartedNumberedStep,
} from "@/components/home-2026/GetStarted";
import CostSection from "@/components/home-2026/CostSection";
import TestimonialsSection from "@/components/home-2026/TestimonialsSection";
import TrustSection from "@/components/home-2026/TrustSection";
import SolutionsSection from "@/components/home-2026/SolutionsSection";
import IntegrationsSection from "@/components/home-2026/IntegrationsSection";
import FaqSection, { type FaqItem } from "@/components/home-2026/FaqSection";
import SiteNav from "@/components/home-2026/SiteNav";
import SiteFooter from "@/components/home-2026/SiteFooter";

/** A tab / "features that help" row within a Feature Set block. */
export interface FeaturePageBlockTab {
  label?: string;
  icon?: string;
  oneLiner?: string;
  loss?: string;
  href?: string;
  listOnly?: boolean;
  collapsesFirstTab?: boolean;
}

/** One Feature Set block as returned by getFeaturePageBySlug. */
export interface FeaturePageBlock {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  accent?: string;
  mock?: string;
  initialTabIndex?: number;
  tabs?: FeaturePageBlockTab[] | null;
}

/** Shape returned by getFeaturePageBySlug (all sections optional). */
export interface FeaturePageDoc {
  _id: string;
  title: string;
  slug: string;
  hero?: {
    headlineLines?: string[] | null;
    subhead?: string | null;
    showcase?: "workflow" | "comments" | "review-agents" | null;
  } | null;
  solution?: {
    heading?: string | null;
    subheading?: string | null;
    variant?: "checklist" | "comments" | null;
  } | null;
  featureSet?: {
    headerTitle?: string | null;
    journeyStart?: string | null;
    journeyEnd?: string | null;
    blocks?: FeaturePageBlock[] | null;
  } | null;
  getStarted?: {
    heading?: string | null;
    subheading?: string | null;
    steps?:
      | {
          title?: string | null;
          description?: string | null;
          accent?: string | null;
        }[]
      | null;
  } | null;
  faq?: {
    heading?: string | null;
    items?: FaqItem[] | null;
  } | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
}

const DEFAULT_BLOCK_ACCENT = "#433df3";
/** Opacity of the light card wash derived from a block's accent colour. */
const BLOCK_TINT_ALPHA = 0.06;
/**
 * "Get Started" heading for feature pages. The shared homepage default is
 * "Get Started in a minute"; the feature-page Figma frame uses this variant.
 */
const GET_STARTED_HEADING = "Get started with Agents in a minute";

/**
 * Convert a `#rrggbb` (or `#rgb`) hex colour into an `rgba(r, g, b, alpha)`
 * string for the block's light background wash. Falls back to the accent as
 * given when it isn't a parseable hex value.
 *
 * @param hex - The accent colour, ideally `#rrggbb`.
 * @param alpha - Target opacity in the range 0–1.
 */
function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex?.trim().replace(/^#/, "") ?? "";
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return hex;
  }

  const red = parseInt(expanded.slice(0, 2), 16);
  const green = parseInt(expanded.slice(2, 4), 16);
  const blue = parseInt(expanded.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/**
 * Map a Sanity Feature Set block onto the `FeatureSetBlockData` shape the
 * shared home-2026 component expects, deriving the tint from the accent and
 * discarding tabs that have no label.
 *
 * @param block - The CMS block.
 * @param index - Its position in the section (used for a stable fallback id).
 */
function toFeatureSetBlock(
  block: FeaturePageBlock,
  index: number,
): FeatureSetBlockData {
  const accent = block?.accent ?? DEFAULT_BLOCK_ACCENT;
  const tabs = (block?.tabs ?? [])
    .filter((tab) => Boolean(tab?.label))
    .map((tab) => ({
      label: tab.label as string,
      icon: (tab.icon ?? "grain") as FeatureSetIconName,
      oneLiner: tab.oneLiner ?? "",
      loss: tab.loss ?? "",
      href: tab.href ?? undefined,
      listOnly: tab.listOnly ?? undefined,
      collapsesFirstTab: tab.collapsesFirstTab ?? undefined,
    }));

  return {
    id: block?.id ?? `feature-block-${index}`,
    accent,
    tint: hexToRgba(accent, BLOCK_TINT_ALPHA),
    icon: (block?.icon ?? "sparkles") as FeatureSetIconName,
    title: block?.title ?? "",
    description: block?.description ?? "",
    tabs,
    initialTabIndex: block?.initialTabIndex ?? undefined,
    mock: (block?.mock ?? "workflow") as FeatureSetMockName,
  };
}

/**
 * Map the CMS `getStarted.steps` onto the shared component's numbered-step
 * shape, dropping any step without a title.
 *
 * @param doc - The resolved feature page document.
 * @returns The numbered steps, or `undefined` when the doc supplies none (so
 *   the shared component keeps its default behavior).
 */
function toGetStartedSteps(
  doc: FeaturePageDoc,
): GetStartedNumberedStep[] | undefined {
  const rawSteps = doc?.getStarted?.steps ?? [];
  const steps = rawSteps
    .filter((step) => Boolean(step?.title))
    .map((step) => ({
      title: step?.title as string,
      description: step?.description ?? "",
      accent: step?.accent ?? undefined,
    }));

  return steps.length > 0 ? steps : undefined;
}

interface FeaturePageBodyProps {
  doc: FeaturePageDoc;
}

/**
 * Render a full CMS-driven feature page from a `featurePage` document.
 *
 * @param props - The resolved Sanity document to render.
 */
export default function FeaturePageBody({ doc }: FeaturePageBodyProps) {
  const heroHeadlineLines = doc?.hero?.headlineLines ?? undefined;
  const heroSubhead = doc?.hero?.subhead ?? undefined;
  const heroShowcase = doc?.hero?.showcase ?? undefined;

  const solutionHeading = doc?.solution?.heading ?? undefined;
  const solutionSubheading = doc?.solution?.subheading ?? undefined;
  const solutionVariant = doc?.solution?.variant ?? undefined;

  const featureBlocks = (doc?.featureSet?.blocks ?? [])
    .filter((block) => Boolean(block?.title))
    .map(toFeatureSetBlock);

  const getStartedHeading = doc?.getStarted?.heading ?? GET_STARTED_HEADING;
  const getStartedSubheading = doc?.getStarted?.subheading ?? undefined;
  const getStartedSteps = toGetStartedSteps(doc);

  const faqItems = doc?.faq?.items ?? undefined;
  const faqHeading = doc?.faq?.heading ?? undefined;

  // Section order mirrors the Figma feature-page frame (node 673:1145):
  // hero → solution → feature set → get started → solutions (industry
  // stamps) → cost → testimonials → trust → integrations → faq → footer.
  // Note there is NO Problem/clock section (unlike /home-preview), and
  // SolutionsSection sits before CostSection.
  return (
    <main>
      <SiteNav />
      <Hero
        headlineLines={heroHeadlineLines}
        subhead={heroSubhead}
        variant="feature"
        showcase={heroShowcase}
      />
      <SolutionSection
        heading={solutionHeading}
        subheading={solutionSubheading}
        variant={solutionVariant}
      />
      <FeatureSet
        headerTitle={doc?.featureSet?.headerTitle ?? undefined}
        journeyStart={doc?.featureSet?.journeyStart ?? undefined}
        journeyEnd={doc?.featureSet?.journeyEnd ?? undefined}
        blocks={featureBlocks.length > 0 ? featureBlocks : undefined}
      />
      <GetStarted
        heading={getStartedHeading}
        subheading={getStartedSubheading}
        steps={getStartedSteps}
      />
      <SolutionsSection />
      <CostSection />
      <TestimonialsSection />
      <TrustSection />
      <IntegrationsSection />
      <FaqSection heading={faqHeading} items={faqItems} />
      <SiteFooter />
    </main>
  );
}
