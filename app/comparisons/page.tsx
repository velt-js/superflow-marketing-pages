import ListingPage from "@/components/listing/ListingPage";
import { getAllComparisonPages } from "@/sanity/lib/queries";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";
import type { ListingPageConfig } from "@/lib/listing-data";

export const revalidate = 60;

interface SanityComparisonListItem {
  _id: string;
  title?: string;
  slug?: string;
  competitor1Name?: string;
  competitor2Name?: string;
  thumbnail?: string;
  heroImage?: string;
  competitor2Logo?: string;
}

const HERO = {
  heading: "How Superflow stacks up",
  subheading:
    "See how Superflow compares to other review and feedback tools — pricing, integrations, and where each one fits best.",
};

export const metadata = buildPageMetadata({
  title: "Collaboration Apps Comparisons by Superflow",
  description: HERO.subheading,
  path: "/comparisons",
  noBrandSuffix: true,
});

export default async function ComparisonIndexPage() {
  const docs = (await getAllComparisonPages()) as SanityComparisonListItem[];

  const config: ListingPageConfig = {
    hero: HERO,
    grid: {
      variant: "icon-centered",
      items: docs
        .filter((d) => d.slug)
        .map((d) => ({
          title:
            d.title ??
            (d.competitor1Name && d.competitor2Name
              ? `${d.competitor1Name} vs ${d.competitor2Name}`
              : d.slug!),
          icon:
            d.thumbnail ||
            d.heroImage ||
            d.competitor2Logo ||
            "/images/hero/icon-world.svg",
          href: `/comparisons/${d.slug}`,
        })),
    },
  };

  return (
    <>
      <PageJsonLd
        name="Collaboration Apps Comparisons by Superflow"
        description={HERO.subheading}
        path="/comparisons"
        trail={[{ name: "Comparisons", url: `${SITE_URL}/comparisons` }]}
      />
      <ListingPage config={config} />
    </>
  );
}
