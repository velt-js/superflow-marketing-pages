import { titleCase } from "@/lib/user-persona/format";
import type {
  PersonaListItem,
  SanityUserPersonaDoc,
} from "@/lib/sanity-adapters/user-persona";

/** Default CTA copy/link shown in the hero when the doc omits `hero.heroCtaText`. */
const DEFAULT_CTA_TEXT = "Try Superflow for Free";
/** Signup destination shared by every persona-page CTA. */
const DEFAULT_CTA_HREF = "https://app.usesuperflow.com/signup";
/** Hero kicker shown above the persona headline. */
const DEFAULT_EYEBROW = "User Persona";
/** Placeholder art used whenever a Sanity doc omits an image. */
const FALLBACK_SHOWCASE_IMAGE = "/images/showcase/orange-bg.png";
/** Default "related personas" heading pair (mirrors the legacy adapter's copy). */
const DEFAULT_RELATED_HEADING = "Other ways in which";
const DEFAULT_RELATED_HIGHLIGHT = "Superflow can help";
/** Fallback title used when a Sanity doc is missing both `title` and `hero.role`. */
const DEFAULT_PERSONA_TITLE = "User persona";
/** Maximum number of "problem" highlight cards rendered under the hero. */
const MAX_PROBLEM_CARDS = 3;

/** Hero copy for the 2026 persona detail page. */
export interface PersonaHeroContent {
  eyebrow: string;
  heading: string;
  subhead?: string;
  ctaText: string;
  ctaHref: string;
}

/** One highlight card in the "problem" section (a job's blocking feature). */
export interface PersonaProblemCard {
  title: string;
  description: string;
  image: string;
}

/** Copy + cards for the "problem" section. */
export interface PersonaProblemContent {
  heading: string;
  highlight?: string;
  cards: PersonaProblemCard[];
}

/** Copy + hero image for the "showcase/solution" section. */
export interface PersonaShowcaseContent {
  heading: string;
  highlight?: string;
  image: string;
  imageAlt?: string;
}

/** One alternating image/text row in the feature-rows section. */
export interface PersonaFeatureRow {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
}

/** One sibling-persona card in the "related personas" section. */
export interface PersonaRelatedItem {
  title: string;
  description?: string;
  href: string;
  icon?: string;
}

/** Copy + items for the "related personas" section. */
export interface PersonaRelatedContent {
  heading: string;
  highlight?: string;
  items: PersonaRelatedItem[];
}

/** One question/answer pair, HTML already stripped for plain-text display. */
export interface PersonaFaqItem {
  question: string;
  answer: string;
}

/** Fully-resolved content the 2026 persona detail page renders. */
export interface PersonaPageContent {
  title: string;
  hero: PersonaHeroContent;
  problem: PersonaProblemContent;
  showcase: PersonaShowcaseContent;
  featureRows: PersonaFeatureRow[];
  related: PersonaRelatedContent;
  faq: PersonaFaqItem[];
}

/**
 * Resolve the display title used for a persona's headline, page metadata and
 * breadcrumb trail — shared by the route's `generateMetadata`/JSON-LD and this
 * adapter's `hero.heading` so both stay in sync.
 *
 * @param doc - The raw persona document.
 * @returns The persona's title, falling back to its hero role, then a generic label.
 */
export function resolvePersonaTitle(doc?: SanityUserPersonaDoc): string {
  try {
    return doc?.title ?? doc?.hero?.role ?? DEFAULT_PERSONA_TITLE;
  } catch {
    return DEFAULT_PERSONA_TITLE;
  }
}

/**
 * Strip HTML tags so rich-text Sanity fields render as plain text. Mirrors the
 * helper in `app/user-persona/[slug]/page.tsx` (kept local here so this
 * directory stays self-contained and does not import from the app segment).
 *
 * @param html - Raw HTML or plain text string.
 * @returns Plain text with HTML tags removed and whitespace normalised.
 */
function stripHtml(html?: string): string {
  try {
    if (!html) {
      return "";
    }
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return html ?? "";
  }
}

/** Minimal shape of one `doc.jobs[]` entry's feature, local to this adapter
 *  since `lib/sanity-adapters/user-persona.ts` does not export it. */
interface PersonaJobFeatureLike {
  highlightTitle?: string;
  highlightSubText?: string;
  highlightImage?: string;
  barrierText?: string;
}

/** Minimal shape of one `doc.jobs[]` entry, local to this adapter since
 *  `lib/sanity-adapters/user-persona.ts` does not export it. */
interface PersonaJobLike {
  title1?: string;
  title2?: string;
  features?: PersonaJobFeatureLike[];
}

/**
 * Build the "problem" section's highlight cards from the persona's first job.
 *
 * @param job0 - The first entry in `doc.jobs`, if present.
 * @returns Up to {@link MAX_PROBLEM_CARDS} highlight cards.
 */
function buildProblemCards(job0?: PersonaJobLike): PersonaProblemCard[] {
  try {
    return (job0?.features ?? [])
      .filter((feature) => Boolean(feature?.highlightTitle || feature?.highlightImage))
      .slice(0, MAX_PROBLEM_CARDS)
      .map((feature) => ({
        title: feature?.highlightTitle ?? "",
        description: feature?.highlightSubText ?? feature?.barrierText ?? "",
        image: feature?.highlightImage ?? FALLBACK_SHOWCASE_IMAGE,
      }));
  } catch {
    return [];
  }
}

