import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DetailPage from "@/components/detail/DetailPage";
import { userPersonaDetails } from "@/lib/detail-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = userPersonaDetails[slug];
  if (!detail) return {};
  return buildPageMetadata({
    title: detail.hero.heading,
    description:
      "Are you a designer, developer, PM? Superflow integrates seamlessly for everyone.",
    path: `/user-persona/${slug}`,
  });
}

export function generateStaticParams() {
  return Object.keys(userPersonaDetails).map((slug) => ({ slug }));
}

export default async function UserPersonaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const detail = userPersonaDetails[slug];
  if (!detail) notFound();
  return (
    <>
      <PageJsonLd
        name={detail.hero.heading}
        description="Are you a designer, developer, PM? Superflow integrates seamlessly for everyone."
        path={`/user-persona/${slug}`}
        trail={[
          { name: "User Persona", url: `${SITE_URL}/user-persona` },
          { name: detail.hero.heading, url: `${SITE_URL}/user-persona/${slug}` },
        ]}
      />
      <DetailPage config={detail} />
    </>
  );
}
