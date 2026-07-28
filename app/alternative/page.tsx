import ListingPage from "@/components/listing/ListingPage";
import { getAllAlternativePages } from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { JsonLd } from "@/app/_seo/JsonLd";
import { SITE_URL } from "@/app/_seo/schema";
import type { ListingPageConfig } from "@/lib/listing-data";

export const revalidate = 60;

interface SanityAlternativeListItem {
  _id: string;
  title?: string;
  slug?: string;
  description?: string;
  competitor1Name?: string;
  competitor2Name?: string;
  thumbnail?: string;
  competitor2Logo?: string;
}

const HERO = {
  heading: "Superflow alternatives",
  subheading:
    "Looking for something different? Browse every tool we stack up against - compare pricing, features, and fit for your creative review workflow.",
};

export const metadata = buildPageMetadata({
  title: "Superflow Alternatives",
  description: HERO.subheading,
  path: "/alternative",
  noBrandSuffix: true,
});

export default async function AlternativeIndexPage() {
  const docs = (await getAllAlternativePages()) as SanityAlternativeListItem[];

  const config: ListingPageConfig = {
    hero: HERO,
    grid: {
      variant: "icon-centered",
      items: docs
        .filter((d) => d.slug)
        .map((d) => ({
          title: d.competitor2Name ?? d.title ?? d.slug!,
          icon: d.competitor2Logo || d.thumbnail || "/images/hero/icon-world.svg",
          href: `/alternative/${d.slug}`,
        })),
    },
  };

  return (
    <>
      <PageJsonLd
        name="Superflow Alternatives"
        description={HERO.subheading}
        path="/alternative"
        trail={[{ name: "Alternatives", url: `${SITE_URL}/alternative` }]}
      />
      <JsonLd
        id="ld-alternative-itemlist"
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Superflow Alternatives",
          url: `${SITE_URL}/alternative`,
          numberOfItems: docs.filter((d) => d.slug).length,
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          itemListElement: docs
            .filter((d) => d.slug)
            .map((d, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/alternative/${d.slug}`,
              name: d.competitor2Name ?? d.title ?? d.slug,
            })),
        }}
      />
      <ListingPage config={config} />
    </>
  );
}
