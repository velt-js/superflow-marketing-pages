import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DetailPage from "@/components/detail/DetailPage";
import {
  getUserPersonaPageBySlug,
  getAllUserPersonaSlugs,
  getAllUserPersonaPages,
} from "@/sanity/lib/queries";
import {
  mapUserPersonaDocToConfig,
  type SanityUserPersonaDoc,
  type PersonaListItem,
} from "@/lib/sanity-adapters/user-persona";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = (await getUserPersonaPageBySlug(slug)) as SanityUserPersonaDoc | null;
  if (!doc) return {};
  return buildPageMetadata({
    title: doc.metaTitle ?? doc.title ?? "User Persona",
    description:
      doc.metaDescription ??
      doc.hero?.description ??
      "Are you a designer, developer, PM? Superflow integrates seamlessly for everyone.",
    path: `/user-persona/${slug}`,
  });
}

export async function generateStaticParams() {
  const slugs = await getAllUserPersonaSlugs();
  return slugs.map((slug: string) => ({ slug }));
}

export default async function UserPersonaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [doc, siblings] = await Promise.all([
    getUserPersonaPageBySlug(slug) as Promise<SanityUserPersonaDoc | null>,
    getAllUserPersonaPages() as Promise<PersonaListItem[]>,
  ]);
  if (!doc) notFound();

  const config = mapUserPersonaDocToConfig(doc, siblings);

  return (
    <>
      <PageJsonLd
        name={config.hero.heading}
        description={
          doc.metaDescription ??
          doc.hero?.description ??
          "Are you a designer, developer, PM? Superflow integrates seamlessly for everyone."
        }
        path={`/user-persona/${slug}`}
        trail={[
          { name: "User Persona", url: `${SITE_URL}/user-persona` },
          { name: config.hero.heading, url: `${SITE_URL}/user-persona/${slug}` },
        ]}
      />
      <DetailPage config={config} />
    </>
  );
}
