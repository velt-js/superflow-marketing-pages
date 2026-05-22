import ListingPage from "@/components/listing/ListingPage";
import { alternativeListing } from "@/lib/listing-data";
import { buildPageMetadata } from "@/app/_seo/page-metadata";

export const metadata = buildPageMetadata({
  title: "Superflow Alternatives",
  description: alternativeListing.hero.subheading,
  path: "/alternative",
  noBrandSuffix: true,
});

export default function AlternativeIndexPage() {
  return <ListingPage config={alternativeListing} />;
}
