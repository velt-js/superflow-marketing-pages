// FeaturePageBody — composition for /preview/features/<slug> pages.
//
// Reuses the 2026 homepage sections (components/home-2026/*) as a shared
// template. Section order mirrors /home-preview exactly. Only the Hero, the
// Problem intro, the Feature Set and the FAQ are per-feature (Sanity-driven);
// every other section renders its hard-coded homepage default.

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

/** A tab / "features that help" row within a Feature Set block. */
export interface FeaturePageBlockTab {
  label?: string;
  icon?: string;
  oneLiner?: string;
  loss?: string;
  href?: string;
  listOnly?: boolean;
  collapsesFirstTab?: boolean;
  /**
   * Optional per-tab app-window mock. When set, activating this tab swaps the
   * block's window to this artifact (mirrors {@link FeatureSetTab.mock} on the
   * home-2026 blocks); falls back to the block-level {@link FeaturePageBlock.mock}
   * when omitted.
   */
  mock?: string;
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
    tabs?: { label?: string | null; icon?: string | null }[] | null;
  } | null;
  solution?: {
    heading?: string | null;
    subheading?: string | null;
    variant?: "checklist" | "comments" | "memory-guidelines" | "ask-ai" | null;
    /**
     * Optional single-glyph override for the section-header cue (e.g. "brain"
     * for the pink Memory brain). Omit to keep the variant's default glyph pair.
     */
    icon?: string | null;
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
/** Slug of the comments feature page that gets comment-artifact mock mapping. */
const COMMENTS_PAGE_SLUG = "comments";
/** Slug of the Ask AI feature page that gets Ask AI variant mock mapping. */
const ASK_AI_PAGE_SLUG = "ask-ai";
/**
 * "Get Started" heading for feature pages. The shared homepage default is
 * "Get Started in a minute"; the feature-page Figma frame uses this variant.
 */
const GET_STARTED_HEADING = "Get started with Agents in a minute";

/** Comments-page tab labels mapped to the best reusable artifact mock. */
const COMMENTS_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "text-comments": "text-comments",
  "text-selection-comments": "text-comments",
  "thread-comments": "thread-comments",
  "thread-replies": "thread-comments",
  mentions: "comment-mentions",
  attachment: "comment-attachment",
  attachments: "comment-attachment",
  "tracking-task-management": "tracking-task-management",
  "statuses-assignment": "tracking-task-management",
  "reactions-and-read-receipts": "reaction-read-receipt",
  "reaction-read-receipt": "reaction-read-receipt",
  "robust-anchor": "robust-anchor",
  "robust-anchors": "robust-anchor",
  "record-walkthrough": "record-walkthrough",
  "element-pinning": "pinned-comments",
  "pinned-comments": "pinned-comments",
  "snapshot-on-every-comment": "auto-screenshot",
  "private-scopes": "private-comments",
  "agent-comments": "review-agents",
};

/**
 * Ask AI-page tab labels mapped to their per-tab Ask AI variant mock. Every tab
 * shows the same chat artifact answering a different question with a different
 * answer body (breakdown bar, ranking, pattern list, signal cards or chart).
 * Applied client-side so the variants render without a Sanity re-seed; the seed
 * script carries the same per-tab mocks for anyone who re-seeds the dataset.
 */
const ASK_AI_TAB_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "plain-language-questions": "ask-ai",
  "cited-answers": "ask-ai-cited",
  "per-client-answers": "ask-ai-per-client",
  "copy-versus-bug-mix": "ask-ai-copy-vs-bug",
  "cross-project-patterns": "ask-ai-cross-project",
  "review-load-by-team": "ask-ai-load-by-team",
  "delay-and-churn-signals": "ask-ai-delay-churn",
  "analytics-on-demand": "ask-ai-analytics",
};

/** Comments-page block ids mapped to their initially visible artifact mock. */
const COMMENTS_BLOCK_MOCKS: Readonly<Record<string, FeatureSetMockName>> = {
  "block-comment": "text-comments",
  "comment-that-sticks-to-elements": "text-comments",
  "block-conversations": "thread-comments",
  "rich-conversations-with-all-media-types": "thread-comments",
  "block-seen-settled": "reaction-read-receipt",
  "seen-settled": "reaction-read-receipt",
  "block-single-system": "private-comments",
  "single-system": "private-comments",
};

/**
 * Convert arbitrary labels/ids into the slug shape used by the comments mock
 * lookup tables.
 *
 * @param value - The source label or id.
 * @returns A lowercase hyphenated key.
 */
