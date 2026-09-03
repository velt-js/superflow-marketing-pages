// /llms-full.txt — the expanded companion to /llms.txt (referenced from
// robots.txt). Where llms.txt is a link index, this endpoint inlines
// the content itself so an agent gets everything in one fetch:
//
// - the site overview and a pricing section rendered from the same
//   data modules the /pricing page uses (so it can never drift),
// - title + meta description for every Sanity-backed landing page,
// - the full text of every blog post, flattened server-side with
//   GROQ's pt::text() — one query per document type, no N+1.

import { NextResponse } from "next/server";

import { client } from "@/sanity/client";
import { isHeldIntegrationSlug } from "@/lib/integration-holds";
import { SITE_URL } from "@/app/_seo/schema";
import { stripEmDashes } from "@/app/_seo/page-metadata";
import {
  resolveSolutionPage,
  resolveSolutionSlugs,
} from "@/lib/solutions/resolve";
import {
  SOLUTIONS_BASE_PATH,
  compareSolutions,
  solutionPath,
} from "@/lib/solutions/seed";
import type { SolutionPage } from "@/lib/solutions/types";
import { TIERS } from "@/components/pricing/pricing-data";
import {
  CREDIT_PACKS,
  CREDIT_UNIT_PRICE_USD,
  SCAN_RATE_CARD,
  SIGNUP_BONUS_CREDITS,
  TYPICAL_PROJECT_CREDITS,
  getPerCreditLabel,
} from "@/components/pricing-2026/ai-credits-data";

export const revalidate = 3600;

/** Title and one-line description of the /solutions index row. */
const SOLUTIONS_INDEX_TITLE = "All solutions";
const SOLUTIONS_INDEX_DESCRIPTION =
  "Every solutions page, grouped by agency type and by job. Each one comes with an agent pack built for that work.";

type PageEntry = {
  title?: string;
  slug?: string;
  description?: string;
};

type BlogEntry = PageEntry & {
  publishedAt?: string;
  text?: string;
};

/** One-query projection of title/slug/description for a document type. */
async function fetchPages(docType: string): Promise<PageEntry[]> {
  try {
    return await client.fetch(
      `*[_type == $docType && defined(slug.current)]{
        title,
        "slug": slug.current,
        "description": coalesce(metaDescription, description)
      }`,
      { docType },
    );
  } catch {
    return [];
  }
}

type ComparisonClassEntry = PageEntry & { _type?: string };

/**
 * The 2026 comparison classes (vs, arbiter, alternatives listicles),
 * which serve at /comparisons and /alternative alongside the legacy
 * documents.
 */
async function fetchComparisonClasses(): Promise<ComparisonClassEntry[]> {
  try {
    return await client.fetch(
      `*[_type in ["comparisonPreviewVsPage", "comparisonPreviewArbiterPage", "comparisonPreviewAlternativesPage"] && defined(slug.current)]{
        _type,
        title,
        "slug": slug.current,
        "description": metaDescription
      }`,
    );
  } catch {
    return [];
  }
}

/**
 * Merge two generations of entries for one route, keeping the first
 * occurrence of each slug (callers list the 2026 documents first so
 * they win slug collisions).
 */
function dedupeBySlug(entries: PageEntry[]): PageEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (!entry.slug || seen.has(entry.slug)) return false;
    seen.add(entry.slug);
    return true;
  });
}

/** Blog posts with their portable-text body flattened to plain text. */
async function fetchBlogPosts(): Promise<BlogEntry[]> {
  try {
    return await client.fetch(
      `*[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc) {
        title,
        "slug": slug.current,
        "description": coalesce(metaDescription, description),
        publishedAt,
        "text": pt::text(body)
      }`,
    );
  } catch {
    return [];
  }
}

/**
 * Render a section of one-line page entries: linked title plus its
 * meta description.
 */
function pageSection(
  heading: string,
  basePath: string,
  entries: PageEntry[],
): string {
  const rows = entries
    .filter((entry) => entry.slug)
    .map((entry) => {
      const url = `${SITE_URL}${basePath}/${entry.slug}`;
      const description = entry.description ? `: ${entry.description}` : "";
      return `- [${entry.title ?? entry.slug}](${url})${description}`;
    });
  if (!rows.length) return "";
  return `## ${heading}\n\n${rows.join("\n")}\n`;
}

/**
 * Every solutions page, resolved the way the routes resolve them (Sanity
 * document first, seed JSON as the fallback) and sorted in nav order. The
 * solutionPage shape does not fit the generic title/slug/description GROQ
 * projection above, so the pages come through the same resolver as
 * app/solutions/[slug]. Empty on failure.
 */
async function fetchSolutionPages(): Promise<SolutionPage[]> {
  try {
    const slugs = await resolveSolutionSlugs();
    const pages = await Promise.all(
      slugs.map((slug) => resolveSolutionPage(slug)),
    );
    return pages
      .filter((page): page is SolutionPage => Boolean(page?.slug))
      .sort(compareSolutions);
  } catch {
    return [];
  }
}

/**
 * The /solutions index plus one row per page: the nav label linked, then the
 * meta description and the hero subhead so an agent gets the pitch and what
 * the pack checks in one line.
 */
function solutionsSection(pages: SolutionPage[]): string {
  const rows = [
    `- [${SOLUTIONS_INDEX_TITLE}](${SITE_URL}${SOLUTIONS_BASE_PATH}): ${SOLUTIONS_INDEX_DESCRIPTION}`,
    ...pages.map((page) => {
      const url = `${SITE_URL}${solutionPath(page.slug)}`;
      const description = [page.seo?.description, page.hero?.sub]
        .filter(Boolean)
        .join(" ");
      return `- [${page.navLabel || page.slug}](${url})${description ? `: ${description}` : ""}`;
    }),
  ];
  return `## Solutions\n\n${rows.join("\n")}\n`;
}

