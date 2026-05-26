import { notFound } from "next/navigation";
import type { Metadata } from "next";
import UseCaseDetailPage from "@/components/use-case/UseCaseDetailPage";
import {
  getAllUseCaseListItems,
  getAllUseCaseSlugs,
  getUseCasePageBySlug,
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
  const doc = await getUseCasePageBySlug(slug);
  if (!doc) return {};
  const title = doc.metaTitle || doc.title;
  const description = doc.metaDescription || doc.description || "";
  const metadata = buildPageMetadata({
    title,
    description,
    path: `/use-case/${slug}`,
  });
  if (doc.noIndex && doc.noIndex.toLowerCase() === "noindex") {
    metadata.robots = { index: false, follow: false };
  }
  return metadata;
}

export async function generateStaticParams() {
  const slugs = await getAllUseCaseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function UseCaseSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const [doc, all] = await Promise.all([
    getUseCasePageBySlug(slug),
    getAllUseCaseListItems(),
  ]);
  if (!doc) notFound();

  const related = all
    .filter((item) => item.slug !== slug)
    .slice(0, 3)
    .map((item) => ({
      title: item.useCase || item.title,
      description: item.description,
      icon: item.icon || "/images/hero/icon-world.svg",
      href: `/use-case/${item.slug}`,
    }));

  return (
    <>
      <PageJsonLd
        name={doc.title}
        description={doc.metaDescription || doc.description || ""}
        path={`/use-case/${slug}`}
        trail={[
          { name: "Use Cases", url: `${SITE_URL}/use-case` },
          { name: doc.title, url: `${SITE_URL}/use-case/${slug}` },
        ]}
      />
      <UseCaseDetailPage doc={doc} related={related} />
    </>
  );
}