/**
 * Build the alternating feature-row copy/images from `doc.features`.
 *
 * @param doc - The raw persona document.
 * @returns One row per feature that has a title or image.
 */
function buildFeatureRows(doc: SanityUserPersonaDoc): PersonaFeatureRow[] {
  try {
    return (doc?.features ?? [])
      .filter((feature) => Boolean(feature?.title || feature?.image))
      .map((feature) => ({
        title: feature?.title ?? "",
        description: feature?.subText ?? "",
        image: feature?.image ?? FALLBACK_SHOWCASE_IMAGE,
        imageAlt: feature?.title,
      }));
  } catch {
    return [];
  }
}

/**
 * Build the sibling-persona cards for the "related personas" section, using
 * each sibling's own icon + description and excluding the current persona.
 *
 * @param doc - The raw persona document (used to exclude its own slug).
 * @param siblings - Every published persona listing entry.
 * @returns The sibling cards, in the order the query returned them.
 */
function buildRelatedItems(
  doc: SanityUserPersonaDoc,
  siblings: PersonaListItem[],
): PersonaRelatedItem[] {
  try {
    return (siblings ?? [])
      .filter((sibling) => Boolean(sibling?.slug) && sibling.slug !== doc?.slug)
      .map((sibling) => {
        const label = titleCase(sibling?.role ?? sibling?.title ?? sibling?.slug ?? "");
        return {
          title: label,
          description: sibling?.description,
          href: `/user-persona/${sibling?.slug}`,
          icon: sibling?.icon,
        };
      });
  } catch {
    return [];
  }
}

/**
 * Build the plain-text FAQ items shown in the FAQ accordion, dropping any
 * entry that ends up without a question or a non-empty answer.
 *
 * @param doc - The raw persona document.
 * @returns The FAQ items, HTML stripped from every answer.
 */
function buildFaqItems(doc: SanityUserPersonaDoc): PersonaFaqItem[] {
  try {
    return (doc?.faq ?? [])
      .filter((item) => Boolean(item?.question))
      .map((item) => ({
        question: item?.question ?? "",
        answer: stripHtml(item?.answer),
      }))
      .filter((item) => item.answer.length > 0);
  } catch {
    return [];
  }
}

/**
 * Map the raw Sanity `userPersonaPage` document (plus its sibling listing
 * entries) into the fully-resolved content the 2026 persona detail page
 * composition renders. Kept independent from
 * `lib/sanity-adapters/user-persona.ts` (the legacy dark-theme adapter) so the
 * two templates can evolve without touching each other.
 *
 * @param doc - The resolved `userPersonaPage` Sanity document.
 * @param siblings - Every published persona listing entry (for cross-links).
 * @returns The content the 2026 composition renders.
 */
export function mapUserPersonaDocToPageContent(
  doc: SanityUserPersonaDoc,
  siblings: PersonaListItem[] = [],
): PersonaPageContent {
  try {
    const title = resolvePersonaTitle(doc);
    const job0 = doc?.jobs?.[0];
    const showcaseImage =
      doc?.jobs?.[1]?.features?.[0]?.highlightImage ??
      doc?.features?.[0]?.image ??
      job0?.features?.[0]?.highlightImage ??
      FALLBACK_SHOWCASE_IMAGE;

    return {
      title,
      hero: {
        eyebrow: DEFAULT_EYEBROW,
        heading: title,
        subhead: doc?.hero?.description,
        ctaText: doc?.hero?.heroCtaText ?? DEFAULT_CTA_TEXT,
        ctaHref: DEFAULT_CTA_HREF,
      },
      problem: {
        heading: job0?.title1 ?? doc?.hero?.description ?? "",
        highlight: job0?.title2,
        cards: buildProblemCards(job0),
      },
      showcase: {
        heading: doc?.solutionTitle1 ?? doc?.featureText1 ?? title,
        highlight: doc?.solutionTitle2 ?? doc?.featureText2,
        image: showcaseImage,
        imageAlt: title,
      },
      featureRows: buildFeatureRows(doc),
      related: {
        heading: doc?.othersTitle1 ?? DEFAULT_RELATED_HEADING,
        highlight: doc?.othersTitle2 ?? DEFAULT_RELATED_HIGHLIGHT,
        items: buildRelatedItems(doc, siblings),
      },
      faq: buildFaqItems(doc),
    };
  } catch {
    return {
      title: DEFAULT_PERSONA_TITLE,
      hero: {
        eyebrow: DEFAULT_EYEBROW,
        heading: DEFAULT_PERSONA_TITLE,
        ctaText: DEFAULT_CTA_TEXT,
        ctaHref: DEFAULT_CTA_HREF,
      },
      problem: { heading: "", cards: [] },
      showcase: { heading: DEFAULT_PERSONA_TITLE, image: FALLBACK_SHOWCASE_IMAGE },
      featureRows: [],
      related: {
        heading: DEFAULT_RELATED_HEADING,
        highlight: DEFAULT_RELATED_HIGHLIGHT,
        items: [],
      },
      faq: [],
    };
  }
}
