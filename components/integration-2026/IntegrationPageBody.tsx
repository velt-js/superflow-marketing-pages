// IntegrationPageBody — composition for /preview/integrations/<slug> pages.
//
// Reuses the 2026 homepage sections (components/home-2026/*) as a shared
// template, exactly like FeaturePageBody does for /preview/features. Section
// order mirrors the feature pages: hero → solution → feature set → get started
// → industry solutions → cost → testimonials → trust → integrations → faq →
// footer. Only the Hero, the Solution intro, the Feature Set, the Get Started
// steps and the FAQ are per-integration (Sanity-driven); every other section
// renders its hard-coded homepage default.

import Hero from "@/components/home-2026/Hero";
import type { HeroCmsTab } from "@/components/home-2026/HeroWorkflowShowcase";
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
import {
  MondaySyncCrosses,
  MondayLinkOnce,
  MondayUnlocks,
} from "./MondaySections";

/** A tab / "features that help" row within a Feature Set block. */
export interface IntegrationPageBlockTab {
  label?: string;
  icon?: string;
  oneLiner?: string;
  loss?: string;
  href?: string;
  listOnly?: boolean;
  collapsesFirstTab?: boolean;
}

/** One Feature Set block as returned by getIntegrationPreviewPageBySlug. */
export interface IntegrationPageBlock {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  accent?: string;
  mock?: string;
  initialTabIndex?: number;
  tabs?: IntegrationPageBlockTab[] | null;
}

