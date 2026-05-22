import ListingPage from "@/components/listing/ListingPage";
import { comparisonListing } from "@/lib/listing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";
import { PageJsonLd } from "@/app/_seo/PageJsonLd";
import { SITE_URL } from "@/app/_seo/schema";

export const metadata = buildPageMetadata({
  title: "Collaboration Apps Comparisons by Superflow",
  description: comparisonListing.hero.subheading,
  path: "/comparisons",
  noBrandSuffix: true,
});

export default function ComparisonIndexPage() {
  return (
    <>
      <PageJsonLd
        name="Collaboration Apps Comparisons by Superflow"
        description={comparisonListing.hero.subheading}
        path="/comparisons"
        trail={[{ name: "Comparisons", url: `${SITE_URL}/comparisons` }]}
      />
      <ListingPage config={comparisonListing} />
    </>
  );
}
