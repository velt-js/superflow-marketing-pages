import ListingPage from "@/components/listing/ListingPage";
import { comparisonListing } from "@/lib/listing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

export const metadata = buildPageMetadata({
  title: "Collaboration Apps Comparisons by Superflow",
  description: comparisonListing.hero.subheading,
  path: "/comparisons",
  noBrandSuffix: true,
});

export default function ComparisonIndexPage() {
  return <ListingPage config={comparisonListing} />;
}
