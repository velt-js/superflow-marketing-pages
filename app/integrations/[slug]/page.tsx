import { notFound } from "next/navigation";
import type { Metadata } from "next";
import IntegrationDetailPage from "@/components/detail/IntegrationDetailPage";
import {
  getAllIntegrationSlugs,
  getAllIntegrationListItems,
  getIntegrationPageBySlug,
} from "@/sanity/lib/queries";
import { isHeldIntegrationSlug } from "@/lib/integration-holds";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { ORG_ID, SITE_URL } from "@/app/_seo/schema";

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
  // Held pages (see lib/integration-holds.ts) must never publish metadata.
  if (isHeldIntegrationSlug(slug)) return {};
  const doc = await getIntegrationPageBySlug(slug);
  if (!doc) return {};
  const title = doc.metaTitle || doc.title;
  const description = doc.metaDescription || "";
  const ogImage = doc.appLogo ?? doc.thumbnail;
  return buildPageMetadata({
    title,
    description,
    path: `/integrations/${slug}`,
    ...(ogImage ? { ogImage } : {}),
  });
}

export async function generateStaticParams() {
  const slugs = await getAllIntegrationSlugs();
  return slugs
    .filter((slug) => !isHeldIntegrationSlug(slug))
    .map((slug) => ({ slug }));
}

export default async function IntegrationSlugPage({ params }: PageProps) {
  const { slug } = await params;
  // Enforced publication hold: held connectors 404 on the live route even if a
  // CMS document exists. Lift via lib/integration-holds.ts only.
  if (isHeldIntegrationSlug(slug)) notFound();
  const [doc, all] = await Promise.all([
    getIntegrationPageBySlug(slug),
    getAllIntegrationListItems(),
  ]);
  if (!doc) notFound();

  const heading = doc.title;
  const canonicalUrl = `${SITE_URL}/integrations/${slug}`;
  const otherIntegrations = all
    .filter((item) => item.slug !== slug && !isHeldIntegrationSlug(item.slug))
    .map((item) => ({
      name: item.appName || item.title,
      icon: item.appLogo || "/images/hero/icon-world.svg",
      href: `/integrations/${item.slug}`,
    }));

  const softwareAppNode: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: doc.appName ?? heading,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: canonicalUrl,
    creator: { "@id": ORG_ID },
  };

  type IntegrationStep = { title?: string; body?: string };
  const steps: IntegrationStep[] = Array.isArray(doc.steps) ? doc.steps : [];
  const howToNode: Record<string, unknown> | null = steps.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `How to connect ${doc.appName ?? heading} with Superflow`,
        step: steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title ?? "",
          text: stripHtml(step.body ?? ""),
        })),
      }
    : null;

  return (
    <>
      <PageJsonLd
        name={heading}
        description={doc.metaDescription || ""}
        path={`/integrations/${slug}`}
        trail={[
          { name: "Integrations", url: `${SITE_URL}/integrations` },
          { name: heading, url: `${SITE_URL}/integrations/${slug}` },
        ]}
      />
      <JsonLd id="ld-integration-software" data={softwareAppNode} />
      {howToNode && (
        <JsonLd id="ld-integration-howto" data={howToNode} />
      )}
      <IntegrationDetailPage doc={doc} otherIntegrations={otherIntegrations} />
    </>
  );
}
