import ListingPage from "@/components/listing/ListingPage";
import { getAllAlternativePages } from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
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
    "Superflow, while being an excellent way to give feedback, just like with any software, for some, there can be a better fit due to their needs or specific issues.",
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
      <ListingPage config={config} />
    </>
  );
}
