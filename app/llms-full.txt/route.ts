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
import { TIERS } from "@/components/pricing/pricing-data";
import { CREDIT_PACKS } from "@/components/pricing-2026/ai-credits-data";

export const revalidate = 3600;

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
      `- ${pack.name} pack: ${pack.credits.toLocaleString("en-US")} credits for $${pack.priceUsd} ($${pack.annualPriceUsd} on annual plans)`,
  ).join("\n");

  return `## Pricing

Superflow is priced per seat with a free 10-day trial. Guest users are free and unlimited on every plan.

${plans}

AI agent reviews are metered in credits at one flat rate: one agent reviewing one page is one review and costs 10 credits. Three agents on one page is three reviews (30 credits). Included credits reset each billing cycle. Every new workspace gets a one-time signup bonus of 500 credits. One-time add-on packs top up any plan and roll over month to month:

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
    useCases,
    personas,
    alternatives,
    comparisons,
    caseStudies,
    checklists,
    blogPosts,
  ] = await Promise.all([
    fetchPages("featurePage"),
    fetchPages("reviewPage"),
    fetchPages("integrationPreviewPage"),
    fetchPages("useCasePage"),
    fetchPages("userPersonaPage"),
    fetchPages("alternativePage"),
    fetchPages("comparisonPage"),
    fetchPages("caseStudyPage"),
    fetchPages("checklistPage"),
    fetchBlogPosts(),
  ]);

  const liveIntegrations = integrations.filter(
    (entry) => entry.slug && !isHeldIntegrationSlug(entry.slug),
  );

  const body = [
    "# Superflow — full content for LLMs",
    "",
    "> Superflow is a website and creative-asset review tool for agencies and marketing teams. Teams leave contextual feedback on live websites, videos, PDFs, images, and Lottie animations, record videos, sync tasks to PM tools, run AI agent reviews, and ship faster with fewer review rounds.",
    "",
    "Comments sync two-way with Asana, ClickUp, Monday, Slack, Webflow, and Google Tag Manager. AI review agents catch issues (spelling, layout, links, brand) before clients do, billed in flat-rate AI credits. The link index version of this file is at " +
      `${SITE_URL}/llms.txt`,
    "",
    pricingSection(),
    pageSection("Features", "", features),
    pageSection("Review surfaces", "", reviews),
    pageSection("Integrations", "/integrations", liveIntegrations),
    pageSection("Use cases", "/use-case", useCases),
    pageSection("Personas", "/user-persona", personas),
    pageSection("Alternatives", "/alternative", alternatives),
    pageSection("Comparisons", "/comparisons", comparisons),
    pageSection("Case studies", "/case-study", caseStudies),
    pageSection("Checklists", "", checklists),
    blogSection(blogPosts),
  ]
    .filter(Boolean)
    .join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
