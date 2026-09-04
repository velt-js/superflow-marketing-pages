import { notFound } from "next/navigation";
import type { Metadata } from "next";
import UserPersonaDetailPage from "@/components/user-persona-2026/UserPersonaDetailPage";
import { resolvePersonaTitle } from "@/components/user-persona-2026/adapter";
import {
  getUserPersonaPageBySlug,
  getAllUserPersonaSlugs,
  getAllUserPersonaPages,
} from "@/sanity/lib/queries";
import type {
  SanityUserPersonaDoc,
  PersonaListItem,
} from "@/lib/sanity-adapters/user-persona";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { ogCardUrl } from "@/lib/og/card-url";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL, buildFaqPageSchema } from "@/app/_seo/schema";

/**
 * Strip HTML tags so rich-text Sanity fields serialise as plain text in
 * JSON-LD payloads.
 *
 * @param html - Raw HTML or plain text string.
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

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = (await getUserPersonaPageBySlug(slug)) as SanityUserPersonaDoc | null;
  if (!doc) return {};
  const ogImage =
    doc.thumbnail ?? doc.icon ?? ogCardUrl(doc.metaTitle ?? doc.title ?? "User Persona");
  return buildPageMetadata({
    title: doc.metaTitle ?? doc.title ?? "User Persona",
    description:
      doc.metaDescription ??
      doc.hero?.description ??
      "Are you a designer, developer, PM? Superflow integrates seamlessly for everyone.",
    path: `/user-persona/${slug}`,
    ogImage,
  });
}

export async function generateStaticParams() {
  const slugs = await getAllUserPersonaSlugs();
  return slugs.map((slug: string) => ({ slug }));
}

export default async function UserPersonaPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const [doc, siblings] = await Promise.all([
    getUserPersonaPageBySlug(slug) as Promise<SanityUserPersonaDoc | null>,
    getAllUserPersonaPages() as Promise<PersonaListItem[]>,
  ]);
  if (!doc) notFound();

  const pageTitle = resolvePersonaTitle(doc);

  const faqEntries = (doc.faq?.length)
    ? doc.faq
        .filter((item) => item?.question)
        .map((item) => ({
          question: item.question!,
          answer: stripHtml(item.answer ?? ""),
        }))
        .filter((item) => item.answer)
    : [];

  return (
    <>
      <PageJsonLd
        name={pageTitle}
        description={
          doc.metaDescription ??
          doc.hero?.description ??
          "Are you a designer, developer, PM? Superflow integrates seamlessly for everyone."
        }
        path={`/user-persona/${slug}`}
        trail={[
          { name: "User Persona", url: `${SITE_URL}/user-persona` },
          { name: pageTitle, url: `${SITE_URL}/user-persona/${slug}` },
        ]}
      />
      {faqEntries.length > 0 && (
        <JsonLd id="ld-user-persona-faq" data={buildFaqPageSchema(faqEntries)} />
      )}
      <UserPersonaDetailPage doc={doc} siblings={siblings} />
    </>
  );
}