function toLookupKey(value?: string | null): string {
  return (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolve a tab's comments-page artifact mock, preserving explicit CMS values
 * when the label is not one of the known comments artifacts.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The mock key to use, or undefined when no comments mapping applies.
 */
function getCommentsTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return COMMENTS_TAB_MOCKS?.[labelKey];
}

/**
 * Resolve the best default mock for a comments-page feature block.
 *
 * @param block - The feature block from Sanity.
 * @returns The block-level mock key, or undefined when no comments mapping applies.
 */
function getCommentsBlockMock(
  block: FeaturePageBlock,
): FeatureSetMockName | undefined {
  const idKey = toLookupKey(block?.id);
  const titleKey = toLookupKey(block?.title);
  return COMMENTS_BLOCK_MOCKS?.[idKey] ?? COMMENTS_BLOCK_MOCKS?.[titleKey];
}

/**
 * Resolve a tab's Ask AI variant mock from its label, preserving explicit CMS
 * values when the label is not one of the known Ask AI variants.
 *
 * @param tab - The feature tab from Sanity.
 * @returns The variant mock key, or undefined when no Ask AI mapping applies.
 */
function getAskAiTabMock(
  tab: FeaturePageBlockTab,
): FeatureSetMockName | undefined {
  const labelKey = toLookupKey(tab?.label);
  return ASK_AI_TAB_MOCKS?.[labelKey];
}

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
  pageSlug?: string,
): FeatureSetBlockData {
  const accent = block?.accent ?? DEFAULT_BLOCK_ACCENT;
  const isCommentsPage = pageSlug === COMMENTS_PAGE_SLUG;
  const isAskAiPage = pageSlug === ASK_AI_PAGE_SLUG;
  const tabs = (block?.tabs ?? [])
    .filter((tab) => Boolean(tab?.label))
    .map((tab) => {
      // Per-page label→mock lookups let a tab swap to its own artifact without
      // the CMS carrying an explicit mock; explicit CMS values still win.
      let resolvedMock: FeatureSetMockName | undefined;
      if (isCommentsPage) {
        resolvedMock = getCommentsTabMock(tab) ?? (tab.mock as FeatureSetMockName | undefined);
      } else if (isAskAiPage) {
        resolvedMock = getAskAiTabMock(tab) ?? (tab.mock as FeatureSetMockName | undefined);
      } else {
        resolvedMock = tab.mock as FeatureSetMockName | undefined;
      }
      return {
        label: tab.label as string,
        icon: (tab.icon ?? "grain") as FeatureSetIconName,
        oneLiner: tab.oneLiner ?? "",
        loss: tab.loss ?? "",
        href: tab.href ?? undefined,
        listOnly: tab.listOnly ?? undefined,
        collapsesFirstTab: tab.collapsesFirstTab ?? undefined,
        mock: resolvedMock,
      };
    });
  const commentsBlockMock = isCommentsPage
    ? getCommentsBlockMock(block)
    : undefined;

  return {
    id: block?.id ?? `feature-block-${index}`,
    accent,
    tint: hexToRgba(accent, BLOCK_TINT_ALPHA),
    icon: (block?.icon ?? "sparkles") as FeatureSetIconName,
    title: block?.title ?? "",
    description: block?.description ?? "",
    tabs,
    initialTabIndex: block?.initialTabIndex ?? undefined,
    mock: (commentsBlockMock ?? block?.mock ?? "workflow") as FeatureSetMockName,
  };
}

/**
 * Turn a hero-tab label into a stable, slug-like id used as the React key and
 * active-tab identifier.
 *
 * @param label - The tab label.
 * @param index - The tab's position (used when the label yields no slug).
 */
function toHeroTabId(label: string, index: number): string {
  const slug = label
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug && slug.length > 0 ? slug : `hero-tab-${index}`;
}

/**
 * Map the CMS `hero.tabs` onto the {@link HeroCmsTab} shape the shared Hero
 * expects, assigning each a stable id and dropping tabs without a label.
 *
 * @param doc - The resolved feature page document.
 * @returns The hero tabs, or `undefined` when the doc supplies none (so the
 *   shared component keeps its showcase-preset behavior).
 */
function toHeroTabs(doc: FeaturePageDoc): HeroCmsTab[] | undefined {
  const rawTabs = doc?.hero?.tabs ?? [];
  const tabs = rawTabs
    .filter((tab) => Boolean(tab?.label))
    .map((tab, index) => ({
      id: toHeroTabId(tab?.label as string, index),
      label: tab?.label as string,
      icon: tab?.icon ?? "grain",
    }));

  return tabs.length > 0 ? tabs : undefined;
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
  const heroTabs = toHeroTabs(doc);

  const solutionHeading = doc?.solution?.heading ?? undefined;
  const solutionSubheading = doc?.solution?.subheading ?? undefined;
  // The Ask AI page uses the "graphs → insight" variant. Force it client-side
  // (mirroring ASK_AI_TAB_MOCKS) so it renders without a Sanity re-seed; the
  // seed script carries the same variant for anyone who re-seeds the dataset.
  const solutionVariant =
    doc?.slug === ASK_AI_PAGE_SLUG
      ? "ask-ai"
      : (doc?.solution?.variant ?? undefined);
  const solutionIcon = doc?.solution?.icon ?? undefined;

  const featureBlocks = (doc?.featureSet?.blocks ?? [])
    .filter((block) => Boolean(block?.title))
    .map((block, index) => toFeatureSetBlock(block, index, doc?.slug));

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
        tabs={heroTabs}
      />
      <SolutionSection
        heading={solutionHeading}
        subheading={solutionSubheading}
        variant={solutionVariant}
        icon={solutionIcon}
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