/** The pricing facts, rendered from the live /pricing data modules. */
function pricingSection(): string {
  const plans = TIERS.map((tier) => {
    const price = tier.customPrice
      ? "custom pricing"
      : tier.monthlyPrice === "0"
        ? "free"
        : `$${tier.monthlyPrice}/seat/month, or $${tier.annualPrice}/seat/month billed yearly`;
    const credits = tier.aiCredits
      ? tier.aiCredits.startsWith("Custom")
        ? " AI credit allowance is custom."
        : ` Includes ${tier.aiCredits}.`
      : "";
    return `- ${tier.name}: ${price}.${credits}`;
  }).join("\n");

  const packs = CREDIT_PACKS.map(
    (pack) =>
      `- ${pack.name} pack: ${pack.credits.toLocaleString("en-US")} credits for $${pack.priceUsd} (${getPerCreditLabel(pack)})`,
  ).join("\n");

  const scans = SCAN_RATE_CARD.map(
    (scope) =>
      `- ${scope.label}${scope.sublabel ? ` — ${scope.sublabel}` : ""}: ${scope.credits} credit${scope.credits === 1 ? "" : "s"}`,
  ).join("\n");

  return `## Pricing

Superflow is priced per seat with a free 10-day trial. Guest users are free and unlimited on every plan.

${plans}

AI agent scans are metered in credits: one credit is $${CREDIT_UNIT_PRICE_USD.toFixed(2)}, and one scan checks a whole site with every agent — no per-agent multiplier and no per-page math. Scans are priced by scope:

${scans}

A typical project is one medium-site scan plus four rescans: ${TYPICAL_PROJECT_CREDITS} credits. Included credits reset each billing cycle. Every new workspace gets a one-time signup bonus of ${SIGNUP_BONUS_CREDITS} credits, enough for one full scan at any size. One-time add-on packs top up any plan and roll over month to month, and auto-refill tops up $10 at a time:

${packs}
`;
}

function blogSection(posts: BlogEntry[]): string {
  const rendered = posts
    .filter((post) => post.slug)
    .map((post) => {
      const lines = [
        `### ${post.title ?? post.slug}`,
        "",
        `URL: ${SITE_URL}/blog/${post.slug}`,
      ];
      if (post.publishedAt) {
        lines.push(`Published: ${post.publishedAt.slice(0, 10)}`);
      }
      if (post.description) {
        lines.push("", post.description);
      }
      if (post.text) {
        lines.push("", post.text.trim());
      }
      return lines.join("\n");
    });
  if (!rendered.length) return "";
  return `## Blog (full text)\n\n${rendered.join("\n\n---\n\n")}\n`;
}

export async function GET() {
  const [
    features,
    reviews,
    integrations,
    solutionPages,
    alternatives,
    comparisons,
    caseStudies,
    checklists,
    blogPosts,
    comparisonClasses,
  ] = await Promise.all([
    fetchPages("featurePage"),
    fetchPages("reviewPage"),
    fetchPages("integrationPreviewPage"),
    fetchSolutionPages(),
    fetchPages("alternativePage"),
    fetchPages("comparisonPage"),
    fetchPages("caseStudyPage"),
    fetchPages("checklistPage"),
    fetchBlogPosts(),
    fetchComparisonClasses(),
  ]);

  const liveIntegrations = integrations.filter(
    (entry) => entry.slug && !isHeldIntegrationSlug(entry.slug),
  );

  // Both generations serve at the root hubs; 2026 documents win slug
  // collisions (matching app/comparisons/[slug] and app/alternative/[slug]).
  const mergedAlternatives = dedupeBySlug([
    ...comparisonClasses.filter(
      (entry) => entry._type === "comparisonPreviewAlternativesPage",
    ),
    ...alternatives,
  ]);
  const mergedComparisons = dedupeBySlug([
    ...comparisonClasses.filter(
      (entry) => entry._type !== "comparisonPreviewAlternativesPage",
    ),
    ...comparisons,
  ]);

  const body = [
    "# Superflow - full content for LLMs",
    "",
    "> Superflow is a website and creative-asset review tool for agencies and marketing teams. Teams leave contextual feedback on live websites, videos, PDFs, images, and Lottie animations, record videos, sync tasks to PM tools, run AI agent reviews, and ship faster with fewer review rounds.",
    "",
    "Comments sync two-way with Asana, ClickUp, Monday, Slack, Webflow, and Google Tag Manager. AI review agents catch issues (spelling, layout, links, brand) before clients do, billed in AI credits priced per scan. The link index version of this file is at " +
      `${SITE_URL}/llms.txt`,
    "",
    pricingSection(),
    pageSection("Features", "", features),
    pageSection("Review surfaces", "", reviews),
    pageSection("Integrations", "/integrations", liveIntegrations),
    solutionsSection(solutionPages),
    pageSection("Alternatives", "/alternative", mergedAlternatives),
    pageSection("Comparisons", "/comparisons", mergedComparisons),
    pageSection("Case studies", "/case-study", caseStudies),
    pageSection("Checklists", "", checklists),
    blogSection(blogPosts),
  ]
    .filter(Boolean)
    .join("\n");

  // CMS-sourced text (descriptions, blog bodies) can carry em dashes;
  // normalize the whole document to match the site style.
  return new NextResponse(stripEmDashes(body), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