/** Shape returned by getIntegrationPreviewPageBySlug (all sections optional). */
export interface IntegrationPageDoc {
  _id: string;
  title: string;
  slug: string;
  family?: string | null;
  cardBlurb?: string | null;
  hero?: {
    kicker?: string | null;
    headlineLines?: string[] | null;
    subhead?: string | null;
    showcase?: "workflow" | "comments" | "review-agents" | null;
    tabs?: { label?: string | null; icon?: string | null }[] | null;
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
    blocks?: IntegrationPageBlock[] | null;
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
/** Default fallback icons so a mistyped/omitted value still renders sensibly. */
const DEFAULT_BLOCK_ICON: FeatureSetIconName = "plug";
const DEFAULT_TAB_ICON: FeatureSetIconName = "grain";
const DEFAULT_HERO_TAB_ICON = "plug";
/**
 * "Get Started" heading fallback for integration pages, matching the
 * feature-page voice when the CMS omits one.
 */
const GET_STARTED_HEADING = "Connect in a minute";

/**
 * Slug of the Monday integration page. Only this page swaps its FeatureSet +
 * GetStarted sections for the bespoke Monday sections and renders the flat,
 * Monday-only hero sync artifact; every other integration page is unchanged.
 */
const MONDAY_SLUG = "monday";

/**
 * Key selecting the Monday hero's static sync artifact (registered in
 * {@link Hero}'s `STATIC_HERO_ARTIFACTS`): the shared task-and-comment sync
 * board restricted to a single Monday logo on top.
 */
const MONDAY_HERO_ARTIFACT = "integrations-monday";

/**
 * Convert a `#rrggbb` (or `#rgb`) hex colour into an `rgba(r, g, b, alpha)`
 * string for the block's light background wash. Falls back to the accent as
 * given when it isn't a parseable hex value.
 *
 * @param hex - The accent colour, ideally `#rrggbb`.
 * @param alpha - Target opacity in the range 0–1.
 * @returns The `rgba(...)` string, or the original input when unparseable.
 */
function hexToRgba(hex: string, alpha: number): string {
  try {
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
  } catch {
    return hex;
  }
}

/**
 * Map a Sanity Feature Set block onto the `FeatureSetBlockData` shape the
 * shared home-2026 component expects, deriving the tint from the accent and
 * discarding tabs that have no label.
 *
 * @param block - The CMS block.
 * @param index - Its position in the section (used for a stable fallback id).
 * @returns The block data shaped for the shared FeatureSet component.
 */
export function toFeatureSetBlock(
  block: IntegrationPageBlock,
  index: number,
): FeatureSetBlockData {
  try {
    const accent = block?.accent ?? DEFAULT_BLOCK_ACCENT;
    const tabs = (block?.tabs ?? [])
      .filter((tab) => Boolean(tab?.label))
      .map((tab) => ({
        label: tab.label as string,
        icon: (tab.icon ?? DEFAULT_TAB_ICON) as FeatureSetIconName,
        oneLiner: tab.oneLiner ?? "",
        loss: tab.loss ?? "",
        href: tab.href ?? undefined,
        listOnly: tab.listOnly ?? undefined,
        collapsesFirstTab: tab.collapsesFirstTab ?? undefined,
      }));

    return {
      id: block?.id ?? `integration-block-${index}`,
      accent,
      tint: hexToRgba(accent, BLOCK_TINT_ALPHA),
      icon: (block?.icon ?? DEFAULT_BLOCK_ICON) as FeatureSetIconName,
      title: block?.title ?? "",
      description: block?.description ?? "",
      tabs,
      initialTabIndex: block?.initialTabIndex ?? undefined,
      mock: (block?.mock ?? "workflow") as FeatureSetMockName,
    };
  } catch {
    return {
      id: `integration-block-${index}`,
      accent: DEFAULT_BLOCK_ACCENT,
      tint: hexToRgba(DEFAULT_BLOCK_ACCENT, BLOCK_TINT_ALPHA),
      icon: DEFAULT_BLOCK_ICON,
      title: block?.title ?? "",
      description: block?.description ?? "",
      tabs: [],
      mock: "workflow",
    };
  }
}

/**
 * Turn a hero-tab label into a stable, slug-like id used as the React key and
 * active-tab identifier.
 *
 * @param label - The tab label.
 * @param index - The tab's position (used when the label yields no slug).
 * @returns A stable id for the tab.
 */
function toHeroTabId(label: string, index: number): string {
  try {
    const slug = label
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug && slug.length > 0 ? slug : `hero-tab-${index}`;
  } catch {
    return `hero-tab-${index}`;
  }
}

/**
 * Map the CMS `hero.tabs` onto the {@link HeroCmsTab} shape the shared Hero
 * expects, assigning each a stable id and dropping tabs without a label.
 *
 * @param doc - The resolved integration page document.
 * @returns The hero tabs, or `undefined` when the doc supplies none.
 */
export function mapHeroTabs(
  rawTabs: { label?: string | null; icon?: string | null }[] | null | undefined,
): HeroCmsTab[] | undefined {
  try {
    const tabs = (rawTabs ?? [])
      .filter((tab) => Boolean(tab?.label))
      .map((tab, index) => ({
        id: toHeroTabId(tab?.label as string, index),
        label: tab?.label as string,
        icon: tab?.icon ?? DEFAULT_HERO_TAB_ICON,
      }));

    return tabs.length > 0 ? tabs : undefined;
  } catch {
    return undefined;
  }
}

function toHeroTabs(doc: IntegrationPageDoc): HeroCmsTab[] | undefined {
  return mapHeroTabs(doc?.hero?.tabs);
}

/**
 * Map the CMS `getStarted.steps` onto the shared component's numbered-step
 * shape, dropping any step without a title.
 *
 * @param doc - The resolved integration page document.
 * @returns The numbered steps, or `undefined` when the doc supplies none.
 */
function toGetStartedSteps(
  doc: IntegrationPageDoc,
): GetStartedNumberedStep[] | undefined {
  try {
    const rawSteps = doc?.getStarted?.steps ?? [];
    const steps = rawSteps
      .filter((step) => Boolean(step?.title))
      .map((step) => ({
        title: step?.title as string,
        description: step?.description ?? "",
        accent: step?.accent ?? undefined,
      }));

    return steps.length > 0 ? steps : undefined;
  } catch {
    return undefined;
  }
}

interface IntegrationPageBodyProps {
  doc: IntegrationPageDoc;
}

/**
 * Render a full CMS-driven integration page from an `integrationPreviewPage`
 * document, reusing the shared 2026 home sections.
 *
 * @param props - The resolved Sanity document to render.
 */
export default function IntegrationPageBody({ doc }: IntegrationPageBodyProps) {
  const isMonday = doc?.slug === MONDAY_SLUG;
  // The kicker eyebrow is rendered on the Monday hero only, so every other
  // integration page keeps its current (eyebrow-less) hero exactly as before.
  const heroKicker = isMonday ? doc?.hero?.kicker ?? undefined : undefined;
  const heroHeadlineLines = doc?.hero?.headlineLines ?? undefined;
  const heroSubhead = doc?.hero?.subhead ?? undefined;
  const heroShowcase = doc?.hero?.showcase ?? undefined;
  const heroTabs = toHeroTabs(doc);

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

  return (
    <main>
      <SiteNav />
      <Hero
        kicker={heroKicker}
        headlineLines={heroHeadlineLines}
        subhead={heroSubhead}
        variant="feature"
        showcase={heroShowcase}
        tabs={heroTabs}
        staticArtifact={isMonday ? MONDAY_HERO_ARTIFACT : undefined}
        staticArtifactFlat={isMonday}
      />
      {isMonday ? (
        <>
          <MondaySyncCrosses />
          <MondayLinkOnce />
          <MondayUnlocks />
        </>
      ) : (
        <>
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
        </>
      )}
      {!isMonday && (
        <>
          <SolutionsSection />
          <CostSection />
        </>
      )}
      <TestimonialsSection />
      <TrustSection />
      <IntegrationsSection />
      <FaqSection heading={faqHeading} items={faqItems} />
      <SiteFooter />
    </main>
  );
}
