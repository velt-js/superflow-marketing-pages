import { redirect } from "next/navigation";
import BugBookDetailBody from "@/components/bug-book-2026/BugBookDetailBody";
import {
  getAllBugBookEntries,
  getAllBugBookSlugs,
  getBugBookEntryBySlug,
} from "@/sanity/lib/queries";
import { sortEntries, type BugBookListEntry } from "@/lib/bug-book";
import { JsonLd } from "@/app/_seo/JsonLd";
import {
  ORG_ID,
  ORG_NAME,
  SITE_URL,
  buildBreadcrumbList,
} from "@/app/_seo/schema";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

export const revalidate = 60;

const RELATED_LIMIT = 6;

/**
 * Up to 6 related entries: same category first, then same source,
 * self excluded — in curated order within each group.
 */
function pickRelated(
  all: BugBookListEntry[],
  entry: { slug: string; category: string; source: string },
): BugBookListEntry[] {
  const others = sortEntries(
    all.filter((candidate) => candidate.slug !== entry.slug),
    "curated",
  );
  const sameCategory = others.filter(
    (candidate) => candidate.category === entry.category,
  );
  const sameSource = others.filter(
    (candidate) =>
      candidate.category !== entry.category &&
      candidate.source === entry.source,
  );
  return [...sameCategory, ...sameSource].slice(0, RELATED_LIMIT);
}

export async function generateStaticParams() {
  const slugs = await getAllBugBookSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getBugBookEntryBySlug(slug);
  if (!entry) return {};
  const title = `${entry.headline} - The Superflow Bug Book`;
  const metadata = buildPageMetadata({
    title,
    description: entry.hook ?? entry.headline,
    path: `/bug-book/${slug}`,
    noBrandSuffix: true,
  });
  if (metadata.openGraph) {
    (metadata.openGraph as Record<string, unknown>).type = "article";
  }
  return metadata;
}

export default async function BugBookEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getBugBookEntryBySlug(slug);

  // Bench entries and unknown slugs both land here — send them to the
  // collection rather than a 404 (bench slugs may be publicly referenced
  // and rotate back in later).
  if (!entry) {
    redirect("/bug-book");
  }

  const all = await getAllBugBookEntries();
  const related = pickRelated(all, entry);

  const pageUrl = `${SITE_URL}/bug-book/${slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.headline,
    description: entry.hook ?? entry.headline,
    url: pageUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    datePublished: `${entry.date}-01`,
    author: { "@type": "Organization", name: ORG_NAME },
    publisher: { "@id": ORG_ID },
    articleSection: entry.category,
  };
  const breadcrumb = buildBreadcrumbList([
    { name: "Home", url: SITE_URL },
    { name: "Bug Book", url: `${SITE_URL}/bug-book` },
    { name: entry.headline, url: pageUrl },
  ]);

  return (
    <>
      <JsonLd id="ld-bug-book-article" data={articleSchema} />
      <JsonLd id="ld-bug-book-article-breadcrumb" data={breadcrumb} />
      <BugBookDetailBody entry={entry} related={related} />
    </>
  );
}
