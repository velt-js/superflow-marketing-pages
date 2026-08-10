import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CaseStudyDetailBody from "@/components/case-study-2026/CaseStudyDetailPage";
import {
  getAllCaseStudySlugs,
  getCaseStudyPageBySlug,
} from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { ogCardUrl } from "@/lib/og/card-url";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { ORG_ID, SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";
import type {
  CaseStudyConfig,
  CaseStudyResultMetric,
} from "@/lib/case-study-data";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Seed-style accents the live case-study design uses. CSV doesn't ship
// these, so we keep the same defaults the previous hand-rolled config used.
const DEFAULT_LEFT_BADGE = { label: "Photographer", color: "#4dd5ff" };
const DEFAULT_RIGHT_BADGE = { label: "Designer", color: "#fc6cba" };
const METRIC_TONES: CaseStudyResultMetric["tone"][] = ["teal", "blue", "amber"];

type SanityImage = { asset?: { url?: string } | null } | string | null | undefined;
type SanityFile = { asset?: { url?: string } | null } | string | null | undefined;

function imgUrl(v: SanityImage): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  return v.asset?.url ?? undefined;
}

function fileUrl(v: SanityFile): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  return v.asset?.url ?? undefined;
}

type SanityCaseStudy = {
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  thumbnail?: string;
  logo?: string;
  author?: string;
  publishedDateText?: string;
  _updatedAt?: string;
  hero?: { industry?: string; teams?: string; teamSize?: string };
  overview?: { description?: string; problem?: string; solution?: string };
  problemSection?: {
    description?: string;
    items?: Array<{ image?: SanityImage; text?: string }>;
  };
  solutionSection?: {
    description?: string;
    items?: Array<{
      tag?: string;
      title?: string;
      subText?: string;
      video?: SanityFile;
    }>;
  };
  resultsSection?: {
    description?: string;
    items?: Array<{ value?: string; text?: string }>;
  };
  testimonial?: {
    name?: string;
    role?: string;
    company?: string;
    title?: string;
    subText?: string;
    profileImage?: SanityImage;
  };
  showFaq?: boolean;
  faq?: Array<{ question: string; answer?: string }>;
};

/**
 * Strip HTML tags from a string so rich-text Sanity fields serialise as
 * plain text in JSON-LD payloads.
 *
 * @param html - Raw HTML string from Sanity (or plain text — safe either way).
 * @returns Plain text with HTML tags removed and whitespace normalised.
 */
function stripHtml(html: string): string {
  try {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return html;
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toConfig(doc: SanityCaseStudy): CaseStudyConfig {
  const hero = doc.hero ?? {};
  const overview = doc.overview ?? {};
  const problemSection = doc.problemSection ?? {};
  const solutionSection = doc.solutionSection ?? {};
  const resultsSection = doc.resultsSection ?? {};

  const problemItems = problemSection.items ?? [];
  const solutionItems = solutionSection.items ?? [];
  const resultItems = resultsSection.items ?? [];

  return {
    hero: {
      heading: doc.title ?? "",
      subtitle: doc.description ?? "",
      leftBadge: DEFAULT_LEFT_BADGE,
      rightBadge: DEFAULT_RIGHT_BADGE,
      meta: {
        industry: hero.industry ?? "",
        teamsInvolved: hero.teams ?? "",
        companySize: hero.teamSize ?? "",
      },
    },
    problemSolution: {
      heading: "The Problem & Solution",
      subtitle: overview.description ?? "",
      problem: overview.problem ?? "",
      solution: overview.solution ?? "",
    },
    barriers: {
      heading: "The Barriers",
      subtitle: problemSection.description ?? "",
      cards: problemItems.map((item, i) => ({
        number: pad(i + 1),
        image: imgUrl(item.image),
        caption: item.text ?? "",
      })),
    },
    solutions: {
      heading: "The Solution",
      subtitle: solutionSection.description ?? "",
      rows: solutionItems.map((item, i) => ({
        number: pad(i + 1),
        tag: item.tag ?? "",
        title: item.title ?? "",
        description: item.subText ?? "",
        video: fileUrl(item.video),
        reverse: i % 2 === 1,
      })),
    },
    results: {
      heading: "The Results",
      subtitle: resultsSection.description ?? "",
      metrics: resultItems.map((item, i) => ({
        value: item.value ?? "",
        label: item.text ?? "",
        size: i === 0 ? "large" : "small",
        tone: METRIC_TONES[i % METRIC_TONES.length],
      })),
    },
    testimonial: {
      headline: doc.testimonial?.title ?? "",
      quote: doc.testimonial?.subText ?? "",
      authorName: doc.testimonial?.name ?? "",
      authorRole: [doc.testimonial?.role, doc.testimonial?.company]
        .filter(Boolean)
        .join(" @ "),
      avatar: imgUrl(doc.testimonial?.profileImage) ?? "",
      badges: [],
    },
    faq:
      doc.showFaq === false
        ? []
        : (doc.faq ?? []).map((item) => ({
            q: item.question,
            a: item.answer ?? "",
          })),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = (await getCaseStudyPageBySlug(slug)) as SanityCaseStudy | null;
  if (!doc) return {};
  const title = doc.metaTitle || doc.title || "";
  const description = doc.metaDescription || doc.description || "";
  return buildPageMetadata({
    title,
    description,
    path: `/case-study/${slug}`,
    ogImage: doc.thumbnail ?? ogCardUrl(title),
  });
}

export async function generateStaticParams() {
  const slugs = await getAllCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function CaseStudyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = (await getCaseStudyPageBySlug(slug)) as SanityCaseStudy | null;
  if (!doc) notFound();
  const config = toConfig(doc);
  const canonicalUrl = `${SITE_URL}/case-study/${slug}`;
  const title = doc.metaTitle || doc.title || config.hero.heading;
  const description = doc.metaDescription || doc.description || config.hero.subtitle;

  const articleNode: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };
  if (description) articleNode.description = description;
  if (doc.thumbnail) articleNode.image = [doc.thumbnail];
  if (doc.publishedDateText) articleNode.datePublished = doc.publishedDateText;
  if (doc._updatedAt) articleNode.dateModified = doc._updatedAt;
  if (doc.author) {
    articleNode.author = { "@type": "Person", name: doc.author };
  } else {
    articleNode.author = { "@id": ORG_ID };
  }

  const faqEntries = (doc.showFaq !== false && doc.faq?.length)
    ? doc.faq.map((item) => ({
        question: item.question,
        answer: stripHtml(item.answer ?? ""),
      })).filter((item) => item.question && item.answer)
    : [];

  return (
    <>
      <PageJsonLd
        name={config.hero.heading}
        description={config.hero.subtitle}
        path={`/case-study/${slug}`}
        trail={[
          { name: "Case Studies", url: `${SITE_URL}/case-study` },
          { name: config.hero.heading, url: `${SITE_URL}/case-study/${slug}` },
        ]}
      />
      <JsonLd id="ld-case-study-article" data={articleNode} />
      {faqEntries.length > 0 && (
        <JsonLd id="ld-case-study-faq" data={buildFaqPageSchema(faqEntries)} />
      )}
      <CaseStudyDetailBody config={config} logo={doc.logo} />
    </>
  );
}
