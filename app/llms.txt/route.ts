import { NextResponse } from "next/server";

import {
  getAllAlternativeSlugs,
  getAllBlogSlugs,
  getAllCaseStudySlugs,
  getAllChecklistSlugs,
  getAllComparisonSlugs,
  getAllIntegrationSlugs,
  getAllReviewSlugs,
  getAllUseCaseSlugs,
  getAllUserPersonaSlugs,
} from "@/sanity/lib/queries";

const SITE_URL = "https://usesuperflow.com";

export const revalidate = 3600;

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

async function safeFetch(fn: () => Promise<string[]>): Promise<string[]> {
  try {
    return await fn();
  } catch {
    return [];
  }
}

function toTitle(slug: string): string {
  return slug
    .split("-")
    .map((part) => (part.length ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

function section(heading: string, links: { path: string; title: string }[]): string {
  if (!links.length) return "";
  const body = links.map((l) => `- [${l.title}](${SITE_URL}${l.path})`).join("\n");
  return `## ${heading}\n${body}\n`;
}

export async function GET() {
  const [
    blogSlugs,
    integrationSlugsCms,
    useCaseSlugsCms,
    caseStudySlugsCms,
    userPersonaSlugsCms,
    alternativeSlugsCms,
    comparisonSlugsCms,
    reviewSlugs,
    checklistSlugs,
  ] = await Promise.all([
    safeFetch(getAllBlogSlugs),
    safeFetch(getAllIntegrationSlugs),
    safeFetch(getAllUseCaseSlugs),
    safeFetch(getAllCaseStudySlugs),
    safeFetch(getAllUserPersonaSlugs),
    safeFetch(getAllAlternativeSlugs),
    safeFetch(getAllComparisonSlugs),
    safeFetch(getAllReviewSlugs),
    safeFetch(getAllChecklistSlugs),
  ]);

  const core = [
    { path: "/", title: "Home" },
    { path: "/pricing", title: "Pricing" },
    { path: "/security", title: "Security" },
    { path: "/book-demo", title: "Book a demo" },
    { path: "/demo", title: "Product demo" },
    { path: "/calculator", title: "ROI calculator" },
    { path: "/affiliate", title: "Affiliate program" },
    { path: "/blog", title: "Blog" },
    { path: "/privacy", title: "Privacy policy" },
    { path: "/terms", title: "Terms of service" },
  ];

  const integrations = unique(integrationSlugsCms).map((slug) => ({
    path: `/integrations/${slug}`,
    title: `${toTitle(slug)} integration`,
  }));

  const useCases = unique(useCaseSlugsCms).map((slug) => ({
    path: `/use-case/${slug}`,
    title: toTitle(slug),
  }));

  const personas = unique(userPersonaSlugsCms).map((slug) => ({
    path: `/user-persona/${slug}`,
    title: toTitle(slug),
  }));

  const alternatives = unique(alternativeSlugsCms).map((slug) => ({
    path: `/alternative/${slug}`,
    title: toTitle(slug),
  }));

  const comparisons = unique(comparisonSlugsCms).map((slug) => ({
    path: `/comparisons/${slug}`,
    title: toTitle(slug),
  }));

  const caseStudies = unique(caseStudySlugsCms).map((slug) => ({
    path: `/case-study/${slug}`,
    title: toTitle(slug),
  }));

  const reviews = unique(reviewSlugs).map((slug) => ({
    path: `/${slug}`,
    title: toTitle(slug),
  }));

  const blogs = unique(blogSlugs).map((slug) => ({
    path: `/blog/${slug}`,
    title: toTitle(slug),
  }));

  const checklists = unique(checklistSlugs).map((slug) => ({
    path: `/${slug}`,
    title: toTitle(slug),
  }));

  const body = [
    "# Superflow",
    "> Superflow is a website and creative-asset review tool. Teams leave contextual feedback, record videos, sync tasks to PM tools, and ship faster with fewer review rounds.",
    "",
    "Superflow supports review on live websites, staging environments, PDFs, images, videos, and Lottie animations. Comments sync two-way with Asana, ClickUp, Monday, Slack, Webflow, and Google Tag Manager.",
    "",
    section("Core pages", core),
    section("Review surfaces", reviews),
    section("Integrations", integrations),
    section("Use cases", useCases),
    section("Personas", personas),
    section("Alternatives", alternatives),
    section("Comparisons", comparisons),
    section("Case studies", caseStudies),
    section("Checklists", checklists),
    section("Blog", blogs),
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
