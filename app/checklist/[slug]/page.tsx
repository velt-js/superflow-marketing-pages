import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ChecklistDetailPage from "@/components/checklist/ChecklistDetailPage";
import {
  getAllChecklistSlugs,
  getChecklistPageBySlug,
} from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getChecklistPageBySlug(slug);
  if (!doc) return {};
  const title = doc.metaTitle || doc.title;
  const description = doc.metaDescription || doc.description || "";
  const metadata = buildPageMetadata({
    title,
    description,
    path: `/checklist/${slug}`,
  });
  if (doc.noIndex && doc.noIndex.toLowerCase() === "noindex") {
    metadata.robots = { index: false, follow: false };
  }
  return metadata;
}

export async function generateStaticParams() {
  const slugs = await getAllChecklistSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ChecklistSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = await getChecklistPageBySlug(slug);
  if (!doc) notFound();

  return (
    <>
      <PageJsonLd
        name={doc.title}
        description={doc.metaDescription || doc.description || ""}
        path={`/checklist/${slug}`}
        trail={[
          { name: "Checklists", url: `${SITE_URL}/checklist` },
          { name: doc.title, url: `${SITE_URL}/checklist/${slug}` },
        ]}
      />
      <ChecklistDetailPage doc={doc} />
    </>
  );
}
